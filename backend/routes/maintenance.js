const express = require('express');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');
const router = express.Router();

// Get maintenance tickets
router.get('/', async (req, res) => {
  try {
    const { department_id, status } = req.query;
    let query = `
      SELECT mt.*, d.name as department_name,
             u1.username as submitted_by_username,
             u2.username as assigned_to_username
      FROM maintenance_tickets mt
      LEFT JOIN departments d ON mt.department_id = d.id
      LEFT JOIN users u1 ON mt.submitted_by = u1.id
      LEFT JOIN users u2 ON mt.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ' AND mt.department_id = ?';
      params.push(department_id);
    }

    if (status) {
      query += ' AND mt.status = ?';
      params.push(status);
    }

    query += ' ORDER BY mt.created_at DESC';
    
    const tickets = await executeQuery(query, params);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create maintenance ticket
router.post('/', async (req, res) => {
  try {
    const { department_id, form_data } = req.body;

    const result = await executeQuery(`
      INSERT INTO maintenance_tickets (form_data, department_id, submitted_by, status, created_at, updated_at)
      VALUES (?, ?, ?, 'Open', NOW(), NOW())
    `, [JSON.stringify(form_data), department_id, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'Maintenance ticket submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign maintenance ticket
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assigned_to } = req.body;
    
    await executeQuery(
      'UPDATE maintenance_tickets SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [assigned_to, req.params.id]
    );
    
    res.json({ message: 'Maintenance ticket assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update maintenance ticket status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await executeQuery(
      'UPDATE maintenance_tickets SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;