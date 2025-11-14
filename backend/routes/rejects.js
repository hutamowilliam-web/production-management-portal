const express = require('express');
const { executeQuery, redisClient } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const { EncryptionService, encrypt, decrypt } = require('../utils/encryption');
const NotificationService = require('../services/notificationService');
const { logActivity } = require('../services/activityLogger');
require('dotenv').config();

const router = express.Router();
const encryptionService = new EncryptionService();
const notificationService = new NotificationService();

// Sensitive fields to encrypt
const SENSITIVE_FIELDS = ['customer_name', 'responsible_employee', 'details'];

/**
 * GET /api/rejects
 * Get all internal rejects with filters and pagination
 */
router.get('/', checkPermission('view_own_department_data'), async (req, res) => {
  try {
    const { department_id, status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT ir.id, ir.sales_order_number, ir.department_id, ir.production_stage_id,
             ir.customer_name, ir.product, ir.reason, ir.reject_quantity, ir.details,
             ir.total_reject_cost, ir.responsible_employee, ir.submitted_by, ir.shift,
             ir.faulty_department_id, ir.status, ir.created_at, ir.updated_at,
             d.name as department_name, fd.name as faulty_department_name, u.first_name, u.last_name
      FROM internal_rejects ir
      LEFT JOIN departments d ON ir.department_id = d.id
      LEFT JOIN departments fd ON ir.faulty_department_id = fd.id
      LEFT JOIN users u ON ir.submitted_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Permission-based filtering
    if (!req.user.permissions.includes('view_cross_department_rejects')) {
      query += ' AND ir.department_id = ?';
      params.push(req.user.department_id);
    }

    // Filters
    if (department_id) {
      query += ' AND ir.department_id = ?';
      params.push(department_id);
    }
    if (status) {
      query += ' AND ir.status = ?';
      params.push(status);
    }
    if (search) {
      query += ` AND (ir.sales_order_number LIKE ? OR ir.product LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT ir.id, ir.sales_order_number,', 'SELECT COUNT(*) as count');
    const [{ count }] = await executeQuery(countQuery, params);

    // Get paginated results
    query += ` ORDER BY ir.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const rejects = await executeQuery(query, params);

    // Decrypt sensitive fields
    rejects.forEach(reject => {
      SENSITIVE_FIELDS.forEach(field => {
        if (reject[field]) {
          try {
            reject[field] = decrypt(reject[field]);
          } catch (e) {
            console.error(`Failed to decrypt ${field}:`, e);
          }
        }
      });
    });

    res.json({
      data: rejects,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching rejects:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rejects/:id
 * Get specific internal reject by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const [reject] = await executeQuery(
      `SELECT ir.*, d.name as department_name, fd.name as faulty_department_name,
              u.first_name, u.last_name, u.email
       FROM internal_rejects ir
       LEFT JOIN departments d ON ir.department_id = d.id
       LEFT JOIN departments fd ON ir.faulty_department_id = fd.id
       LEFT JOIN users u ON ir.submitted_by = u.id
       WHERE ir.id = ?`,
      [req.params.id]
    );

    if (!reject) {
      return res.status(404).json({ error: 'Reject not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('view_cross_department_rejects') && 
        reject.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Decrypt sensitive fields
    SENSITIVE_FIELDS.forEach(field => {
      if (reject[field]) {
        try {
          reject[field] = decrypt(reject[field]);
        } catch (e) {
          console.error(`Failed to decrypt ${field}:`, e);
        }
      }
    });

    res.json(reject);
  } catch (error) {
    console.error('Error fetching reject:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rejects
 * Create new internal reject
 */
router.post('/', checkPermission('submit_internal_rejects'), async (req, res) => {
  try {
    const { sales_order_number, department_id, production_stage_id, customer_name, 
            product, reason, reject_quantity, details, total_reject_cost, responsible_employee, 
            shift, faulty_department_id } = req.body;

    // Validate required fields
    if (!sales_order_number || !department_id || !product || !reason || !reject_quantity || !total_reject_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Encrypt sensitive fields
    const encryptedCustomer = encrypt(customer_name);
    const encryptedEmployee = responsible_employee ? encrypt(responsible_employee) : null;
    const encryptedDetails = details ? encrypt(details) : null;

    const result = await executeQuery(`
      INSERT INTO internal_rejects 
      (sales_order_number, department_id, production_stage_id, customer_name, product, reason,
       reject_quantity, details, total_reject_cost, responsible_employee, submitted_by, shift,
       faulty_department_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())
    `, [sales_order_number, department_id, production_stage_id, encryptedCustomer, product, reason,
        reject_quantity, encryptedDetails, total_reject_cost, encryptedEmployee, req.user.id, shift, 
        faulty_department_id]);

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'internal_rejects', result.insertId, null, req.body);

    // Notify Head of Production and Quality Inspector if high-value
    if (total_reject_cost > 2000) {
      const rejectData = {
        id: result.insertId,
        sales_order_number,
        customer_name,
        product,
        reject_quantity,
        total_reject_cost,
        reason,
        status: 'Pending',
        created_at: new Date()
      };
      
      await notificationService.notifyHighValueReject(rejectData, req.io);

      // Create in-app notifications
      const headOfProdUsers = await executeQuery(`
        SELECT u.id FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE r.name IN ('Head Of Production', 'Quality Inspector')
      `);

      for (const user of headOfProdUsers) {
        await notificationService.createNotification(
          user.id,
          'High-Value Reject Alert',
          `Internal reject ${sales_order_number} (R${total_reject_cost.toFixed(2)}) requires your attention`,
          'reject_alert',
          'internal_rejects',
          result.insertId
        );
      }
    }

    // Broadcast via Socket.io
    if (req.io) {
      req.io.to(`department-${department_id}`).emit('reject-created', {
        id: result.insertId,
        sales_order_number,
        product,
        status: 'Pending'
      });
    }

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Internal reject submitted successfully',
      high_value_alert: total_reject_cost > 2000
    });
  } catch (error) {
    console.error('Error creating reject:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/rejects/:id/status
 * Update reject status
 */
router.patch('/:id/status', checkPermission('update_reject_status'), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Stock Received', 'No Stock', 'Wrong Stock Received'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get existing reject
    const [existingReject] = await executeQuery('SELECT * FROM internal_rejects WHERE id = ?', [req.params.id]);
    
    if (!existingReject) {
      return res.status(404).json({ error: 'Reject not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('view_cross_department_rejects') && 
        existingReject.department_id !== req.user.department_id &&
        existingReject.faulty_department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateResult = await executeQuery(
      `UPDATE internal_rejects 
       SET status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, req.params.id]
    );

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'internal_rejects', req.params.id, 
                     { status: existingReject.status }, { status });

    // Broadcast via Socket.io
    if (req.io) {
      req.io.emit('reject-status-updated', {
        id: req.params.id,
        status,
        department_id: existingReject.department_id
      });
    }

    res.json({ message: 'Status updated successfully', affected: updateResult.affectedRows });
  } catch (error) {
    console.error('Error updating reject status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/rejects/:id
 * Update internal reject
 */
router.put('/:id', async (req, res) => {
  try {
    const [existingReject] = await executeQuery('SELECT * FROM internal_rejects WHERE id = ?', [req.params.id]);
    
    if (!existingReject) {
      return res.status(404).json({ error: 'Reject not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('edit_all_department_tickets') && 
        existingReject.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { customer_name, product, reason, reject_quantity, details, responsible_employee } = req.body;

    // Encrypt sensitive fields
    const updates = {};
    if (customer_name) updates.customer_name = encrypt(customer_name);
    if (product) updates.product = product;
    if (reason) updates.reason = reason;
    if (reject_quantity) updates.reject_quantity = reject_quantity;
    if (details !== undefined) updates.details = details ? encrypt(details) : null;
    if (responsible_employee !== undefined) updates.responsible_employee = responsible_employee ? encrypt(responsible_employee) : null;
    updates.updated_at = 'NOW()';

    const updateQuery = `UPDATE internal_rejects SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')} WHERE id = ?`;
    const updateValues = [...Object.values(updates).map(v => v === 'NOW()' ? null : v), req.params.id];

    await executeQuery(updateQuery, updateValues.slice(0, -1).concat([req.params.id]));

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'internal_rejects', req.params.id, existingReject, updates);

    res.json({ message: 'Reject updated successfully' });
  } catch (error) {
    console.error('Error updating reject:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/rejects/:id
 * Delete internal reject
 */
router.delete('/:id', checkPermission('edit_all_department_tickets'), async (req, res) => {
  try {
    const [reject] = await executeQuery('SELECT * FROM internal_rejects WHERE id = ?', [req.params.id]);
    
    if (!reject) {
      return res.status(404).json({ error: 'Reject not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('edit_all_department_tickets') && 
        reject.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await executeQuery('DELETE FROM internal_rejects WHERE id = ?', [req.params.id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'internal_rejects', req.params.id, reject, null);

    res.json({ message: 'Reject deleted successfully' });
  } catch (error) {
    console.error('Error deleting reject:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;