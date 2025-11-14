const express = require('express');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const { department_id } = req.query;
    
    const deptFilter = department_id ? ' AND department_id = ?' : '';
    const params = department_id ? [department_id] : [];
    
    const [rejects] = await executeQuery(`SELECT COUNT(*) as count FROM internal_rejects WHERE 1=1${deptFilter}`, params);
    const [returns] = await executeQuery(`SELECT COUNT(*) as count FROM customer_returns WHERE 1=1${deptFilter}`, params);
    const sopFailures = await executeQuery(`SELECT COUNT(*) as count, status FROM sop_failures WHERE 1=1${deptFilter} GROUP BY status`, params);
    const maintenanceTickets = await executeQuery(`SELECT COUNT(*) as count, status FROM maintenance_tickets WHERE 1=1${deptFilter} GROUP BY status`, params);
    
    res.json({
      rejects: { count: rejects.count || 0, totalCost: 0 },
      returns: { count: returns.count || 0, totalCost: 0 },
      sopFailures: sopFailures.reduce((acc, item) => {
        acc[item.status?.toLowerCase() || 'unknown'] = item.count;
        return acc;
      }, {}),
      maintenanceTickets: maintenanceTickets.reduce((acc, item) => {
        acc[item.status?.toLowerCase().replace(' ', '_') || 'unknown'] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending items requiring attention
router.get('/pending', async (req, res) => {
  try {
    const { department_id } = req.query;
    
    const deptFilter = department_id ? ' AND department_id = ?' : '';
    const params = department_id ? [department_id] : [];
    
    const pendingRejects = await executeQuery(`
      SELECT 'reject' as type, id, id as reference, created_at,
             TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_pending
      FROM internal_rejects 
      WHERE status = 'Pending' AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24${deptFilter}
    `, params);
    
    const pendingSop = await executeQuery(`
      SELECT 'sop' as type, id, id as reference, created_at,
             TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_pending
      FROM sop_failures 
      WHERE status IN ('Open', 'Escalated') AND TIMESTAMPDIFF(HOUR, created_at, NOW()) >= 24${deptFilter}
    `, params);
    
    res.json([...pendingRejects, ...pendingSop]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;