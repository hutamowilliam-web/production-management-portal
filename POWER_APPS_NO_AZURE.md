# 🔌 Power Apps Integration Without Azure AD

## Overview

Your Production Management Portal can connect to Power Apps **without using Azure AD**. We support multiple authentication methods:

✅ **Connection String** (Recommended - Direct Dynamics 365 connection)  
✅ **API Key** (If your org uses API keys)  
✅ **Azure AD OAuth 2.0** (Optional - if you prefer this method)  

---

## ⚡ Quick Setup (No Azure Needed)

### Step 1: Get Your Connection String

#### From Power Apps:
1. Go to **Power Apps Portal**: https://make.powerapps.com
2. Click **Settings** (gear icon, top right)
3. Go to **Admin center** → **Environments**
4. Select your environment
5. Click **Settings** → **Connectors** → **Connection Strings**
6. Copy the connection string

#### From Dynamics 365:
1. Go to **Settings** → **Advanced Settings**
2. Navigate to **Settings** → **Customizations** → **Developer Resources**
3. Copy the **Service Endpoint** (Web API endpoint)
4. Or go to **Organization Service** section

#### Alternative - Build Connection String Manually:
```
AuthType=OAuth;Url=https://orgc50eefba.crm4.dynamics.com;ClientId=YOUR_CLIENT_ID;ClientSecret=YOUR_SECRET;RedirectUri=http://localhost
```

### Step 2: Update .env File

```env
# Use CONNECTION STRING (no Azure AD needed)
POWER_APPS_CONNECTION_STRING=AuthType=OAuth;Url=https://orgc50eefba.crm4.dynamics.com;ClientId=xxx;ClientSecret=xxx

# Or use API KEY
POWER_APPS_API_KEY=your_api_key_here

# Your instance URL is still needed
POWER_APPS_INSTANCE_URL=https://orgc50eefba.crm4.dynamics.com
POWER_APPS_API_VERSION=v9.2
```

### Step 3: Test Connection

```powershell
# Start backend server
cd backend
npm start

# In another terminal, test health endpoint
curl -X GET http://localhost:3001/api/power-apps/health
```

**Expected Response:**
```json
{
  "status": "connected",
  "userId": "...",
  "organizationId": "...",
  "timestamp": "2025-11-14T10:30:00.000Z"
}
```

---

## 🔐 Authentication Methods

### Method 1: Connection String (RECOMMENDED)

**Advantages:**
- ✅ No Azure AD setup needed
- ✅ Works with Dynamics 365 directly
- ✅ Simpler configuration
- ✅ Supports certificate-based auth

**Configuration:**
```env
POWER_APPS_CONNECTION_STRING=AuthType=OAuth;Url=https://orgc50eefba.crm4.dynamics.com;ClientId=YOUR_ID;ClientSecret=YOUR_SECRET
```

**Where to Get It:**
1. Power Apps Portal → Settings → Admin Center
2. Dynamics 365 → Settings → Developer Resources
3. Ask your Dynamics 365 administrator

### Method 2: API Key

**Advantages:**
- ✅ Simple single token
- ✅ No complex configuration
- ✅ Easy for development

**Disadvantages:**
- ✗ Organization must support API keys
- ✗ Limited scope control

**Configuration:**
```env
POWER_APPS_API_KEY=your_organization_api_key
```

### Method 3: Azure AD (Optional)

**Advantages:**
- ✅ Enterprise-grade security
- ✅ Role-based access
- ✅ Multi-factor authentication support

**Disadvantages:**
- ✗ Requires Azure setup
- ✗ More complex configuration

**Configuration:**
```env
POWER_APPS_TENANT_ID=your_tenant_id
POWER_APPS_CLIENT_ID=your_client_id
POWER_APPS_CLIENT_SECRET=your_client_secret
```

---

## 📋 How to Find Your Dynamics 365 Information

### Organization ID
```
Found in: Settings → Developer Resources → Web API Endpoint
Example: https://orgc50eefba.crm4.dynamics.com/api/data/v9.2/

Extract: orgc50eefba
```

### Environment ID
```
Power Apps Portal → Environments → Your Environment
Look for "Environment ID" in the details panel
```

### Instance URL
```
Simply the base URL of your Dynamics 365:
https://orgc50eefba.crm4.dynamics.com
```

---

## 🔍 Testing Without Azure

### Test 1: Health Check (No Auth)
```powershell
curl -X GET http://localhost:3001/api/power-apps/health
```

### Test 2: Get Forms
```powershell
$token = "your_jwt_token_from_login"
curl -X GET http://localhost:3001/api/power-apps/forms `
  -H "Authorization: Bearer $token"
