# Phase 4 Preparation - Department Views & Role-Based Access

## Overview
Phase 4 will build the department management system and implement role-based data filtering across the application. This is a critical phase that enables:
- Department-specific dashboards
- Permission-based data access
- Admin department management
- Role visibility enforcement

---

## Phase 4 Objectives

### 1. Admin Management Components (60% of work)
- [ ] **AdminDepartmentPage**
  - List all departments
  - Create new departments
  - Edit department details
  - Delete departments
  - Assign users to departments
  - Set department permissions
  - View department members
  - Component size: ~400 lines

- [ ] **DepartmentRoleManagement**
  - Define roles per department
  - Assign permissions to roles
  - Create/update/delete roles
  - Map users to roles
  - Component size: ~350 lines

### 2. Dashboard Components (25% of work)
- [ ] **DepartmentDashboard**
  - Show department-specific metrics
  - Filter charts by department
  - Department KPIs
  - Department-specific activity feed
  - Component size: ~300 lines

- [ ] **DepartmentSelector**
  - Dropdown in sidebar/header
  - Switch between departments
  - Persist selection
  - Component size: ~100 lines

### 3. Data Filtering (15% of work)
- [ ] **Update Dashboard Page**
  - Filter metrics by department
  - Show only department data
  - Component size: ~50 lines change

- [ ] **Update Rejects Page**
  - Filter by assigned department
  - Show department-specific rejects
  - Component size: ~50 lines change

- [ ] **Update Returns Page**
  - Filter by processing department
  - Show department-specific returns
  - Component size: ~50 lines change

- [ ] **Update Forms Page**
  - Filter forms by department
  - Show department-specific responses only
  - Component size: ~50 lines change

---

## Backend Requirements (Phase 3 Carryover)

### API Endpoints Needed
These should be added to existing backend:

```
POST   /api/departments              # Create department
GET    /api/departments              # List all departments
GET    /api/departments/:id          # Get department detail
PUT    /api/departments/:id          # Update department
DELETE /api/departments/:id          # Delete department

POST   /api/departments/:id/users    # Assign user to department
DELETE /api/departments/:id/users/:userId # Remove user from department

POST   /api/roles                    # Create role
GET    /api/roles                    # List roles
PUT    /api/roles/:id                # Update role
DELETE /api/roles/:id                # Delete role

POST   /api/permissions              # Create permission
GET    /api/permissions              # List permissions

GET    /api/user/permissions         # Get current user permissions
```

### Database Changes Needed
Update existing tables:
```sql
-- Update users table
ALTER TABLE users ADD COLUMN role_id INT;
ALTER TABLE users ADD COLUMN department_id INT;

-- Create roles table
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions table
CREATE TABLE role_permissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT,
  permission_name VARCHAR(100),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create user_roles table
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  role_id INT,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
```

---

## Frontend Architecture

### New Context (Needed)
```typescript
// contexts/DepartmentContext.tsx
- currentDepartment: Department
- userDepartments: Department[]
- userPermissions: string[]
- setCurrentDepartment(id)
- hasPermission(permissionName): boolean
```

### Updated Types
```typescript
// types/index.ts - Add interfaces
interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface Role {
  id: number;
  department_id: number;
  name: string;
  description?: string;
}

interface UserPermission {
  role_id: number;
  permission_name: string;
}

// Update User interface
interface User extends AuthUser {
  department_id?: number;
  role_id?: number;
  permissions?: string[];
}
```

### Updated Services
```typescript
// services/authService.ts - Add functions
export const departmentService = {
  getDepartments: () => fetch('/api/departments'),
  createDepartment: (data) => fetch('/api/departments', {POST}),
  updateDepartment: (id, data) => fetch(`/api/departments/${id}`, {PUT}),
  deleteDepartment: (id) => fetch(`/api/departments/${id}`, {DELETE}),
  getUserPermissions: () => fetch('/api/user/permissions'),
  assignUserToDepartment: (deptId, userId) => fetch(...),
};
```

---

## Implementation Steps

### Step 1: Backend Setup (1-2 hours)
```
1. Create database migration for departments, roles, permissions tables
2. Update users table with department_id and role_id
3. Create Department model/service in backend
4. Create Role model/service in backend
5. Create Permission model/service in backend
6. Add 12+ new API endpoints
7. Add middleware to check department permissions
8. Test all endpoints with Postman/Thunder Client
```

### Step 2: Frontend Context (1 hour)
```
1. Create DepartmentContext.tsx
2. Create PermissionContext.tsx
3. Update AuthContext to include department/role info
4. Add usePermission hook
5. Add useDepartment hook
6. Add permission checking utility functions
7. Update App.tsx to wrap app with DepartmentContext
```

### Step 3: Admin Components (3-4 hours)
```
1. Create AdminDepartmentPage.tsx (400 lines)
   - Departments list with CRUD
   - User assignment interface
   - Permission management
   - Modal for create/edit

2. Create DepartmentRoleManagement.tsx (350 lines)
   - Roles list per department
   - Permission checkboxes
   - Role creation form
   - Delete confirmation

3. Integrate into App.tsx
   - Add /admin/departments route
   - Add /admin/roles route
   - Add to sidebar admin section
```

