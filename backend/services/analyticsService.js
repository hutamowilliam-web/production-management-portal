// backend/services/analyticsService.js
// Analytics calculation and data retrieval service for Power Apps/Canvas Apps integration

const mysql = require('mysql2/promise');
const pool = mysql.createPool(require('../config/database'));
const logger = require('./activityLogger');

class AnalyticsService {
  constructor() {
    this.cacheTime = 5 * 60 * 1000; // 5 minutes cache
    this.metrics = {};
  }

  /**
   * Get dashboard statistics for a department
   * @param {number} departmentId - Department ID
   * @param {object} options - Query options (dateFrom, dateTo, formId)
   * @returns {Promise<object>} Dashboard statistics
   */
  async getDashboardStats(departmentId, options = {}) {
    try {
      const connection = await pool.getConnection();
      const { dateFrom, dateTo, formId } = options;
      
      // Default to last 30 days if not specified
      const from = dateFrom ? new Date(dateFrom) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = dateTo ? new Date(dateTo) : new Date();

      // Get total forms for department
      const [formsResult] = await connection.query(
        `SELECT COUNT(*) as total FROM forms WHERE department_id = ?`,
        [departmentId]
      );
      const totalForms = formsResult[0].total;

      // Get total responses
      const [responsesResult] = await connection.query(
        `SELECT COUNT(*) as total FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND created_at BETWEEN ? AND ?`,
        [departmentId, from, to]
      );
      const totalResponses = responsesResult[0].total;

      // Get pending responses
      const [pendingResult] = await connection.query(
        `SELECT COUNT(*) as total FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND status = 'pending'
         AND created_at BETWEEN ? AND ?`,
        [departmentId, from, to]
      );
      const pendingResponses = pendingResult[0].total;

      // Get completed responses
      const [completedResult] = await connection.query(
        `SELECT COUNT(*) as total FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND status = 'completed'
         AND created_at BETWEEN ? AND ?`,
        [departmentId, from, to]
      );
      const completedResponses = completedResult[0].total;

      // Get rejected responses
      const [rejectedResult] = await connection.query(
        `SELECT COUNT(*) as total FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND status = 'rejected'
         AND created_at BETWEEN ? AND ?`,
        [departmentId, from, to]
      );
      const rejectedResponses = rejectedResult[0].total;

      // Get average response time
      const [avgTimeResult] = await connection.query(
        `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours
         FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND created_at BETWEEN ? AND ?`,
        [departmentId, from, to]
      );
      const avgResponseTime = avgTimeResult[0].avg_hours || 0;

      // Get completion rate
      const completionRate = totalResponses > 0 
        ? ((completedResponses / totalResponses) * 100).toFixed(2)
        : 0;

      // Get rejection rate
      const rejectionRate = totalResponses > 0 
        ? ((rejectedResponses / totalResponses) * 100).toFixed(2)
        : 0;

      connection.release();

      return {
        totalForms,
        totalResponses,
        pendingResponses,
        completedResponses,
        rejectedResponses,
        avgResponseTime: parseFloat(avgResponseTime.toFixed(2)),
        completionRate: parseFloat(completionRate),
        rejectionRate: parseFloat(rejectionRate),
        dateFrom: from,
        dateTo: to
      };
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getDashboardStats', { error: error.message });
      throw error;
    }
  }

  /**
   * Get form submission trends
   * @param {number} departmentId - Department ID
   * @param {string} period - Period ('day', 'week', 'month', 'year')
   * @returns {Promise<array>} Trend data
   */
  async getSubmissionTrends(departmentId, period = 'week') {
    try {
      const connection = await pool.getConnection();
      
      let dateFormat = '%Y-%m-%d'; // Default: daily
      let daysBack = 7;
      
      if (period === 'month') {
        dateFormat = '%Y-%m-%d';
        daysBack = 30;
      } else if (period === 'year') {
        dateFormat = '%Y-%m';
        daysBack = 365;
      }

      const fromDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      const [results] = await connection.query(
        `SELECT 
          DATE_FORMAT(created_at, ?) as date_period,
          COUNT(*) as submission_count,
          COUNT(DISTINCT form_id) as unique_forms
         FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND created_at >= ?
         GROUP BY DATE_FORMAT(created_at, ?)
         ORDER BY date_period ASC`,
        [dateFormat, departmentId, fromDate, dateFormat]
      );

      connection.release();
      return results;
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getSubmissionTrends', { error: error.message });
      throw error;
    }
  }