```

### Test 3: Sync a Form
```powershell
$token = "your_jwt_token_from_login"
curl -X POST http://localhost:3001/api/power-apps/sync-form `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"formId": 1}'
```

---

## 🛠️ Troubleshooting

### Problem: "No Power Apps authentication method configured"

**Solution:**
Make sure your `.env` file has ONE of these:
- `POWER_APPS_CONNECTION_STRING` (recommended)
- `POWER_APPS_API_KEY`
- `POWER_APPS_CLIENT_ID` + `POWER_APPS_CLIENT_SECRET` + `POWER_APPS_TENANT_ID`

### Problem: "Invalid connection string"

**Solution:**
Verify format:
```
AuthType=OAuth;Url=https://orgXXXX.crm4.dynamics.com;ClientId=XXX;ClientSecret=XXX
```

Check for:
- Correct URL (HTTPS, not HTTP)
- No extra spaces
- Proper semicolon separators

### Problem: "Connection timeout"

**Solution:**
- Verify instance URL is correct
- Check internet connection
- Test URL in browser: https://orgc50eefba.crm4.dynamics.com
- Check firewall/proxy settings

### Problem: "Unauthorized (401)"

**Solution:**
- Connection string may be expired
- API key may be revoked
- Get fresh credentials from Power Apps admin

---

## 📚 Getting Connection String from Power Apps

### Step-by-Step Instructions:

1. **Go to Power Apps Portal**
   ```
   https://make.powerapps.com
   ```

2. **Click Settings (Gear Icon)**
   ```
   Top right corner
   ```

3. **Select "Admin Center"**
   ```
   Opens Power Platform admin center
   ```

4. **Go to Environments**
   ```
   Left sidebar → Environments
   ```

5. **Select Your Environment**
   ```
   Click the environment name: "Production" or custom name
   ```

6. **Find Connection Information**
   ```
   Look for section titled "Connection Information" or "Details"
   ```

7. **Copy Connection String or Build It**
   ```
   Format: AuthType=OAuth;Url=YOUR_URL;ClientId=YOUR_ID;ClientSecret=YOUR_SECRET
   ```

---

## 🔄 How It Works (No Azure)

```
Your App
    ↓
Power Apps Service (powerAppsService.js)
    ↓
Read POWER_APPS_CONNECTION_STRING from .env
    ↓
Extract credentials from connection string
    ↓
Connect directly to Dynamics 365
    ↓
Get/sync data (no Azure AD needed)
    ↓
Return to app
```

---

## ✅ Verification Checklist

- [ ] `.env` file contains `POWER_APPS_CONNECTION_STRING` or `POWER_APPS_API_KEY`
- [ ] `POWER_APPS_INSTANCE_URL` set to your Dynamics 365 URL
- [ ] Backend server starts without authentication errors
- [ ] Health endpoint returns "connected" status
- [ ] Can get forms from Power Apps
- [ ] Can sync forms to Power Apps
- [ ] No Azure AD setup needed

---

## 📊 Comparison Table

| Feature | Connection String | API Key | Azure AD |
|---------|-------------------|---------|----------|
| Setup Time | 5 minutes | 2 minutes | 30 minutes |
| Azure Required | No | No | Yes |
| Enterprise Ready | ✅ Yes | ⚠️ Basic | ✅ Yes |
| Token Caching | ✅ Yes | ✅ Yes | ✅ Yes |
| Scope Control | ✅ Yes | ❌ No | ✅ Yes |
| MFA Support | ⚠️ Limited | ❌ No | ✅ Yes |

---

## 🎯 Recommended Setup

For **most organizations** (without Azure):

```env
# Use connection string - simplest and most direct
POWER_APPS_CONNECTION_STRING=AuthType=OAuth;Url=https://orgc50eefba.crm4.dynamics.com;ClientId=YOUR_CLIENT_ID;ClientSecret=YOUR_SECRET

# Keep instance URL for reference
POWER_APPS_INSTANCE_URL=https://orgc50eefba.crm4.dynamics.com
POWER_APPS_API_VERSION=v9.2
POWER_APPS_ORGANIZATION_ID=0821ea5d-22b3-f011-8706-002248a15045
POWER_APPS_ENVIRONMENT_ID=191e27b3-e1c2-e59a-a351-14238bd22a4f

# Don't set Azure credentials unless you have them
# POWER_APPS_TENANT_ID=...
# POWER_APPS_CLIENT_ID=...
# POWER_APPS_CLIENT_SECRET=...
```

---

## 📞 Support

**Question: Where do I get ClientId and ClientSecret?**
- Answer: From your Power Apps or Dynamics 365 administrator, or from the connection information in Power Apps portal

**Question: Can I use both connection string and Azure AD?**
- Answer: Yes! Service will try connection string first, then fall back to Azure AD if needed

**Question: What if my organization doesn't have a connection string?**
- Answer: Ask your Dynamics 365 administrator or use API key method

**Question: Is connection string method secure?**
- Answer: Yes - connection string contains encrypted credentials and is stored only in `.env` (which is in `.gitignore`)

---

## 🚀 Next Steps

1. Get connection string from Power Apps admin
2. Add to `.env` file
3. Test health endpoint
4. Start syncing data
5. No Azure setup needed!

**You're ready to use Power Apps without Azure AD!** 🎉

---

*Last Updated: November 14, 2025*  
*Documentation: Power Apps Integration without Azure AD*