### Step 4: Dashboard Components (1-2 hours)
```
1. Create DepartmentDashboard.tsx (300 lines)
   - Department metrics
   - Department activity
   - Department KPIs
   - Live data filtering

2. Create DepartmentSelector.tsx (100 lines)
   - Dropdown in header
   - User's departments list
   - Select and persist
   - Reflect in sidebar

3. Update DashboardPage.tsx (50 lines)
   - Add department selector
   - Filter all metrics
   - Show selected department data
```

### Step 5: Data Filtering (1 hour)
```
1. Update DashboardPage.tsx
   - Filter stats by department
   - Show only department rejects/returns
   - Update chart data source

2. Update RejectsPage.tsx
   - Filter table by department
   - Show department-specific rejects
   - Update response handler

3. Update ReturnsPage.tsx
   - Filter table by department
   - Show department-specific returns

4. Update FormsPage.tsx
   - Filter forms/responses by department
   - Update API calls with department filter

5. Update SOP/Maintenance/Reports pages
   - Similar filtering approach
```

### Step 6: Navigation Updates (30 min)
```
1. Update Sidebar.tsx
   - Add DepartmentSelector at top
   - Show current department
   - Update visual indicator

2. Update Header.tsx
   - Show current department name
   - Quick access to department settings

3. Add breadcrumbs to pages (optional)
   - Home > Department Name > Page Name
```

### Step 7: Testing (1 hour)
```
1. Test department creation/edit/delete
2. Test user assignment to departments
3. Test role creation and permissions
4. Test data filtering by department
5. Test permission checks on API calls
6. Test cross-department data isolation
7. Test UI responsiveness with many departments
8. Test permission-based UI visibility
```

---

## Example Implementation Snippet

### DepartmentContext.tsx
```typescript
import React, { createContext, useState, useCallback } from 'react';

interface DepartmentContextType {
  currentDepartment: Department | null;
  userDepartments: Department[];
  setCurrentDepartment: (dept: Department) => void;
  userPermissions: string[];
  hasPermission: (permission: string) => boolean;
}

export const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);
  const [userDepartments, setUserDepartments] = useState<Department[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  const hasPermission = useCallback((permission: string) => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  return (
    <DepartmentContext.Provider
      value={{
        currentDepartment,
        userDepartments,
        setCurrentDepartment,
        userPermissions,
        hasPermission,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};
```

### DepartmentSelector.tsx
```typescript
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useDepartment } from '../hooks/useDepartment';

export const DepartmentSelector: React.FC = () => {
  const { currentDepartment, userDepartments, setCurrentDepartment } = useDepartment();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
        {currentDepartment?.name || 'Select Department'}
        <ChevronDown size={16} />
      </button>
      <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        {userDepartments.map(dept => (
          <button
            key={dept.id}
            onClick={() => setCurrentDepartment(dept)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {dept.name}
          </button>
        ))}
      </div>
    </div>
  );
};
```

---

## Testing Plan

### Unit Tests
- [ ] Department context state management
- [ ] Permission checking logic
- [ ] Data filtering functions
- [ ] Department selection persistence

### Integration Tests
- [ ] Create department → appears in dashboard
- [ ] Assign user → can access department data
- [ ] Remove permission → loses access
- [ ] Switch departments → data updates

### E2E Tests
- [ ] Admin creates department
- [ ] Admin assigns user
- [ ] Admin sets permissions
- [ ] User logs in → sees correct department
- [ ] User sees only department data
- [ ] User cannot access other departments

---

## Success Criteria

✅ **Admin can:**
- Create, edit, delete departments
- Assign users to departments
- Create roles per department
- Define permissions for roles
- Assign roles to users
- Manage department permissions

✅ **Users can:**
- See only their assigned department(s)
- Switch between departments
- View only department-specific data
- Submit forms to department forms
- See only department responses

✅ **Data is:**
- Properly filtered by department
- Isolated between departments
- Accessible only to authorized users
- Correctly updated when permissions change

✅ **UI**:
- Shows current department clearly
- Department selector is intuitive
- Admin pages are organized
- Mobile responsive
- Dark mode works

---

## Time Estimate

| Task | Hours |
|------|-------|
| Backend API setup | 2 |
| Database migrations | 1 |
| Frontend context | 1 |
| AdminDepartmentPage | 2 |
| DepartmentRoleManagement | 1.5 |
| DepartmentDashboard | 1.5 |
| Data filtering updates | 1 |
| Navigation updates | 0.5 |
| Testing | 1 |
| **Total** | **4-6 hours** |

---

## Dependencies & Blockers

### Dependencies
- Phase 3 must be complete ✅
- Backend database schema migration needed
- Authentication/user system working ✅

### No Blockers
- Can be developed in parallel with other features
- Independent from phases 5-10
- Works with existing component structure

---

## Ready to Proceed?

When you say "proceed", the assistant will:
1. ✅ Create comprehensive Phase 4 plan with all files
2. ✅ Implement all backend API endpoints
3. ✅ Create DepartmentContext for state management
4. ✅ Build AdminDepartmentPage component
5. ✅ Build DepartmentRoleManagement component
6. ✅ Create DepartmentDashboard component
7. ✅ Update all pages with data filtering
8. ✅ Integrate department selector in navigation
9. ✅ Create comprehensive documentation
10. ✅ Test all workflows

**Estimated delivery**: 4-6 hours of development

---

**Ready to build the department management system?** Say "proceed" to start Phase 4!
