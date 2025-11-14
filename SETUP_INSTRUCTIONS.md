# Setup Instructions

## ✅ Database Setup Complete
The database has been successfully configured with:
- 5 demo users created
- 8 departments configured
- 8 user roles with permissions
- All tables ready

## 📋 Next Steps

### 1. Install Node.js
Download and install Node.js 18+ from: https://nodejs.org/

### 2. Install Dependencies

**Backend:**
```cmd
cd backend
npm install
```

**Frontend:**
```cmd
cd frontend
npm install
```

### 3. Start the Application

**Option A - Using start.bat:**
```cmd
start.bat
```

**Option B - Manual start:**

Terminal 1 (Backend):
```cmd
cd backend
npm run dev
```

Terminal 2 (Frontend):
```cmd
cd frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 5. Login Credentials

| Username | Password | Role |
|----------|----------|------|
| admin | password | System Admin |
| john.manager | password | Department Floor Manager |
| jane.coordinator | password | Production Coordinator |
| mike.inspector | password | Quality Inspector |
| sarah.head | password | Head Of Production |

## 🔧 Troubleshooting

### Port Already in Use
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database Connection Issues
Verify connection:
```cmd
mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway
```

### Redis Connection Issues
Test Redis:
```cmd
redis-cli -u redis://default:yVSmSKMhIrpPADjuQVvdhkPkiVDbAORo@interchange.proxy.rlwy.net:56942 PING
```

## 📊 Database Status

✅ MySQL Connection: Working
✅ Users Table: 5 users created
✅ Departments: 8 departments configured
✅ Roles: 8 roles with permissions
✅ Schema: All tables created

## 🚀 Ready to Launch

Once Node.js is installed and dependencies are ready, run:
```cmd
start.bat
```

The application will be available at http://localhost:3000