const express = require('express');
const router = express.Router();
const powerAppsService = require('../services/powerAppsService');
const auth = require('../middleware/auth');
const db = require('../config/database');

/**
 * Power Apps Integration Routes
 * Handles synchronization, webhooks, and data exchange with Dynamics 365
 */

/**
 * GET /api/power-apps/health
 * Check Power Apps connectivity
 */
router.get('/health', async (req, res) => {
  try {
    const health = await powerAppsService.healthCheck();
    const statusCode = health.status === 'connected' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/sync-form
 * Sync a single form to Power Apps
 */
router.post('/sync-form', auth, async (req, res) => {
  try {
    const { formId } = req.body;

    if (!formId) {
      return res.status(400).json({ error: 'formId is required' });
    }

    // Get form from database
    const [forms] = await db.promise().query(
      'SELECT * FROM forms WHERE id = ? AND deleted_at IS NULL',
      [formId]
    );

    if (!forms.length) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const form = forms[0];

    // Get form fields
    const [fields] = await db.promise().query(
      'SELECT * FROM form_fields WHERE form_id = ? ORDER BY field_order',
      [formId]
    );

    form.fields = fields;

    // Sync to Power Apps
    const result = await powerAppsService.syncFormToPowerApps(form);

    // Log activity
    await db.promise().query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        'POWER_APPS_SYNC',
        'form',
        formId,
        JSON.stringify({ externalId: result.externalId })
      ]
    );

    res.json({
      success: true,
      message: 'Form synced to Power Apps successfully',
      data: result
    });
  } catch (error) {
    console.error('Error syncing form:', error);
    res.status(500).json({
      error: 'Failed to sync form',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/sync-response
 * Sync a single form response to Power Apps
 */
router.post('/sync-response', auth, async (req, res) => {
  try {
    const { responseId } = req.body;

    if (!responseId) {
      return res.status(400).json({ error: 'responseId is required' });
    }

    // Get response from database
    const [responses] = await db.promise().query(
      'SELECT * FROM form_responses WHERE id = ? AND deleted_at IS NULL',
      [responseId]
    );

    if (!responses.length) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const response = responses[0];

    // Parse response data if it's a string
    if (typeof response.response_json === 'string') {
      response.response_json = JSON.parse(response.response_json);
    }

    // Sync to Power Apps
    const result = await powerAppsService.syncResponseToPowerApps(response);

    // Log activity
    await db.promise().query(
      'INSERT INTO activity_logs (user_id, action, resource_type, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        'POWER_APPS_SYNC',
        'response',
        responseId,
        JSON.stringify({ externalId: result.externalId })
      ]
    );

    res.json({
      success: true,
      message: 'Response synced to Power Apps successfully',
      data: result
    });
  } catch (error) {
    console.error('Error syncing response:', error);
    res.status(500).json({
      error: 'Failed to sync response',
      message: error.message
    });
  }
});

/**
 * GET /api/power-apps/forms
 * Get all forms from Power Apps
 */
router.get('/forms', auth, async (req, res) => {
  try {
    const { select, filter, orderBy, top } = req.query;

    const options = {
      select: select ? select.split(',') : ['pm_formid', 'pm_formname', 'pm_description', 'pm_status'],
      filter: filter || null,
      orderBy: orderBy || 'pm_createdon desc',
      top: parseInt(top) || 100
    };

    const forms = await powerAppsService.getFromPowerApps('pm_forms', options);

    res.json({
      success: true,
      data: forms,
      count: forms.length
    });
  } catch (error) {
    console.error('Error getting forms from Power Apps:', error);
    res.status(500).json({
      error: 'Failed to get forms from Power Apps',
      message: error.message
    });
  }
});

/**
 * GET /api/power-apps/responses
 * Get all form responses from Power Apps
 */
router.get('/responses', auth, async (req, res) => {
  try {
    const { select, filter, orderBy, top } = req.query;

    const options = {
      select: select ? select.split(',') : ['pm_formresponseid', 'pm_responseid', 'pm_formidname', 'pm_status'],
      filter: filter || null,
      orderBy: orderBy || 'pm_createdon desc',
      top: parseInt(top) || 100
    };

    const responses = await powerAppsService.getFromPowerApps('pm_formresponses', options);

    res.json({
      success: true,
      data: responses,
      count: responses.length
    });
  } catch (error) {
    console.error('Error getting responses from Power Apps:', error);
    res.status(500).json({
      error: 'Failed to get responses from Power Apps',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/sync-all-forms
 * Bulk sync all forms to Power Apps
 */
router.post('/sync-all-forms', auth, async (req, res) => {
  try {
    // Check user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin role required' });
    }

    const result = await powerAppsService.syncAllForms();

    // Log activity
    await db.promise().query(
      'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        'POWER_APPS_BULK_SYNC_FORMS',
        'forms',
        JSON.stringify(result)
      ]
    );

    res.json({
      success: true,
      message: 'Bulk form sync completed',
      data: result
    });
  } catch (error) {
    console.error('Error bulk syncing forms:', error);
    res.status(500).json({
      error: 'Failed to bulk sync forms',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/sync-all-responses
 * Bulk sync all responses to Power Apps
 */
router.post('/sync-all-responses', auth, async (req, res) => {
  try {
    // Check user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin role required' });
    }

    const result = await powerAppsService.syncAllResponses();

    // Log activity
    await db.promise().query(
      'INSERT INTO activity_logs (user_id, action, resource_type, details) VALUES (?, ?, ?, ?)',
      [
        req.user.id,
        'POWER_APPS_BULK_SYNC_RESPONSES',
        'responses',
        JSON.stringify(result)
      ]
    );

    res.json({
      success: true,
      message: 'Bulk response sync completed',
      data: result
    });
  } catch (error) {
    console.error('Error bulk syncing responses:', error);
    res.status(500).json({
      error: 'Failed to bulk sync responses',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/webhook
 * Receive webhook events from Power Apps (Dynamics 365)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { eventType, data } = req.body;

    if (!eventType || !data) {
      return res.status(400).json({ error: 'eventType and data are required' });
    }

    // Handle different event types
    switch (eventType) {
      case 'form.created':
      case 'form.updated':
        // Sync form from Power Apps to local database
        await handleFormWebhook(data);
        break;

      case 'response.submitted':
      case 'response.updated':
        // Sync response from Power Apps to local database
        await handleResponseWebhook(data);
        break;

      default:
        console.warn(`[PowerApps] Unknown event type: ${eventType}`);
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/power-apps/setup-webhooks
 * Initialize webhook subscriptions for Power Apps events
 */
router.post('/setup-webhooks', auth, async (req, res) => {
  try {
    // Check user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin role required' });
    }

    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000';
    const webhookUrl = `${webhookBaseUrl}/api/power-apps/webhook`;

    const subscriptions = [];

    try {
      // Subscribe to form events
      const formSub = await powerAppsService.createWebhookSubscription('pm_forms', webhookUrl, 'create');
      subscriptions.push(formSub);

      const formUpdateSub = await powerAppsService.createWebhookSubscription('pm_forms', webhookUrl, 'update');
      subscriptions.push(formUpdateSub);

      // Subscribe to response events
      const responseSub = await powerAppsService.createWebhookSubscription('pm_formresponses', webhookUrl, 'create');
      subscriptions.push(responseSub);

      const responseUpdateSub = await powerAppsService.createWebhookSubscription('pm_formresponses', webhookUrl, 'update');
      subscriptions.push(responseUpdateSub);
    } catch (error) {
      console.warn('Some webhook subscriptions failed:', error.message);
    }

    res.json({
      success: true,
      message: 'Webhook subscriptions initialized',
      subscriptions: subscriptions
    });
  } catch (error) {
    console.error('Error setting up webhooks:', error);
    res.status(500).json({
      error: 'Failed to setup webhooks',
      message: error.message
    });
  }
});

/**
 * Helper function to handle form webhook events
 */
async function handleFormWebhook(data) {
  try {
    const { pm_formid, pm_formname, pm_description, pm_metadata } = data;

    const fields = pm_metadata ? JSON.parse(pm_metadata) : [];

    // Check if form exists locally
    const [existingForms] = await db.promise().query(
      'SELECT id FROM forms WHERE external_id = ?',
      [pm_formid]
    );

    if (existingForms.length) {
      // Update existing form
      await db.promise().query(
        'UPDATE forms SET name = ?, description = ?, updated_at = NOW() WHERE external_id = ?',
        [pm_formname, pm_description, pm_formid]
      );
    } else {
      // Create new form
      const [result] = await db.promise().query(
        'INSERT INTO forms (name, description, type, external_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [pm_formname, pm_description, 'Standard', pm_formid]
      );

      // Add fields
      const formId = result.insertId;
      for (let i = 0; i < fields.length; i++) {
        await db.promise().query(
          'INSERT INTO form_fields (form_id, field_name, field_type, field_order, required, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [formId, fields[i].name, fields[i].type, i, fields[i].required || false]
        );
      }
    }

    console.log(`[PowerApps] Form webhook processed: ${pm_formname}`);
  } catch (error) {
    console.error('[PowerApps] Form webhook handling error:', error);
    throw error;
  }
}

/**
 * Helper function to handle response webhook events
 */
async function handleResponseWebhook(data) {
  try {
    const { pm_responseid, pm_formidname, pm_responsedata, pm_submittedby } = data;

    // Find the form by external ID
    const [forms] = await db.promise().query(
      'SELECT id FROM forms WHERE external_id = ?',
      [pm_formidname]
    );

    if (!forms.length) {
      console.warn(`[PowerApps] Form not found for external ID: ${pm_formidname}`);
      return;
    }

    const formId = forms[0].id;
    const responseJson = typeof pm_responsedata === 'string' ? pm_responsedata : JSON.stringify(pm_responsedata);

    // Check if response exists locally
    const [existingResponses] = await db.promise().query(
      'SELECT id FROM form_responses WHERE external_id = ?',
      [pm_responseid]
    );

    if (!existingResponses.length) {
      // Create new response
      await db.promise().query(
        'INSERT INTO form_responses (form_id, response_json, created_by, external_id, created_at) VALUES (?, ?, ?, ?, NOW())',
        [formId, responseJson, pm_submittedby || 'Power Apps', pm_responseid]
      );

      console.log(`[PowerApps] Response webhook processed: ${pm_responseid}`);
    }
  } catch (error) {
    console.error('[PowerApps] Response webhook handling error:', error);
    throw error;
  }
}

module.exports = router;
