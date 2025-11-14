const express = require('express');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const router = express.Router();

// Get users
router.get('/', async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
             u.department_id, u.role_id, u.is_active, u.created_at, u.last_login,
             d.name as department_name, r.name as role_name
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    if (department_id) {
      query += ' AND u.department_id = ?';
      params.push(department_id);
    }

    query += ' ORDER BY u.created_at DESC';
    
    const users = await executeQuery(query, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (Admin only)
router.post('/', checkPermission('manage_user_permissions'), async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, department_id, role_id } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await executeQuery(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [username, email, hashedPassword, first_name, last_name, department_id, role_id]);

    res.status(201).json({ id: result.insertId, message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', checkPermission('manage_user_permissions'), async (req, res) => {
  try {
    const { first_name, last_name, department_id, role_id, is_active } = req.body;
    
    await executeQuery(`
      UPDATE users 
      SET first_name = ?, last_name = ?, department_id = ?, role_id = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [first_name, last_name, department_id, role_id, is_active, req.params.id]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password (Admin only)
router.patch('/:id/reset-password', checkPermission('reset_user_passwords'), async (req, res) => {
  try {
    const { new_password } = req.body;
    const hashedPassword = await bcrypt.hash(new_password, 10);
    
    await executeQuery(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, req.params.id]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;