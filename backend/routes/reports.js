const express = require('express');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const router = express.Router();

// Get department performance report
router.get('/performance', checkPermission('view_department_reports'), async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        d.name as department_name,
        COUNT(DISTINCT ir.id) as total_rejects,
        SUM(ir.total_reject_cost) as total_reject_cost,
        COUNT(DISTINCT cr.id) as total_returns,
        SUM(cr.total_cost_return) as total_return_cost,
        COUNT(DISTINCT sf.id) as total_sop_failures,
        COUNT(DISTINCT mt.id) as total_maintenance_tickets,
        AVG(TIMESTAMPDIFF(HOUR, sf.created_at, sf.resolved_at)) as avg_sop_resolution_hours
      FROM departments d
      LEFT JOIN internal_rejects ir ON d.id = ir.department_id
      LEFT JOIN customer_returns cr ON d.id = cr.department_id  
      LEFT JOIN sop_failures sf ON d.id = sf.department_id
      LEFT JOIN maintenance_tickets mt ON d.id = mt.department_id
      WHERE d.is_active = 1
    `;
    
    const params = [];
    
    if (department_id) {
      query += ' AND d.id = ?';
      params.push(department_id);
    }
    
    if (start_date && end_date) {
      query += ` AND (
        (ir.created_at BETWEEN ? AND ?) OR
        (cr.created_at BETWEEN ? AND ?) OR
        (sf.created_at BETWEEN ? AND ?) OR
        (mt.created_at BETWEEN ? AND ?)
      )`;
      params.push(start_date, end_date, start_date, end_date, start_date, end_date, start_date, end_date);
    }
    
    query += ' GROUP BY d.id, d.name ORDER BY total_reject_cost DESC';
    
    const performance = await executeQuery(query, params);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get aging report for tickets
router.get('/aging', async (req, res) => {
  try {
    const { department_id } = req.query;
    
    let query = `
      SELECT 
        'sop_failure' as type,
        id,
        failure_type as description,
        status,
        created_at,
        TIMESTAMPDIFF(HOUR, created_at, NOW()) as age_hours,
        CASE 
          WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 24 THEN 'green'
          WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 48 THEN 'yellow'
          ELSE 'red'
        END as flag_color
      FROM sop_failures
      WHERE status NOT IN ('Closed')
    `;
    
    const params = [];
    
    if (department_id) {
      query += ' AND department_id = ?';
      params.push(department_id);
    }
    
    query += `
      UNION ALL
      SELECT 
        'maintenance_ticket' as type,
        id,
        machine_name as description,
        status,
        created_at,
        TIMESTAMPDIFF(HOUR, created_at, NOW()) as age_hours,
        CASE 
          WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 24 THEN 'green'
          WHEN TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 48 THEN 'yellow'
          ELSE 'red'
        END as flag_color
      FROM maintenance_tickets
      WHERE status NOT IN ('Completed', 'Cancelled')
    `;
    
    if (department_id) {
      query += ' AND department_id = ?';
      params.push(department_id);
    }
    
    query += ' ORDER BY age_hours DESC';
    
    const agingReport = await executeQuery(query, params);
    res.json(agingReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get financial summary
router.get('/financial', async (req, res) => {
  try {
    const { department_id, period = 'monthly' } = req.query;
    
    let dateFormat = '%Y-%m';
    if (period === 'weekly') dateFormat = '%Y-%u';
    if (period === 'daily') dateFormat = '%Y-%m-%d';
    if (period === 'yearly') dateFormat = '%Y';
    
    let query = `
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        SUM(total_reject_cost) as reject_costs,
        COUNT(*) as reject_count
      FROM internal_rejects
      WHERE 1=1
    `;
    
    const params = [];
    
    if (department_id) {
      query += ' AND department_id = ?';
      params.push(department_id);
    }
    
    query += ` GROUP BY DATE_FORMAT(created_at, '${dateFormat}') ORDER BY period DESC LIMIT 12`;
    
    const rejectCosts = await executeQuery(query, params);
    
    // Get return costs
    let returnQuery = `
      SELECT 
        DATE_FORMAT(created_at, '${dateFormat}') as period,
        SUM(total_cost_return) as return_costs,
        COUNT(*) as return_count
      FROM customer_returns
      WHERE 1=1
    `;
    
    if (department_id) {
      returnQuery += ' AND department_id = ?';
    }
    
    returnQuery += ` GROUP BY DATE_FORMAT(created_at, '${dateFormat}') ORDER BY period DESC LIMIT 12`;
    
    const returnCosts = await executeQuery(returnQuery, department_id ? [department_id] : []);
    
    res.json({
      rejects: rejectCosts,
      returns: returnCosts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;