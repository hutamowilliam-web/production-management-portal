/**
 * Forms API Routes
 * Endpoints for managing forms and form responses
 */

const express = require('express');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/auth');
const formService = require('../services/formService');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

// ============ FORM MANAGEMENT ENDPOINTS ============

/**
 * GET /api/forms
 * List all active forms
 * Permission: view_forms
 */
router.get('/', auth, checkPermission('view_forms'), async (req, res) => {
  try {
    const forms = await formService.listForms();
    res.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error listing forms:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/forms/structures
 * Get form structures from JSON file (for reference)
 */
router.get('/structures', async (req, res) => {
  try {
    const formStructuresPath = path.join(__dirname, '../../json-schemas/form-structures.json');
    const formStructures = JSON.parse(await fs.readFile(formStructuresPath, 'utf8'));
    res.json(formStructures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/forms/:formId
 * Get form definition with fields
 * Permission: view_forms
 */
router.get('/:formId', auth, checkPermission('view_forms'), async (req, res) => {
  try {
    const form = await formService.getForm(req.params.formId);
    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Error getting form:', error);
    res.status(error.message.includes('not found') ? 404 : 500)
      .json({ error: error.message });
  }
});

/**
 * POST /api/forms
 * Create new form (admin only)
 * Permission: create_forms
 * Body: { name, description, fields: [...] }
 */
router.post('/', auth, checkPermission('create_forms'), async (req, res) => {
  try {
    const { name, description, fields } = req.body;

    if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({
        error: 'Form name and at least one field are required'
      });
    }

    const form = await formService.createForm({
      name,
      description,
      fields
    }, req.user.id);

    res.status(201).json({ success: true, data: form });
  } catch (error) {
    console.error('Error creating form:', error);
    const statusCode = error.message.includes('UNIQUE') ? 409 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * PUT /api/forms/:formId
 * Update form definition (admin only)
 * Permission: edit_forms
 * Body: { name, description, fields: [...] }
 */
router.put('/:formId', auth, checkPermission('edit_forms'), async (req, res) => {
  try {
    const { name, description, fields } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Form name is required' });
    }

    const form = await formService.updateForm(
      req.params.formId,
      { name, description, fields },
      req.user.id
    );

    res.json({ success: true, data: form });
  } catch (error) {
    console.error('Error updating form:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /api/forms/:formId
 * Delete form and all responses (admin only)
 * Permission: delete_forms
 */
router.delete('/:formId', auth, checkPermission('delete_forms'), async (req, res) => {
  try {
    await formService.deleteForm(req.params.formId, req.user.id);
    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// ============ FORM RESPONSE ENDPOINTS ============

/**
 * POST /api/forms/:formId/responses
 * Submit form response
 * Permission: submit_forms
 * Body: { form field values }
 */
router.post('/:formId/responses', auth, checkPermission('submit_forms'), async (req, res) => {
  try {
    const response = await formService.submitFormResponse(
      req.params.formId,
      req.body,
      req.user.id
    );

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error('Error submitting form:', error);

    // Handle validation errors
    if (error.validationErrors) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: error.validationErrors
      });
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /api/forms/:formId/responses
 * Get all responses for a form
 * Permission: view_form_responses (or view_own_responses)
 * Query: limit, offset, search, filter
 */
router.get('/:formId/responses', auth, checkPermission('view_form_responses'), async (req, res) => {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const responses = await formService.getFormResponses(req.params.formId, options);
    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Error getting form responses:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * GET /api/forms/:formId/responses/:responseId
 * Get specific form response
 * Permission: view_form_responses
 */
router.get('/:formId/responses/:responseId', auth, checkPermission('view_form_responses'), async (req, res) => {
  try {
    const response = await formService.getFormResponse(
      req.params.formId,
      req.params.responseId
    );

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error getting form response:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * PUT /api/forms/:formId/responses/:responseId
 * Update form response
 * Permission: edit_form_responses
 * Body: { updated field values }
 */
router.put('/:formId/responses/:responseId', auth, checkPermission('edit_form_responses'), async (req, res) => {
  try {
    const response = await formService.updateFormResponse(
      req.params.formId,
      req.params.responseId,
      req.body,
      req.user.id
    );

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error updating form response:', error);

    // Handle validation errors
    if (error.validationErrors) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: error.validationErrors
      });
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

/**
 * DELETE /api/forms/:formId/responses/:responseId
 * Delete form response (admin only)
 * Permission: delete_form_responses
 */
router.delete('/:formId/responses/:responseId', auth, checkPermission('delete_form_responses'), async (req, res) => {
  try {
    await formService.deleteFormResponse(
      req.params.formId,
      req.params.responseId,
      req.user.id
    );

    res.json({ success: true, message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Error deleting form response:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ error: error.message });
  }
});

// ============ EXPORT ENDPOINTS ============

/**
 * GET /api/forms/:formId/responses/export/csv
 * Export form responses as CSV
 * Permission: view_form_responses
 */
router.get('/:formId/responses/export/csv', auth, checkPermission('view_form_responses'), async (req, res) => {
  try {
    const responses = await formService.getFormResponses(
      req.params.formId,
      { limit: 10000 }
    );

    if (responses.data.length === 0) {
      return res.status(400).json({ error: 'No responses to export' });
    }

    // Build CSV header
    const headers = Object.keys(responses.data[0]);
    let csv = headers.join(',') + '\n';

    // Build CSV rows
    responses.data.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        // Escape quotes and wrap in quotes if contains comma
        value = String(value).replace(/"/g, '""');
        if (String(value).includes(',')) {
          value = `"${value}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="form-responses.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Forms API error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;