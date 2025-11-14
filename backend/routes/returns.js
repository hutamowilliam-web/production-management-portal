const express = require('express');
const { executeQuery } = require('../config/database');
const { checkPermission } = require('../middleware/auth');
const { decrypt, encrypt } = require('../utils/encryption');
const NotificationService = require('../services/notificationService');
const { logActivity } = require('../services/activityLogger');
require('dotenv').config();

const router = express.Router();
const notificationService = new NotificationService();

// Sensitive fields to encrypt
const SENSITIVE_FIELDS = ['customer_name', 'responsible_employee', 'details'];

/**
 * GET /api/returns
 * Get all customer returns with filters and pagination
 */
router.get('/', checkPermission('view_own_department_data'), async (req, res) => {
  try {
    const { department_id, production_status, page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT cr.id, cr.sales_order_number, cr.department_id, cr.production_stage,
             cr.return_date, cr.customer_name, cr.product, cr.reason, cr.return_quantity,
             cr.details, cr.total_cost_return, cr.responsible_employee, cr.submitted_by,
             cr.faulty_department_id, cr.raf_date, cr.production_status, cr.date_resolved,
             cr.created_at, cr.updated_at, d.name as department_name, fd.name as faulty_department_name,
             u.first_name, u.last_name
      FROM customer_returns cr
      LEFT JOIN departments d ON cr.department_id = d.id
      LEFT JOIN departments fd ON cr.faulty_department_id = fd.id
      LEFT JOIN users u ON cr.submitted_by = u.id
      WHERE 1=1
    `;
    const params = [];

    // Permission-based filtering
    if (!req.user.permissions.includes('view_cross_department_returns')) {
      query += ' AND cr.department_id = ?';
      params.push(req.user.department_id);
    }

    // Filters
    if (department_id) {
      query += ' AND cr.department_id = ?';
      params.push(department_id);
    }
    if (production_status) {
      query += ' AND cr.production_status = ?';
      params.push(production_status);
    }
    if (search) {
      query += ` AND (cr.sales_order_number LIKE ? OR cr.product LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // Count total
    const countQuery = query.replace('SELECT cr.id, cr.sales_order_number,', 'SELECT COUNT(*) as count');
    const [{ count }] = await executeQuery(countQuery, params);

    // Get paginated results
    query += ` ORDER BY cr.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);
    
    const returns = await executeQuery(query, params);

    // Decrypt sensitive fields
    returns.forEach(ret => {
      SENSITIVE_FIELDS.forEach(field => {
        if (ret[field]) {
          try {
            ret[field] = decrypt(ret[field]);
          } catch (e) {
            console.error(`Failed to decrypt ${field}:`, e);
          }
        }
      });
    });

    res.json({
      data: returns,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/returns/:id
 * Get specific customer return by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const [returnData] = await executeQuery(
      `SELECT cr.*, d.name as department_name, fd.name as faulty_department_name,
              u.first_name, u.last_name, u.email
       FROM customer_returns cr
       LEFT JOIN departments d ON cr.department_id = d.id
       LEFT JOIN departments fd ON cr.faulty_department_id = fd.id
       LEFT JOIN users u ON cr.submitted_by = u.id
       WHERE cr.id = ?`,
      [req.params.id]
    );

    if (!returnData) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('view_cross_department_returns') && 
        returnData.department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Decrypt sensitive fields
    SENSITIVE_FIELDS.forEach(field => {
      if (returnData[field]) {
        try {
          returnData[field] = decrypt(returnData[field]);
        } catch (e) {
          console.error(`Failed to decrypt ${field}:`, e);
        }
      }
    });

    res.json(returnData);
  } catch (error) {
    console.error('Error fetching return:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/returns
 * Create new customer return
 */
router.post('/', checkPermission('submit_customer_returns'), async (req, res) => {
  try {
    const { sales_order_number, department_id, production_stage, return_date, customer_name, 
            product, reason, return_quantity, details, total_cost_return, responsible_employee, 
            faulty_department_id, raf_date } = req.body;

    // Validate required fields
    if (!sales_order_number || !department_id || !customer_name || !product || !reason || !return_quantity || !total_cost_return) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Encrypt sensitive fields
    const encryptedCustomer = encrypt(customer_name);
    const encryptedEmployee = responsible_employee ? encrypt(responsible_employee) : null;
    const encryptedDetails = details ? encrypt(details) : null;

    const result = await executeQuery(`
      INSERT INTO customer_returns 
      (sales_order_number, department_id, production_stage, return_date, customer_name, 
       product, reason, return_quantity, details, total_cost_return, responsible_employee, 
       submitted_by, faulty_department_id, raf_date, production_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'credited', NOW(), NOW())
    `, [sales_order_number, department_id, production_stage, return_date, encryptedCustomer, product, 
        reason, return_quantity, encryptedDetails, total_cost_return, encryptedEmployee, req.user.id, 
        faulty_department_id, raf_date]);

    // Log activity
    await logActivity(req.user.id, 'CREATE', 'customer_returns', result.insertId, null, req.body);

    // Broadcast via Socket.io
    if (req.io) {
      req.io.to(`department-${department_id}`).emit('return-created', {
        id: result.insertId,
        sales_order_number,
        product,
        production_status: 'credited'
      });
    }

    res.status(201).json({ 
      id: result.insertId, 
      message: 'Customer return submitted successfully'
    });
  } catch (error) {
    console.error('Error creating return:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/returns/:id/status
 * Update return production status
 */
router.patch('/:id/status', checkPermission('update_return_status'), async (req, res) => {
  try {
    const { production_status, date_resolved } = req.body;
    const validStatuses = ['credited', 'replaced', 'credit and replaced'];

    if (!validStatuses.includes(production_status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get existing return
    const [existingReturn] = await executeQuery('SELECT * FROM customer_returns WHERE id = ?', [req.params.id]);
    
    if (!existingReturn) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('view_cross_department_returns') && 
        existingReturn.department_id !== req.user.department_id &&
        existingReturn.faulty_department_id !== req.user.department_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateResult = await executeQuery(
      `UPDATE customer_returns 
       SET production_status = ?, date_resolved = ?, updated_at = NOW() 
       WHERE id = ?`,
      [production_status, date_resolved || null, req.params.id]
    );

    // Log activity
    await logActivity(req.user.id, 'UPDATE', 'customer_returns', req.params.id, 
                     { production_status: existingReturn.production_status }, { production_status });

    // Broadcast via Socket.io
    if (req.io) {
      req.io.emit('return-status-updated', {
        id: req.params.id,
        production_status,
        department_id: existingReturn.department_id
      });
    }

    res.json({ message: 'Status updated successfully', affected: updateResult.affectedRows });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/returns/:id
 * Update customer return
 */
router.put('/:id', async (req, res) => {
  try {
    const [existingReturn] = await executeQuery('SELECT * FROM customer_returns WHERE id = ?', [req.params.id]);
    
    if (!existingReturn) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('edit_all_department_tickets') && 
        existingReturn.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { customer_name, product, reason, return_quantity, details, responsible_employee } = req.body;

    // Encrypt sensitive fields
    const updates = {};
    if (customer_name) updates.customer_name = encrypt(customer_name);
    if (product) updates.product = product;
    if (reason) updates.reason = reason;
    if (return_quantity) updates.return_quantity = return_quantity;
    if (details !== undefined) updates.details = details ? encrypt(details) : null;
    if (responsible_employee !== undefined) updates.responsible_employee = responsible_employee ? encrypt(responsible_employee) : null;

    if (Object.keys(updates).length > 0) {
      const updateQuery = `UPDATE customer_returns SET ${Object.keys(updates).map(k => `${k} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`;
      await executeQuery(updateQuery, [...Object.values(updates), req.params.id]);

      // Log activity
      await logActivity(req.user.id, 'UPDATE', 'customer_returns', req.params.id, existingReturn, updates);
    }

    res.json({ message: 'Return updated successfully' });
  } catch (error) {
    console.error('Error updating return:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/returns/:id
 * Delete customer return
 */
router.delete('/:id', checkPermission('edit_all_department_tickets'), async (req, res) => {
  try {
    const [returnData] = await executeQuery('SELECT * FROM customer_returns WHERE id = ?', [req.params.id]);
    
    if (!returnData) {
      return res.status(404).json({ error: 'Return not found' });
    }

    // Check permissions
    if (!req.user.permissions.includes('edit_all_department_tickets') && 
        returnData.submitted_by !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await executeQuery('DELETE FROM customer_returns WHERE id = ?', [req.params.id]);

    // Log activity
    await logActivity(req.user.id, 'DELETE', 'customer_returns', req.params.id, returnData, null);

    res.json({ message: 'Return deleted successfully' });
  } catch (error) {
    console.error('Error deleting return:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;