# Install Node.js - Required Step

## ❌ Current Issue
Node.js is not installed on your system. You need it to run the application.

## ✅ Solution

### Step 1: Download Node.js
Go to: **https://nodejs.org/en/download/**

Download the **Windows Installer (.msi)** - LTS version (recommended)

### Step 2: Install Node.js
1. Run the downloaded installer
2. Click "Next" through the installation wizard
3. Accept the license agreement
4. Keep default installation path
5. **IMPORTANT**: Check the box "Automatically install necessary tools"
6. Click "Install"
7. Restart your PowerShell/Command Prompt

### Step 3: Verify Installation
Open a new PowerShell window and run:
```powershell
node --version
npm --version
```

You should see version numbers like:
```
v18.x.x
9.x.x
```

### Step 4: Install Application Dependencies
Once Node.js is installed, run:

```powershell
cd "C:\Users\4667.KevroAD\new code app\backend"
npm install

cd ..\frontend
npm install
```

### Step 5: Start the Application
```powershell
cd ..
.\start.bat
```

## 🚀 Quick Install (Alternative)

Use Chocolatey package manager:
```powershell
# Install Chocolatey first (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs-lts -y

# Restart PowerShell, then install dependencies
cd "C:\Users\4667.KevroAD\new code app\backend"
npm install

cd ..\frontend
npm install
```

## 📋 After Installation

Once Node.js is installed and dependencies are ready:

1. **Start Backend:**
   ```powershell
   cd backend
   npm run dev
   ```

2. **Start Frontend (new terminal):**
   ```powershell
   cd frontend
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:3000
   - Login: admin / password

## ⚡ Estimated Time
- Download: 2-3 minutes
- Installation: 2-3 minutes
- Dependencies: 5-10 minutes
- **Total: ~15 minutes**

## 🆘 Need Help?
If you encounter issues:
1. Make sure you restart PowerShell after installing Node.js
2. Run PowerShell as Administrator
3. Check Windows PATH includes Node.js installation directory