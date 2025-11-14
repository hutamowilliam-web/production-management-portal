const express = require('express');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await executeQuery(`
      SELECT d.*, u.first_name, u.last_name 
      FROM departments d 
      LEFT JOIN users u ON d.manager_id = u.id 
      WHERE d.is_active = 1
    `);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department areas
router.get('/:id/areas', async (req, res) => {
  try {
    const areas = await executeQuery(`
      SELECT da.*, u.first_name, u.last_name 
      FROM department_areas da 
      LEFT JOIN users u ON da.supervisor_id = u.id 
      WHERE da.department_id = ? AND da.is_active = 1
    `, [req.params.id]);
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department (Admin only)
router.post('/', checkPermission('manage_departments'), async (req, res) => {
  try {
    const { name, description, manager_id } = req.body;
    const result = await executeQuery(
      'INSERT INTO departments (name, description, manager_id) VALUES (?, ?, ?)',
      [name, description, manager_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Department created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create department area (Admin only)
router.post('/:id/areas', checkPermission('manage_departments'), async (req, res) => {
  try {
    const { name, supervisor_id } = req.body;
    const result = await executeQuery(
      'INSERT INTO department_areas (department_id, name, supervisor_id) VALUES (?, ?, ?)',
      [req.params.id, name, supervisor_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Department area created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;