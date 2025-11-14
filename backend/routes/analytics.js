// backend/routes/analytics.js
// Analytics API endpoints for Power Apps/Canvas Apps integration

const express = require('express');
const router = express.Router();
const { validateJWT } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');
const analyticsService = require('../services/analyticsService');
const logger = require('../services/activityLogger');

// Middleware to check authorization
const checkDepartmentAccess = async (req, res, next) => {
  try {
    const departmentId = parseInt(req.params.departmentId || req.body.departmentId);
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin can access all departments
    if (userRole === 'admin') {
      next();
      return;
    }

    // Check if user belongs to the department
    const connection = await require('mysql2/promise').createPool(require('../config/database')).getConnection();
    const [result] = await connection.query(
      'SELECT department_id FROM users WHERE id = ?',
      [userId]
    );
    connection.release();

    if (result[0] && result[0].department_id === departmentId) {
      next();
    } else {
      res.status(403).json({ success: false, error: 'Access denied to this department' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/analytics/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'analytics',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/analytics/dashboard/:departmentId
 * Get comprehensive dashboard statistics for a department
 */
router.get(
  '/dashboard/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const departmentId = parseInt(req.params.departmentId);
      const { dateFrom, dateTo, formId } = req.query;

      const stats = await analyticsService.getDashboardStats(departmentId, {
        dateFrom,
        dateTo,
        formId: formId ? parseInt(formId) : null
      });

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'dashboard', { departmentId });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'dashboard', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/trends/:departmentId
 * Get submission trends over time
 */
router.get(
  '/trends/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  query('period').isIn(['day', 'week', 'month', 'year']).optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const departmentId = parseInt(req.params.departmentId);
      const { period = 'week' } = req.query;

      const trends = await analyticsService.getSubmissionTrends(departmentId, period);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'trends', { departmentId, period });

      res.json({
        success: true,
        data: trends,
        period
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'trends', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/response-time/:departmentId
 * Get response time analytics
 */
router.get(
  '/response-time/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const { formId } = req.query;

      const analytics = await analyticsService.getResponseTimeAnalytics(
        departmentId,
        formId ? parseInt(formId) : null
      );

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'response-time', { departmentId, formId });

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'response-time', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/rejections/:departmentId
 * Get rejection analytics
 */
router.get(
  '/rejections/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);

      const rejections = await analyticsService.getRejectionAnalytics(departmentId);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'rejections', { departmentId });

      res.json({
        success: true,
        data: rejections
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'rejections', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/forms/:departmentId
 * Get form-specific performance metrics
 */
router.get(
  '/forms/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);

      const metrics = await analyticsService.getFormPerformanceMetrics(departmentId);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'forms', { departmentId });

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'forms', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/users/:departmentId
 * Get user productivity metrics
 */
router.get(
  '/users/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);

      const metrics = await analyticsService.getUserProductivityMetrics(departmentId);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'users', { departmentId });

      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'users', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/comparison
 * Compare performance across departments (Admin only)
 */
router.get(
  '/comparison',
  validateJWT,
  query('departmentIds').notEmpty(),
  async (req, res) => {
    try {
      // Only admins can compare departments
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Only admins can compare departments' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { departmentIds } = req.query;
      const deptIds = departmentIds.split(',').map(id => parseInt(id));

      const comparison = await analyticsService.compareDepartmentPerformance(deptIds);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'comparison', { departmentIds: deptIds });

      res.json({
        success: true,
        data: comparison
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'comparison', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/anomalies/:departmentId
 * Detect and retrieve anomalies
 */
router.get(
  '/anomalies/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  query('threshold').isFloat({ min: 1, max: 10 }).optional(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const departmentId = parseInt(req.params.departmentId);
      const { threshold = 2 } = req.query;

      const anomalies = await analyticsService.detectAnomalies(departmentId, parseFloat(threshold));

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'anomalies', { departmentId, threshold });

      res.json({
        success: true,
        data: anomalies
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'anomalies', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * GET /api/analytics/realtime/:departmentId
 * Get real-time metrics for current day
 */
router.get(
  '/realtime/:departmentId',
  validateJWT,
  checkDepartmentAccess,
  async (req, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);

      const metrics = await analyticsService.getRealTimeMetrics(departmentId);

      logger.logActivity(req.user.id, 'VIEW_ANALYTICS', 'realtime', { departmentId });

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'realtime', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/analytics/export
 * Export analytics data (PDF, Excel, CSV)
 */
router.post(
  '/export',
  validateJWT,
  body('departmentId').isInt(),
  body('format').isIn(['pdf', 'excel', 'csv']),
  body('dataType').isIn(['dashboard', 'trends', 'forms', 'users']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { departmentId, format, dataType, dateFrom, dateTo } = req.body;

      logger.logActivity(req.user.id, 'EXPORT_ANALYTICS', dataType, { 
        departmentId, 
        format, 
        dateFrom, 
        dateTo 
      });

      // TODO: Implement export logic based on format and dataType
      res.json({
        success: true,
        message: `Export queued for ${dataType} in ${format} format`,
        downloadUrl: `/api/analytics/download/${departmentId}/${dataType}/${format}`
      });
    } catch (error) {
      logger.logActivity(req.user.id, 'ANALYTICS_ERROR', 'export', { error: error.message });
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

module.exports = router;
