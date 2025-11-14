// User and Authentication Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  departmentId: number;
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Department and Role Types
export interface Department {
  id: number;
  name: string;
  description?: string;
  managerId?: number;
  isActive: boolean;
  areas: DepartmentArea[];
}

export interface DepartmentArea {
  id: number;
  departmentId: number;
  name: string;
  supervisorId?: number;
  isActive: boolean;
  sopFailures: string[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string;
  module: string;
  action: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'currency' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'radio';
  required: boolean;
  validation?: string;
  options?: string[];
  dataSource?: string;
  displayField?: string;
  valueField?: string;
  dependsOn?: string;
  calculation?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: any;
}

export interface FormStructure {
  name: string;
  table: string;
  fields: FormField[];
}

export interface DynamicForm {
  id: number;
  name: string;
  description?: string;
  formStructure: FormStructure;
  tableName: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Ticket Types
export interface InternalReject {
  id: number;
  salesOrderNumber: string;
  departmentId: number;
  productionStageId?: number;
  customerName: string;
  product: string;
  reason: string;
  rejectQuantity: number;
  details?: string;
  totalRejectCost: number;
  responsibleEmployee?: string;
  submittedBy: number;
  shift?: string;
  faultyDepartmentId: number;
  status: 'Pending' | 'Stock Received' | 'No Stock' | 'Wrong Stock Received';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CustomerReturn {
  id: number;
  salesOrderNumber: string;
  departmentId: number;
  productionStage?: string;
  returnDate: string;
  customerName: string;
  product: string;
  reason: string;
  returnQuantity: number;
  details?: string;
  totalCostReturn: number;
  responsibleEmployee?: string;
  submittedBy: number;
  faultyDepartmentId: number;
  rafDate?: string;
  productionStatus: 'credited' | 'replaced' | 'credit and replaced';
  dateResolved?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SOPFailure {
  id: number;
  departmentId: number;
  areaId: number;
  failureType: string;
  description: string;
  submittedBy: number;
  assignedTo?: number;
  status: 'Open' | 'Escalated' | 'Accepted' | 'Rejected' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  escalatedAt?: string;
  notes?: string;
  reassignedFromDepartment?: number;
  reassignedCount: number;
}

export interface NCRReport {
  id: number;
  sopFailureId: number;
  reportContent: string;
  correctiveAction?: string;
  preventiveAction?: string;
  submittedBy: number;
  approvedBy?: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceTicket {
  id: number;
  machineName: string;
  departmentId: number;
  issueDescription: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  submittedBy: number;
  assignedTo?: number;
  estimatedDowntime?: number;
  actualDowntime?: number;
  partsRequired?: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  totalRejects: number;
  totalReturns: number;
  openSOPFailures: number;
  pendingMaintenanceTickets: number;
  departmentPerformance: DepartmentPerformance[];
  recentActivity: ActivityLog[];
}

export interface DepartmentPerformance {
  departmentId: number;
  departmentName: string;
  totalTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  performanceScore: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  tableName?: string;
  recordId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedTable?: string;
  relatedId?: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Search Types
export interface FilterOptions {
  department?: number;
  status?: string;
  priority?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Theme Types
export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// Chart Data Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}

// Production Product Types
export interface ProductionProduct {
  id: number;
  productCode: string;
  description: string;
  costPerUnit: number;
  departmentId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}