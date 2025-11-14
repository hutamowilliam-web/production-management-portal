const express = require('express');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');
const { sendNotification } = require('../services/notificationService');
const router = express.Router();

// Get SOP failures
router.get('/', async (req, res) => {
  try {
    const { department_id, status } = req.query;
    let query = `
      SELECT sf.*, d.name as department_name,
             u1.username as submitted_by_username,
             u2.username as assigned_to_username
      FROM sop_failures sf
      LEFT JOIN departments d ON sf.department_id = d.id
      LEFT JOIN users u1 ON sf.submitted_by = u1.id
      LEFT JOIN users u2 ON sf.assigned_to = u2.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ' AND sf.department_id = ?';
      params.push(department_id);
    }

    if (status) {
      query += ' AND sf.status = ?';
      params.push(status);
    }

    query += ' ORDER BY sf.created_at DESC';
    
    const sopFailures = await executeQuery(query, params);
    res.json(sopFailures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create SOP failure
router.post('/', async (req, res) => {
  try {
    const { department_id, form_data } = req.body;

    const result = await executeQuery(`
      INSERT INTO sop_failures (form_data, department_id, submitted_by, status, created_at, updated_at)
      VALUES (?, ?, ?, 'Open', NOW(), NOW())
    `, [JSON.stringify(form_data), department_id, req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'SOP failure submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign SOP failure
router.patch('/:id/assign', async (req, res) => {
  try {
    const { assigned_to } = req.body;
    
    await executeQuery(
      'UPDATE sop_failures SET assigned_to = ?, updated_at = NOW() WHERE id = ?',
      [assigned_to, req.params.id]
    );
    
    res.json({ message: 'SOP failure assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reassign SOP failure
router.patch('/:id/reassign', async (req, res) => {
  try {
    const { new_department_id } = req.body;
    
    await executeQuery(
      'UPDATE sop_failures SET department_id = ?, updated_at = NOW() WHERE id = ?',
      [new_department_id, req.params.id]
    );
    
    res.json({ message: 'SOP failure reassigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update SOP failure status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    await executeQuery(
      'UPDATE sop_failures SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, req.params.id]
    );
    
    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get NCR reports for SOP failure
router.get('/:id/ncr', async (req, res) => {
  try {
    const ncrReports = await executeQuery(`
      SELECT nr.*, u1.username as submitted_by_username,
             u2.username as approved_by_username
      FROM ncrs nr
      LEFT JOIN users u1 ON nr.submitted_by = u1.id
      LEFT JOIN users u2 ON nr.approved_by = u2.id
      WHERE nr.sop_failure_id = ?
    `, [req.params.id]);
    
    res.json(ncrReports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create NCR report
router.post('/:id/ncr', async (req, res) => {
  try {
    const { form_data } = req.body;

    const result = await executeQuery(`
      INSERT INTO ncrs (sop_failure_id, form_data, submitted_by, created_at)
      VALUES (?, ?, ?, NOW())
    `, [req.params.id, JSON.stringify(form_data), req.user.id]);

    res.status(201).json({ id: result.insertId, message: 'NCR report created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;