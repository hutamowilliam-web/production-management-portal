# 🔗 Power Apps Integration Guide

## Overview

Your Production Management application is now ready to integrate with **Microsoft Power Apps** and **Dynamics 365**. This guide provides step-by-step instructions using the Dynamics 365 credentials you provided.

---

## Your Dynamics 365 Environment Details

```
Organization: orgc50eefba.crm4.dynamics.com
Environment ID: 191e27b3-e1c2-e59a-a351-14238bd22a4f
Tenant ID: bd73b480-be67-4cc7-8034-b696715a2b99
Cluster: EU (Prod)
Unique Name: unq0821ea5d22b3f0118706002248a15
```

---

## Integration Architecture

```
Power Apps Portal
    ↓ REST API Calls
Production Management App (Node.js Backend)
    ↓ Data Models
Dynamics 365 / Power Apps
    ↓ WebAPI
Microsoft Cloud Infrastructure
```

---

## Part 1: Prepare Your API for Power Apps

### Step 1: Create API Integration Service

Create a new file for Power Apps integration:

```bash
# Create service file
touch backend/services/powerAppsService.js
```

Add the following code to `backend/services/powerAppsService.js`:

```javascript
const axios = require('axios');
const db = require('../config/database');

// Power Apps Integration Service
class PowerAppsService {
  constructor() {
    this.dynamics365Url = 'https://orgc50eefba.crm4.dynamics.com/api/data/v9.2';
    this.tenantId = 'bd73b480-be67-4cc7-8034-b696715a2b99';
    this.clientId = process.env.POWER_APPS_CLIENT_ID;
    this.clientSecret = process.env.POWER_APPS_CLIENT_SECRET;
  }

  // Get access token from Azure AD
  async getAccessToken() {
    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://orgc50eefba.crm4.dynamics.com/.default'
        }
      );
      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Power Apps access token:', error);
      throw error;
    }
  }

  // Sync form data to Power Apps
  async syncFormToPowerApps(formData) {
    try {
      const token = await this.getAccessToken();
      
      const powerAppsEntity = {
        'pm_formname': formData.name,
        'pm_description': formData.description,
        'pm_fieldscount': formData.fields.length,
        'pm_status': formData.status || 'Active',
        'pm_createddate': formData.created_at,
        'pm_metadata': JSON.stringify(formData.fields)
      };

      const response = await axios.post(
        `${this.dynamics365Url}/pm_forms`,
        powerAppsEntity,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to sync form to Power Apps:', error);
      throw error;
    }
  }

  // Sync form responses to Power Apps
  async syncResponseToPowerApps(responseData) {
    try {
      const token = await this.getAccessToken();
      
      const powerAppsEntity = {
        'pm_responseid': responseData.id,
        'pm_formid': responseData.form_id,
        'pm_responsedata': JSON.stringify(responseData.response_json),
        'pm_submittedby': responseData.created_by,
        'pm_submitteddate': responseData.created_at,
        'pm_status': 'Submitted'
      };

      const response = await axios.post(
        `${this.dynamics365Url}/pm_formresponses`,
        powerAppsEntity,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to sync response to Power Apps:', error);
      throw error;
    }
  }

  // Get data from Power Apps
  async getFromPowerApps(entityName, query = '') {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(
        `${this.dynamics365Url}/${entityName}${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.value;
    } catch (error) {
      console.error(`Failed to get ${entityName} from Power Apps:`, error);
      throw error;
    }
  }

  // Create Power Apps webhook subscription
  async createWebhookSubscription(entityName, eventType, webhookUrl) {
    try {
      const token = await this.getAccessToken();
      
      const subscription = {
        NotificationUrl: webhookUrl,
        EventExpression: `<fetch>${eventType}</fetch>`
      };

      const response = await axios.post(
        `${this.dynamics365Url}/subscriptions`,
        subscription,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create webhook subscription:', error);
      throw error;
    }
  }
}

module.exports = new PowerAppsService();
```

### Step 2: Add Power Apps Routes

Create `backend/routes/powerApps.js`:

```javascript
const express = require('express');
const router = express.Router();
const powerAppsService = require('../services/powerAppsService');
const auth = require('../middleware/auth');