  /**
   * Get response time analytics
   * @param {number} departmentId - Department ID
   * @param {number} formId - Optional: specific form
   * @returns {Promise<object>} Response time statistics
   */
  async getResponseTimeAnalytics(departmentId, formId = null) {
    try {
      const connection = await pool.getConnection();
      
      let query = `
        SELECT 
          MIN(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as min_hours,
          MAX(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as max_hours,
          AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours,
          STDDEV(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as stddev_hours,
          COUNT(*) as total_responses,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, updated_at) <= 24 THEN 1 END) as completed_within_24h,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, created_at, updated_at) > 48 THEN 1 END) as delayed_responses
        FROM form_responses 
        WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
      `;
      
      const params = [departmentId];
      
      if (formId) {
        query += ` AND form_id = ?`;
        params.push(formId);
      }

      const [results] = await connection.query(query, params);
      connection.release();

      return {
        minHours: results[0].min_hours || 0,
        maxHours: results[0].max_hours || 0,
        avgHours: parseFloat((results[0].avg_hours || 0).toFixed(2)),
        stddevHours: parseFloat((results[0].stddev_hours || 0).toFixed(2)),
        totalResponses: results[0].total_responses,
        completedWithin24h: results[0].completed_within_24h,
        delayedResponses: results[0].delayed_responses,
        onTimePercentage: results[0].total_responses > 0
          ? ((results[0].completed_within_24h / results[0].total_responses) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getResponseTimeAnalytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get rejection analytics
   * @param {number} departmentId - Department ID
   * @returns {Promise<array>} Rejection data by reason
   */
  async getRejectionAnalytics(departmentId) {
    try {
      const connection = await pool.getConnection();

      const [results] = await connection.query(
        `SELECT 
          rejection_reason,
          COUNT(*) as rejection_count,
          COUNT(DISTINCT form_id) as affected_forms,
          ROUND((COUNT(*) / (SELECT COUNT(*) FROM form_responses 
            WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
            AND status = 'rejected')) * 100, 2) as percentage
         FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND status = 'rejected'
         AND rejection_reason IS NOT NULL
         GROUP BY rejection_reason
         ORDER BY rejection_count DESC`,
        [departmentId, departmentId]
      );

      connection.release();
      return results;
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getRejectionAnalytics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get form-specific performance metrics
   * @param {number} departmentId - Department ID
   * @returns {Promise<array>} Per-form metrics
   */
  async getFormPerformanceMetrics(departmentId) {
    try {
      const connection = await pool.getConnection();

      const [results] = await connection.query(
        `SELECT 
          f.id,
          f.name,
          COUNT(fr.id) as total_responses,
          COUNT(CASE WHEN fr.status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN fr.status = 'rejected' THEN 1 END) as rejected,
          COUNT(CASE WHEN fr.status = 'pending' THEN 1 END) as pending,
          AVG(TIMESTAMPDIFF(HOUR, fr.created_at, fr.updated_at)) as avg_response_hours,
          ROUND((COUNT(CASE WHEN fr.status = 'completed' THEN 1 END) / COUNT(fr.id)) * 100, 2) as completion_rate
         FROM forms f
         LEFT JOIN form_responses fr ON f.id = fr.form_id
         WHERE f.department_id = ?
         GROUP BY f.id, f.name
         ORDER BY total_responses DESC`,
        [departmentId]
      );

      connection.release();
      return results;
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getFormPerformanceMetrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user productivity metrics
   * @param {number} departmentId - Department ID
   * @returns {Promise<array>} User productivity data
   */
  async getUserProductivityMetrics(departmentId) {
    try {
      const connection = await pool.getConnection();

      const [results] = await connection.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          COUNT(fr.id) as responses_submitted,
          COUNT(DISTINCT fr.form_id) as unique_forms,
          MAX(fr.created_at) as last_response_date,
          ROUND(AVG(TIMESTAMPDIFF(HOUR, fr.created_at, fr.updated_at)), 2) as avg_response_time
         FROM users u
         LEFT JOIN form_responses fr ON u.id = fr.submitted_by
         WHERE u.department_id = ?
         AND u.role IN ('user', 'manager')
         GROUP BY u.id, u.name, u.email
         ORDER BY responses_submitted DESC`,
        [departmentId]
      );

      connection.release();
      return results;
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getUserProductivityMetrics', { error: error.message });
      throw error;
    }
  }

  /**
   * Compare metrics across multiple departments
   * @param {array} departmentIds - Array of department IDs
   * @returns {Promise<array>} Comparison data
   */
  async compareDepartmentPerformance(departmentIds) {
    try {
      const connection = await pool.getConnection();

      const placeholders = departmentIds.map(() => '?').join(',');
      
      const [results] = await connection.query(
        `SELECT 
          d.id,
          d.name,
          COUNT(f.id) as total_forms,
          COUNT(fr.id) as total_responses,
          COUNT(CASE WHEN fr.status = 'completed' THEN 1 END) as completed_responses,
          COUNT(CASE WHEN fr.status = 'rejected' THEN 1 END) as rejected_responses,
          ROUND((COUNT(CASE WHEN fr.status = 'completed' THEN 1 END) / COUNT(fr.id)) * 100, 2) as completion_rate,
          AVG(TIMESTAMPDIFF(HOUR, fr.created_at, fr.updated_at)) as avg_response_hours
         FROM departments d
         LEFT JOIN forms f ON d.id = f.department_id
         LEFT JOIN form_responses fr ON f.id = fr.form_id
         WHERE d.id IN (${placeholders})
         GROUP BY d.id, d.name
         ORDER BY completion_rate DESC`,
        departmentIds
      );

      connection.release();
      return results;
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'compareDepartmentPerformance', { error: error.message });
      throw error;
    }
  }

  /**
   * Get anomalies and alerts
   * @param {number} departmentId - Department ID
   * @param {number} threshold - Standard deviation threshold
   * @returns {Promise<array>} Anomaly data
   */
  async detectAnomalies(departmentId, threshold = 2) {
    try {
      const connection = await pool.getConnection();

      // Get average and stddev for response times
      const [statsResult] = await connection.query(
        `SELECT 
          AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours,
          STDDEV(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as stddev_hours
         FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)`,
        [departmentId]
      );

      const avgHours = statsResult[0].avg_hours || 0;
      const stddevHours = statsResult[0].stddev_hours || 1;
      const upperBound = avgHours + (threshold * stddevHours);

      // Find anomalies
      const [anomalies] = await connection.query(
        `SELECT 
          fr.id,
          f.name as form_name,
          fr.submitted_by,
          u.name as user_name,
          TIMESTAMPDIFF(HOUR, fr.created_at, fr.updated_at) as response_hours,
          fr.status,
          fr.created_at
         FROM form_responses fr
         JOIN forms f ON fr.form_id = f.id
         JOIN users u ON fr.submitted_by = u.id
         WHERE f.department_id = ?
         AND TIMESTAMPDIFF(HOUR, fr.created_at, fr.updated_at) > ?
         ORDER BY response_hours DESC
         LIMIT 20`,
        [departmentId, upperBound]
      );

      connection.release();

      return {
        averageHours: parseFloat(avgHours.toFixed(2)),
        stddevHours: parseFloat(stddevHours.toFixed(2)),
        threshold,
        upperBound: parseFloat(upperBound.toFixed(2)),
        anomalies
      };
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'detectAnomalies', { error: error.message });
      throw error;
    }
  }

  /**
   * Get real-time dashboard metrics
   * @param {number} departmentId - Department ID
   * @returns {Promise<object>} Real-time metrics
   */
  async getRealTimeMetrics(departmentId) {
    try {
      const connection = await pool.getConnection();
      
      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [todayStats] = await connection.query(
        `SELECT 
          COUNT(*) as today_submissions,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as today_completed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as today_pending
         FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND DATE(created_at) = ?`,
        [departmentId, today]
      );

      const [pendingCount] = await connection.query(
        `SELECT COUNT(*) as count FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND status = 'pending'`,
        [departmentId]
      );

      const [activeUsers] = await connection.query(
        `SELECT COUNT(DISTINCT submitted_by) as count FROM form_responses 
         WHERE form_id IN (SELECT id FROM forms WHERE department_id = ?)
         AND DATE(created_at) = ?`,
        [departmentId, today]
      );

      connection.release();

      return {
        todaySubmissions: todayStats[0].today_submissions,
        todayCompleted: todayStats[0].today_completed,
        todayPending: todayStats[0].today_pending,
        totalPending: pendingCount[0].count,
        activeUsersToday: activeUsers[0].count
      };
    } catch (error) {
      logger.logActivity(null, 'ANALYTICS_ERROR', 'getRealTimeMetrics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
