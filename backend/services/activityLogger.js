const { executeQuery } = require('../config/database');

async function logActivity(userId, action, tableName = null, recordId = null, oldValues = null, newValues = null, ipAddress = null, userAgent = null) {
  try {
    await executeQuery(`
      INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId,
      action,
      tableName,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent
    ]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

module.exports = { logActivity };