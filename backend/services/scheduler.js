const cron = require('node-cron');
const { executeQuery } = require('../config/database');
const { sendNotification } = require('./notificationService');

// Start all scheduled jobs
function startScheduledJobs() {
  // Check for pending rejects every hour at 16:30
  cron.schedule('30 16 * * *', async () => {
    await checkPendingRejects();
  });
  
  // Check for aging tickets every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    await checkAgingTickets();
  });
  
  // Send weekly reports every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    await sendWeeklyReports();
  });
  
  // Send monthly reports on the 1st of each month at 8:00 AM
  cron.schedule('0 8 1 * *', async () => {
    await sendMonthlyReports();
  });
  
  console.log('Scheduled jobs started');
}

// Check for pending rejects and send alerts
async function checkPendingRejects() {
  try {
    const pendingRejects = await executeQuery(`
      SELECT ir.*, d.name as department_name
      FROM internal_rejects ir
      JOIN departments d ON ir.department_id = d.id
      WHERE ir.status IN ('Pending', 'No Stock', 'Wrong Stock Received')
      AND TIME(NOW()) >= '16:30:00'
    `);
    
    if (pendingRejects.length > 0) {
      await sendNotification({
        type: 'pending_rejects_alert',
        title: 'Pending Rejects Alert',
        message: `${pendingRejects.length} rejects are still pending at 16:30. Orders might be late.`,
        roles: ['Planning Manager', 'Planner']
      });
    }
  } catch (error) {
    console.error('Error checking pending rejects:', error);
  }
}

// Check for aging tickets and send notifications
async function checkAgingTickets() {
  try {
    // Check SOP failures older than 24 hours
    const agingSopFailures = await executeQuery(`
      SELECT sf.*, d.name as department_name, u.email as manager_email
      FROM sop_failures sf
      JOIN departments d ON sf.department_id = d.id
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE sf.status NOT IN ('Closed') 
      AND TIMESTAMPDIFF(HOUR, sf.created_at, NOW()) >= 24
    `);
    
    for (const failure of agingSopFailures) {
      const hoursAging = Math.floor((Date.now() - new Date(failure.created_at)) / (1000 * 60 * 60));
      let priority = 'Medium';
      
      if (hoursAging >= 72) priority = 'High';
      if (hoursAging >= 48) priority = 'Medium';
      
      await sendNotification({
        type: 'aging_ticket',
        title: `Aging SOP Failure - ${priority} Priority`,
        message: `SOP failure in ${failure.department_name} has been open for ${hoursAging} hours`,
        relatedTable: 'sop_failures',
        relatedId: failure.id,
        departmentId: failure.department_id
      });
    }
  } catch (error) {
    console.error('Error checking aging tickets:', error);
  }
}

// Send weekly reports
async function sendWeeklyReports() {
  try {
    const departments = await executeQuery('SELECT * FROM departments WHERE is_active = 1');
    
    for (const dept of departments) {
      const weeklyStats = await executeQuery(`
        SELECT 
          COUNT(DISTINCT ir.id) as rejects_count,
          SUM(ir.total_reject_cost) as rejects_cost,
          COUNT(DISTINCT cr.id) as returns_count,
          SUM(cr.total_cost_return) as returns_cost,
          COUNT(DISTINCT sf.id) as sop_failures_count
        FROM departments d
        LEFT JOIN internal_rejects ir ON d.id = ir.department_id AND ir.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        LEFT JOIN customer_returns cr ON d.id = cr.department_id AND cr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        LEFT JOIN sop_failures sf ON d.id = sf.department_id AND sf.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        WHERE d.id = ?
      `, [dept.id]);
      
      const stats = weeklyStats[0];
      
      await sendNotification({
        type: 'weekly_report',
        title: 'Weekly Department Report',
        message: `Weekly Summary: ${stats.rejects_count || 0} rejects (R${stats.rejects_cost || 0}), ${stats.returns_count || 0} returns (R${stats.returns_cost || 0}), ${stats.sop_failures_count || 0} SOP failures`,
        departmentId: dept.id
      });
    }
  } catch (error) {
    console.error('Error sending weekly reports:', error);
  }
}

// Send monthly reports
async function sendMonthlyReports() {
  try {
    const departments = await executeQuery('SELECT * FROM departments WHERE is_active = 1');
    
    for (const dept of departments) {
      const monthlyStats = await executeQuery(`
        SELECT 
          COUNT(DISTINCT ir.id) as rejects_count,
          SUM(ir.total_reject_cost) as rejects_cost,
          COUNT(DISTINCT cr.id) as returns_count,
          SUM(cr.total_cost_return) as returns_cost,
          COUNT(DISTINCT sf.id) as sop_failures_count,
          COUNT(DISTINCT mt.id) as maintenance_count
        FROM departments d
        LEFT JOIN internal_rejects ir ON d.id = ir.department_id AND ir.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        LEFT JOIN customer_returns cr ON d.id = cr.department_id AND cr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        LEFT JOIN sop_failures sf ON d.id = sf.department_id AND sf.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        LEFT JOIN maintenance_tickets mt ON d.id = mt.department_id AND mt.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        WHERE d.id = ?
      `, [dept.id]);
      
      const stats = monthlyStats[0];
      
      await sendNotification({
        type: 'monthly_report',
        title: 'Monthly Department Report',
        message: `Monthly Summary: ${stats.rejects_count || 0} rejects (R${stats.rejects_cost || 0}), ${stats.returns_count || 0} returns (R${stats.returns_cost || 0}), ${stats.sop_failures_count || 0} SOP failures, ${stats.maintenance_count || 0} maintenance tickets`,
        departmentId: dept.id
      });
    }
  } catch (error) {
    console.error('Error sending monthly reports:', error);
  }
}

module.exports = {
  startScheduledJobs,
  checkPendingRejects,
  checkAgingTickets,
  sendWeeklyReports,
  sendMonthlyReports
};