const axios = require('axios');
const db = require('../config/database');

/**
 * Power Apps Integration Service
 * Handles OAuth 2.0 authentication, data sync, and webhook management with Dynamics 365
 */
class PowerAppsService {
  constructor() {
    this.dynamics365Url = process.env.POWER_APPS_INSTANCE_URL || 'https://orgc50eefba.crm4.dynamics.com';
    this.apiVersion = process.env.POWER_APPS_API_VERSION || 'v9.2';
    this.baseUrl = `${this.dynamics365Url}/api/data/${this.apiVersion}`;
    this.tenantId = process.env.POWER_APPS_TENANT_ID;
    this.clientId = process.env.POWER_APPS_CLIENT_ID;
    this.clientSecret = process.env.POWER_APPS_CLIENT_SECRET;
    this.tokenCache = {};
  }

  /**
   * Get access token from Azure AD with caching
   * @returns {Promise<string>} Access token
   */
  async getAccessToken() {
    try {
      // Check if token is still valid (cached for 50 minutes)
      if (this.tokenCache.token && this.tokenCache.expiresAt > Date.now()) {
        return this.tokenCache.token;
      }

      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: `${this.dynamics365Url}/.default`
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Cache token for 50 minutes (3000 seconds)
      this.tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000 - 60000)
      };

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Power Apps access token:', error.response?.data || error.message);
      throw new Error(`Power Apps authentication failed: ${error.message}`);
    }
  }

  /**
   * Sync form to Dynamics 365 Dataverse
   * @param {Object} formData - Form data object
   * @returns {Promise<Object>} Sync result
   */
  async syncFormToPowerApps(formData) {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Power Apps credentials not configured');
      }

      const token = await this.getAccessToken();

      const powerAppsEntity = {
        'pm_formname': formData.name,
        'pm_description': formData.description || '',
        'pm_fieldscount': formData.fields?.length || 0,
        'pm_status': formData.status || 'Active',
        'pm_createddate': new Date(formData.created_at).toISOString(),
        'pm_metadata': JSON.stringify(formData.fields || []),
        'pm_formtype': formData.type || 'Standard',
        'pm_externalid': `form_${formData.id}`
      };

      const response = await axios.post(
        `${this.baseUrl}/pm_forms`,
        powerAppsEntity,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      console.log(`[PowerApps] Form ${formData.id} synced successfully`);
      return {
        success: true,
        externalId: response.data.pm_formid,
        data: response.data
      };
    } catch (error) {
      console.error('[PowerApps] Form sync failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync form response to Dynamics 365 Dataverse
   * @param {Object} responseData - Form response data
   * @returns {Promise<Object>} Sync result
   */
  async syncResponseToPowerApps(responseData) {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Power Apps credentials not configured');
      }

      const token = await this.getAccessToken();

      const powerAppsEntity = {
        'pm_responseid': `response_${responseData.id}`,
        'pm_formidname': `form_${responseData.form_id}`,
        'pm_responsedata': JSON.stringify(responseData.response_json),
        'pm_submittedby': responseData.created_by || 'System',
        'pm_submitteddate': new Date(responseData.created_at).toISOString(),
        'pm_status': 'Submitted',
        'pm_externalid': `response_${responseData.id}`
      };

      const response = await axios.post(
        `${this.baseUrl}/pm_formresponses`,
        powerAppsEntity,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      console.log(`[PowerApps] Response ${responseData.id} synced successfully`);
      return {
        success: true,
        externalId: response.data.pm_formresponseid,
        data: response.data
      };
    } catch (error) {
      console.error('[PowerApps] Response sync failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get data from Dynamics 365 Dataverse
   * @param {string} entityName - Entity collection name
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Entity collection
   */
  async getFromPowerApps(entityName, options = {}) {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Power Apps credentials not configured');
      }

      const token = await this.getAccessToken();

      // Build query string
      let query = '';
      if (options.select) query += `?$select=${options.select.join(',')}`;
      if (options.filter) query += (query ? '&' : '?') + `$filter=${options.filter}`;
      if (options.orderBy) query += (query ? '&' : '?') + `$orderby=${options.orderBy}`;
      if (options.top) query += (query ? '&' : '?') + `$top=${options.top}`;

      const response = await axios.get(
        `${this.baseUrl}/${entityName}${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      console.log(`[PowerApps] Retrieved ${response.data.value.length} records from ${entityName}`);
      return response.data.value;
    } catch (error) {
      console.error(`[PowerApps] Get ${entityName} failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update entity in Dynamics 365 Dataverse
   * @param {string} entityName - Entity collection name
   * @param {string} recordId - Record ID
   * @param {Object} data - Data to update
   * @returns {Promise<Object>} Update result
   */
  async updateInPowerApps(entityName, recordId, data) {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Power Apps credentials not configured');
      }

      const token = await this.getAccessToken();

      await axios.patch(
        `${this.baseUrl}/${entityName}(${recordId})`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      console.log(`[PowerApps] Updated record ${recordId} in ${entityName}`);
      return { success: true };
    } catch (error) {
      console.error(`[PowerApps] Update failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create webhook subscription for real-time updates
   * @param {string} entityName - Entity collection name
   * @param {string} webhookUrl - Webhook endpoint URL
   * @param {string} eventType - Event type (create, update, delete)
   * @returns {Promise<Object>} Subscription result
   */
  async createWebhookSubscription(entityName, webhookUrl, eventType = 'create') {
    try {
      if (!this.clientId || !this.clientSecret) {
        throw new Error('Power Apps credentials not configured');
      }

      const token = await this.getAccessToken();

      const subscription = {
        'pm_name': `${entityName}_${eventType}_webhook`,
        'pm_targeturl': webhookUrl,
        'pm_eventtype': eventType,
        'pm_entity': entityName,
        'pm_isactive': true
      };

      const response = await axios.post(
        `${this.baseUrl}/pm_webhooksubscriptions`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      console.log(`[PowerApps] Webhook subscription created for ${entityName}`);
      return {
        success: true,
        subscriptionId: response.data.pm_webhooksubscriptionid,
        data: response.data
      };
    } catch (error) {
      console.error('[PowerApps] Webhook subscription failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Sync all forms to Power Apps (bulk operation)
   * @returns {Promise<Object>} Sync result summary
   */
  async syncAllForms() {
    try {
      const [forms] = await db.promise().query('SELECT * FROM forms WHERE deleted_at IS NULL');

      const results = {
        total: forms.length,
        synced: 0,
        failed: 0,
        errors: []
      };

      for (const form of forms) {
        try {
          const [fields] = await db.promise().query(
            'SELECT * FROM form_fields WHERE form_id = ? ORDER BY field_order',
            [form.id]
          );

          form.fields = fields;

          await this.syncFormToPowerApps(form);
          results.synced++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            formId: form.id,
            error: error.message
          });
        }
      }

      console.log(`[PowerApps] Bulk sync complete: ${results.synced}/${results.total} forms synced`);
      return results;
    } catch (error) {
      console.error('[PowerApps] Bulk sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Sync all responses to Power Apps (bulk operation)
   * @returns {Promise<Object>} Sync result summary
   */
  async syncAllResponses() {
    try {
      const [responses] = await db.promise().query('SELECT * FROM form_responses WHERE deleted_at IS NULL');

      const results = {
        total: responses.length,
        synced: 0,
        failed: 0,
        errors: []
      };

      for (const response of responses) {
        try {
          response.response_json = typeof response.response_json === 'string'
            ? JSON.parse(response.response_json)
            : response.response_json;

          await this.syncResponseToPowerApps(response);
          results.synced++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            responseId: response.id,
            error: error.message
          });
        }
      }

      console.log(`[PowerApps] Bulk sync complete: ${results.synced}/${results.total} responses synced`);
      return results;
    } catch (error) {
      console.error('[PowerApps] Bulk response sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Health check - verify Power Apps connectivity
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/WhoAmI`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0'
          }
        }
      );

      return {
        status: 'connected',
        userId: response.data.UserId,
        organizationId: response.data.OrganizationId,
        businessUnitId: response.data.BusinessUnitId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[PowerApps] Health check failed:', error.message);
      return {
        status: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new PowerAppsService();