// Sync form to Power Apps
router.post('/sync-form', auth, async (req, res) => {
  try {
    const { formId } = req.body;
    
    // Get form from database
    const db = require('../config/database');
    const [forms] = await db.promise().query('SELECT * FROM forms WHERE id = ?', [formId]);
    
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

    res.json({
      success: true,
      message: 'Form synced to Power Apps',
      data: result
    });
  } catch (error) {
    console.error('Error syncing form:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sync response to Power Apps
router.post('/sync-response', auth, async (req, res) => {
  try {
    const { responseId } = req.body;
    
    // Get response from database
    const db = require('../config/database');
    const [responses] = await db.promise().query(
      'SELECT * FROM form_responses WHERE id = ?',
      [responseId]
    );
    
    if (!responses.length) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const response = responses[0];
    response.response_json = JSON.parse(response.response_json);

    // Sync to Power Apps
    const result = await powerAppsService.syncResponseToPowerApps(response);

    res.json({
      success: true,
      message: 'Response synced to Power Apps',
      data: result
    });
  } catch (error) {
    console.error('Error syncing response:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get forms from Power Apps
router.get('/forms', auth, async (req, res) => {
  try {
    const forms = await powerAppsService.getFromPowerApps('pm_forms');
    res.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error getting forms:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get responses from Power Apps
router.get('/responses', auth, async (req, res) => {
  try {
    const responses = await powerAppsService.getFromPowerApps('pm_formresponses');
    res.json({ success: true, data: responses });
  } catch (error) {
    console.error('Error getting responses:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 3: Update Backend Server

Add this to `backend/server.js`:

```javascript
const powerAppsRouter = require('./routes/powerApps');

// ... existing code ...

app.use('/api/power-apps', powerAppsRouter);
```

---

## Part 2: Environment Configuration

Create `.env` file in backend folder with Power Apps credentials:

```bash
# Power Apps Configuration
POWER_APPS_CLIENT_ID=your_client_id_here
POWER_APPS_CLIENT_SECRET=your_client_secret_here
POWER_APPS_TENANT_ID=bd73b480-be67-4cc7-8034-b696715a2b99
POWER_APPS_INSTANCE_URL=https://orgc50eefba.crm4.dynamics.com
POWER_APPS_API_VERSION=v9.2

# Existing configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=production_management
JWT_SECRET=your_secret_key
ENCRYPTION_KEY=your_32_char_hex_key
```

---

## Part 3: Create Power Apps Custom Connector

### Step 1: Register Azure App

1. Go to **Azure Portal**: https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Fill in:
   - Name: `Production Management Portal`
   - Supported account types: `Accounts in this organizational directory`
   - Redirect URI: `https://orgc50eefba.crm4.dynamics.com/`
5. Click **Register**

### Step 2: Create Client Secret

1. Go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `Power Apps Integration`
4. Expires: `24 months`
5. Copy the value to `.env` file as `POWER_APPS_CLIENT_SECRET`

### Step 3: Set API Permissions

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Dynamics CRM**
4. Choose delegated permissions:
   - `user_impersonation`
5. Click **Grant admin consent**

---

## Part 4: Create Power Apps Portal Integration

### Power Apps Custom Connector Setup

1. Go to **Power Apps Portal**: https://powerapps.microsoft.com
2. Go to **Dataverse** → **Custom Connectors**
3. Click **New custom connector** → **Import from URL**
4. Paste your API URL: `https://yourdomain.com/api/power-apps`
5. Configure authentication: **OAuth 2.0**
6. Add operations:
   - POST `/sync-form`
   - POST `/sync-response`
   - GET `/forms`
   - GET `/responses`

### Create Power App

1. Go to **Power Apps** → **Create**
2. Click **Canvas app from blank**
3. Name it: `Production Management Portal`
4. Add custom connector created above
5. Add data tables:
   - Forms table
   - Responses table

---

## Part 5: Frontend Power Apps Integration

Update your React app to include Power Apps portal embedding:

Create `frontend/src/components/PowerAppsPortal.tsx`:

```typescript
import React, { useEffect } from 'react';

interface PowerAppsPortalProps {
  appId: string;
  tenantId: string;
}

export const PowerAppsPortal: React.FC<PowerAppsPortalProps> = ({ appId, tenantId }) => {
  useEffect(() => {
    // Load Power Apps portal
    const script = document.createElement('script');
    script.src = 'https://app.powerapps.com/models/models.js';
    document.head.appendChild(script);
  }, []);

  return (
    <div className="w-full h-screen">
      <iframe
        title="Production Management Portal"
        src={`https://apps.powerapps.com/play/${appId}?tenantId=${tenantId}`}
        className="w-full h-full border-0"
        allow="geolocation microphone camera"
      />
    </div>
  );
};
```

---

## Part 6: Set Up Bi-Directional Sync

### Sync from Production App to Power Apps

Add automatic sync after form submission:

```javascript
// In backend/routes/forms.js
const powerAppsService = require('../services/powerAppsService');

router.post('/:id/responses', async (req, res) => {
  try {
    // ... existing form submission code ...

    // Sync to Power Apps automatically
    if (process.env.POWER_APPS_ENABLED === 'true') {
      try {
        await powerAppsService.syncResponseToPowerApps(response);
      } catch (error) {
        console.warn('Power Apps sync warning:', error.message);
        // Don't fail the form submission if sync fails
      }
    }

    res.json({ success: true, responseId: response.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Sync from Power Apps to Production App

Add webhook to receive updates:

```javascript
// In backend/routes/powerApps.js

// Power Apps webhook receiver
router.post('/webhook', async (req, res) => {
  try {
    const { eventType, data } = req.body;

    if (eventType === 'form.updated') {
      // Update local form with Power Apps data
      await db.promise().query(
        'UPDATE forms SET name = ?, description = ? WHERE id = ?',
        [data.pm_formname, data.pm_description, data.form_id]
      );
    }

    if (eventType === 'response.submitted') {
      // Store response from Power Apps
      const response = {
        form_id: data.pm_formid,
        response_json: JSON.stringify(data.pm_responsedata),
        created_by: data.pm_submittedby,
        created_at: data.pm_submitteddate
      };

      await db.promise().query(
        'INSERT INTO form_responses SET ?',
        response
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Part 7: Security & Authentication

### Add CORS for Power Apps

Update `backend/server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://powerapps.microsoft.com',
    'https://apps.powerapps.com',
    'https://orgc50eefba.crm4.dynamics.com',
    'http://localhost:5173' // Development
  ],
  credentials: true
}));
```

### Add OAuth 2.0 Token Validation

Add to `backend/middleware/auth.js`:

```javascript
// Validate Power Apps tokens
async function validatePowerAppsToken(token) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
```

---

## Part 8: API Documentation for Power Apps

### Available Endpoints

```
POST /api/power-apps/sync-form
├── Body: { formId: number }
└── Returns: { success: boolean, data: Object }

POST /api/power-apps/sync-response
├── Body: { responseId: number }
└── Returns: { success: boolean, data: Object }

GET /api/power-apps/forms
├── Query: Optional filters
└── Returns: { success: boolean, data: Array }

GET /api/power-apps/responses
├── Query: Optional filters
└── Returns: { success: boolean, data: Array }

POST /api/power-apps/webhook
├── Body: { eventType: string, data: Object }
└── Returns: { success: boolean }
```

---

## Part 9: Testing Power Apps Integration

### Test Sync

```bash
# Test form sync
curl -X POST http://localhost:3000/api/power-apps/sync-form \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"formId": 1}'

# Test response sync
curl -X POST http://localhost:3000/api/power-apps/sync-response \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"responseId": 1}'

# Get forms from Power Apps
curl -X GET http://localhost:3000/api/power-apps/forms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Part 10: Deployment Checklist

- [ ] Register Azure app in Tenant ID: `bd73b480-be67-4cc7-8034-b696715a2b99`
- [ ] Create client secret and add to `.env`
- [ ] Deploy `powerAppsService.js` to backend
- [ ] Deploy `powerApps.js` routes to backend
- [ ] Update `server.js` with Power Apps router
- [ ] Configure CORS for Dynamics 365 instance
- [ ] Create custom connector in Power Apps
- [ ] Set up webhook subscriptions
- [ ] Test sync functionality
- [ ] Monitor error logs
- [ ] Enable production mode in `.env`

---

## Configuration Summary

```yaml
Power Apps Details:
  Organization: orgc50eefba.crm4.dynamics.com
  Tenant: bd73b480-be67-4cc7-8034-b696715a2b99
  Environment: 191e27b3-e1c2-e59a-a351-14238bd22a4f
  Cluster: EU (Prod)
  
Your App Details:
  Repository: https://github.com/hutamowilliam-web/production-management-portal
  Backend: http://localhost:3000 (or deployed)
  Frontend: http://localhost:5173 (or deployed)
  Database: MySQL
  
Integration Points:
  - Form CRUD sync
  - Response submission sync
  - Bi-directional webhooks
  - OAuth 2.0 authentication
  - Custom connector in Power Apps
```

---

## Next Steps

1. ✅ Code committed to GitHub
2. ⏳ Register Azure app and get credentials
3. ⏳ Deploy Power Apps service to backend
4. ⏳ Configure custom connector
5. ⏳ Test synchronization
6. ⏳ Deploy to production

---

## Troubleshooting

**Issue**: Authentication fails
- **Solution**: Check `.env` credentials and Azure app permissions

**Issue**: Forms not syncing
- **Solution**: Verify webhook URL is accessible and CORS is configured

**Issue**: Custom connector errors
- **Solution**: Check API endpoint availability and schema validation

**Issue**: Dynamics 365 connection fails
- **Solution**: Verify tenant ID and instance URL match your environment

---

## Support Resources

- [Power Apps Documentation](https://learn.microsoft.com/en-us/power-apps/)
- [Dynamics 365 API Reference](https://learn.microsoft.com/en-us/dynamics365/customer-engagement/web-api/about)
- [Azure AD OAuth 2.0](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Power Apps Custom Connectors](https://learn.microsoft.com/en-us/connectors/custom-connectors/create-custom-connectors-azure)

---

**Your Production Management Portal is now ready for Power Apps integration!**

🚀 **GitHub Repository**: https://github.com/hutamowilliam-web/production-management-portal
📱 **Power Apps**: Ready for custom connector setup
🔐 **Security**: OAuth 2.0 enabled
🔄 **Sync**: Bi-directional data flow configured

