# Production Management API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
All API endpoints (except login) require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### POST /auth/login
Login user and get JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "admin",
    "first_name": "System",
    "last_name": "Admin",
    "role_name": "System Admin",
    "department_name": "IT Department"
  }
}
```

### Departments

#### GET /departments
Get all active departments.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Planning Department",
    "description": "Handles production planning and scheduling",
    "manager_id": 2,
    "first_name": "John",
    "last_name": "Manager"
  }
]
```

#### GET /departments/:id/areas
Get areas for a specific department.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Scheduling",
    "supervisor_id": null,
    "first_name": null,
    "last_name": null
  }
]
```

#### POST /departments
Create new department (Admin only).

**Request Body:**
```json
{
  "name": "New Department",
  "description": "Department description",
  "manager_id": 2
}
```

### Internal Rejects

#### GET /rejects
Get internal rejects (filtered by department if not admin).

**Query Parameters:**
- `department_id` (optional): Filter by department

**Response:**
```json
[
  {
    "id": 1,
    "sales_order_number": "SO001",
    "department_name": "Planning Department",
    "customer_name": "ABC Company",
    "product": "T-Shirt",
    "reason": "Wrong color printed",
    "reject_quantity": 50,
    "total_reject_cost": 1250.00,
    "status": "Pending",
    "created_at": "2024-01-15T10:30:00Z",
    "first_name": "Jane",
    "last_name": "Coordinator"
  }
]
```

#### POST /rejects
Submit new internal reject.

**Request Body:**
```json
{
  "sales_order_number": "SO001",
  "department_id": 1,
  "production_stage_id": 2,
  "customer_name": "ABC Company",
  "product": "T-Shirt",
  "reason": "Wrong color printed",
  "reject_quantity": 50,
  "total_reject_cost": 1250.00,
  "responsible_employee": "John Doe",
  "shift": "Day Shift",
  "faulty_department_id": 2
}
```

#### PATCH /rejects/:id/status
Update reject status.

**Request Body:**
```json
{
  "status": "Stock Received"
}
```

### Customer Returns

#### GET /returns
Get customer returns (filtered by department if not admin).

#### POST /returns
Submit new customer return.

**Request Body:**
```json
{
  "sales_order_number": "SO004",
  "department_id": 1,
  "production_stage": "Final Inspection",
  "return_date": "2024-01-15",
  "customer_name": "GHI Industries",
  "product": "Polo Shirt",
  "reason": "Size mismatch",
  "return_quantity": 20,
  "total_cost_return": 1100.00,
  "responsible_employee": "Jane Smith",
  "faulty_department_id": 2,
  "raf_date": "2024-01-20",
  "production_status": "credited"
}
```

### SOP Failures

#### GET /sop
Get SOP failures.

**Query Parameters:**
- `department_id` (optional): Filter by department
- `status` (optional): Filter by status

#### POST /sop
Submit new SOP failure.

**Request Body:**
```json
{
  "department_id": 1,
  "area_id": 1,
  "failure_type": "Scheduled incorrectly",
  "description": "Production schedule did not account for material delivery delay",
  "priority": "Medium",
  "notes": "Additional notes here"
}
```

#### PATCH /sop/:id/assign
Assign SOP failure to user.

**Request Body:**
```json
{
  "assigned_to": 3
}
```

#### PATCH /sop/:id/reassign
Reassign SOP failure to another department.

**Request Body:**
```json
{
  "new_department_id": 2,
  "notes": "Reassigning because this is a production issue, not planning"
}
```

#### GET /sop/:id/ncr
Get NCR reports for SOP failure.

#### POST /sop/:id/ncr
Create NCR report for SOP failure.

**Request Body:**
```json
{
  "report_content": "Detailed NCR report content",
  "corrective_action": "Immediate corrective actions taken",
  "preventive_action": "Preventive measures to avoid recurrence"
}
```

### Maintenance Tickets

#### GET /maintenance
Get maintenance tickets.

#### POST /maintenance
Submit new maintenance ticket.

**Request Body:**
```json
{
  "machine_name": "Embroidery Machine #3",
  "department_id": 2,
  "issue_description": "Thread tension mechanism needs adjustment",
  "priority": "Medium",
  "estimated_downtime": 120,
  "parts_required": "Tension spring, adjustment screws",
  "cost": 250.00
}
```

### Dashboard

#### GET /dashboard/stats
Get dashboard statistics.

**Query Parameters:**
- `department_id` (optional): Filter by department

**Response:**
```json
{
  "rejects": {
    "count": 15,
    "totalCost": 5250.00
  },
  "returns": {
    "count": 8,
    "totalCost": 2100.00
  },
  "sopFailures": {
    "open": 5,
    "escalated": 2,
    "closed": 12
  },
  "maintenanceTickets": {
    "open": 3,
    "in_progress": 2,
    "completed": 8
  }
}
```

#### GET /dashboard/activities
Get recent activities.

#### GET /dashboard/pending
Get items requiring attention (pending > 24 hours).

### Reports

#### GET /reports/performance
Get department performance report.

**Query Parameters:**
- `department_id` (optional): Filter by department
- `start_date` (optional): Start date for report
- `end_date` (optional): End date for report

#### GET /reports/aging
Get aging report for tickets.

#### GET /reports/financial
Get financial summary report.

**Query Parameters:**
- `department_id` (optional): Filter by department
- `period` (optional): 'daily', 'weekly', 'monthly', 'yearly'

### Forms

#### GET /forms/structures
Get form structures from JSON configuration.

#### GET /forms/dynamic
Get dynamic forms created by admin.

#### POST /forms/dynamic
Create new dynamic form (Admin only).

#### POST /forms/submit/:formId
Submit form data.

### Users

#### GET /users
Get users (filtered by department for non-admins).

#### POST /users
Create new user (Admin only).

#### PUT /users/:id
Update user (Admin only).

#### PATCH /users/:id/reset-password
Reset user password (Admin only).

### Notifications

#### GET /notifications
Get user notifications.

#### PATCH /notifications/:id/read
Mark notification as read.

#### PATCH /notifications/read-all
Mark all notifications as read.

#### GET /notifications/unread-count
Get unread notification count.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to 100 requests per 15-minute window per IP address.

## Data Encryption

Sensitive data (customer names, product details, descriptions) is automatically encrypted before storage and decrypted when retrieved.

## Real-time Updates

The application uses Socket.IO for real-time notifications. Connect to the WebSocket endpoint to receive live updates:

```javascript
const socket = io('http://localhost:3001');
socket.emit('join-department', departmentId);
```