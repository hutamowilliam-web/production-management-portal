# Production Management Application

A comprehensive production management system built with modern web technologies for tracking internal rejects, customer returns, SOP failures, and maintenance tickets.

## 🚀 Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** (Railway hosted)
- **Redis** for caching
- **JWT** for authentication
- **Socket.io** for real-time notifications
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Query** for data fetching
- **React Hook Form** for form management
- **Recharts** for data visualization
- **Socket.io Client** for real-time updates

### Database
- **MySQL** for relational data
- **JSON** for form configurations and settings

## 📋 Features

### Core Modules
1. **Internal Rejects Management**
   - Submit and track production rejects
   - Status tracking (Pending, Stock Received, No Stock, Wrong Stock)
   - Cost tracking and reporting
   - Automated notifications

2. **Customer Returns Processing**
   - Return request management
   - Status tracking (Credited, Replaced, Credit and Replaced)
   - RAF date tracking
   - Resolution monitoring

3. **SOP Failure Tracking**
   - Standard Operating Procedure failure logging
   - NCR (Non-Conformance Report) management
   - Escalation workflows
   - Department assignment and reassignment

4. **Maintenance Tickets**
   - Production machinery maintenance requests
   - Downtime tracking
   - Cost management
   - Technician assignment

### Advanced Features
- **Dynamic Form Builder** - Admin can create custom forms
- **Role-Based Access Control** - Granular permissions system
- **Real-time Notifications** - Socket.io powered updates
- **Dark/Light Theme** - User preference support
- **Professional UI** - Office-like interface (Outlook, D365 inspired)
- **Encrypted Data Storage** - Sensitive data encryption
- **Activity Logging** - Complete audit trail
- **Performance Analytics** - Department performance tracking

## 🏗️ Project Structure

```
new code app/
├── backend/                 # Node.js backend
│   ├── config/             # Database and app configuration
│   ├── middleware/         # Authentication and error handling
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript definitions
│   │   └── utils/         # Utility functions
├── database/              # Database schema and migrations
├── json-schemas/          # JSON configuration files
└── config/               # Application configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL database (Railway)
- Redis instance (Railway)
- Git (for cloning)

### Quick Start (Windows)

1. **Setup Database** (Run once):
   ```cmd
   setup-database.bat
   ```
   Enter your MySQL password when prompted.

2. **Start Application**:
   ```cmd
   start.bat
   ```
   This will install dependencies and start both servers.

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Manual Setup

#### Database Setup

1. Create database schema:
   ```bash
   mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/schema.sql
   ```

2. Insert seed data:
   ```bash
   mysql -h yamanote.proxy.rlwy.net -u root -p --port 36349 --protocol=TCP railway < database/seed.sql
   ```

#### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Default Login Credentials

- **System Admin**: admin / password
- **Department Manager**: john.manager / password
- **Production Coordinator**: jane.coordinator / password
- **Quality Inspector**: mike.inspector / password
- **Head of Production**: sarah.head / password

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DB_HOST=yamanote.proxy.rlwy.net
DB_PORT=36349
DB_USER=root
DB_PASSWORD=MteyGnigTYTKfEqOOTemnSzUOdPMBEpz
DB_NAME=railway

# Redis
REDIS_URL=redis://default:yVSmSKMhIrpPADjuQVvdhkPkiVDbAORo@interchange.proxy.rlwy.net:56942

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### JSON Configurations

The application uses JSON files for:
- Department structures and SOP failure types
- User roles and permissions
- Dynamic form definitions
- Application settings

## 👥 User Roles & Permissions

### 1. Production Coordinators
- Submit internal rejects and customer returns
- Submit SOP failures and maintenance tickets
- Update reject/return statuses
- View own department data

### 2. Quality Control Checker
- Same as Production Coordinators
- Additional quality control permissions

### 3. Department Floor Managers
- Manage department users
- Assign and reassign tickets
- Update all department ticket statuses
- View department reports
- Track user activity

### 4. Planning Manager
- Cross-department visibility for rejects/returns
- All department manager permissions
- File SOP failures and NCRs

### 5. System Admin
- Full system access
- Create/edit/delete forms
- Manage user permissions
- Database table creation from frontend

### 6. Head of Production
- Oversee all departments
- View escalated/rejected tickets
- Performance monitoring

### 7. Quality Inspector
- Similar to Head of Production
- Quality-focused oversight

## 📊 Key Features

### Dynamic Form System
- Admin can create forms with various field types
- Fields can connect to database tables for dropdowns
- Auto-calculation support
- Dynamic database table creation

### Professional UI Design
- Office-like interface inspired by Outlook, D365, Excel
- Dark/Light theme support
- Responsive design
- Rich data tables with filtering and sorting

### Real-time Features
- Live notifications via Socket.io
- Status updates broadcast to relevant users
- Activity feed updates

### Security
- JWT-based authentication
- Role-based access control
- Data encryption for sensitive information
- Activity logging and audit trails

## 🔄 Workflow Examples

### Internal Reject Workflow
1. Production Coordinator submits reject
2. System creates reject slip and notifies department users
3. Status tracking: Pending → Stock Received/No Stock/Wrong Stock
4. Automated alerts for high-value rejects (>R2000)
5. Time-based escalation for pending items

### SOP Failure Workflow
1. User logs SOP failure against department/area
2. Manager assigns to area supervisor/team leader
3. Status progression: Open → Escalated → Accepted/Rejected → Closed
4. NCR report required before closure
5. Escalation to Head of Production for disputes

## 📈 Performance Monitoring

- Department performance matrices
- Ticket aging and flagging system
- Resolution time tracking
- Cost analysis and reporting
- User activity monitoring

## 🚀 Deployment

### Production Deployment
1. Build frontend: `npm run build`
2. Configure production environment variables
3. Deploy to your hosting platform
4. Set up SSL certificates
5. Configure database backups

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Contact your system administrator
- Create an issue in the repository

---

**Built with ❤️ for Production Management Excellence**