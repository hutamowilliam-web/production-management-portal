const express = require('express');
const { executeQuery } = require('../config/database');
const router = express.Router();

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { is_read, limit = 50 } = req.query;
    
    let query = `
      SELECT * FROM notifications 
      WHERE user_id = ?
    `;
    const params = [req.user.id];
    
    if (is_read !== undefined) {
      query += ' AND is_read = ?';
      params.push(is_read === 'true');
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const notifications = await executeQuery(query, params);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    await executeQuery(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    await executeQuery(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const [result] = await executeQuery(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    
    res.json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;