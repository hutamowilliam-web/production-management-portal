-- Production Management Application Database Schema
-- MySQL Database on Railway

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department_id INT,
    role_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    encrypted_data JSON,
    INDEX idx_department (department_id),
    INDEX idx_role (role_id)
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_manager (manager_id)
);

-- Department Areas table
CREATE TABLE department_areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    supervisor_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_department (department_id),
    INDEX idx_supervisor (supervisor_id)
);

-- Roles table
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- Production Products table
CREATE TABLE production_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    department_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    encrypted_data JSON,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    INDEX idx_product_code (product_code),
    INDEX idx_department (department_id)
);

-- Internal Rejects table
CREATE TABLE internal_rejects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_number VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    production_stage_id INT,
    customer_name VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    reject_quantity INT NOT NULL,
    details TEXT,
    total_reject_cost DECIMAL(10,2) NOT NULL,
    responsible_employee VARCHAR(255),
    submitted_by INT NOT NULL,
    shift VARCHAR(50),
    faulty_department_id INT,
    status ENUM('Pending', 'Stock Received', 'No Stock', 'Wrong Stock Received') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    encrypted_data JSON,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (faulty_department_id) REFERENCES departments(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    INDEX idx_sales_order (sales_order_number),
    INDEX idx_department (department_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Customer Returns table
CREATE TABLE customer_returns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_order_number VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    production_stage VARCHAR(100),
    return_date DATE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    return_quantity INT NOT NULL,
    details TEXT,
    total_cost_return DECIMAL(10,2) NOT NULL,
    responsible_employee VARCHAR(255),
    submitted_by INT NOT NULL,
    faulty_department_id INT,
    raf_date DATE,
    production_status ENUM('credited', 'replaced', 'credit and replaced') DEFAULT 'credited',
    date_resolved DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    encrypted_data JSON,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (faulty_department_id) REFERENCES departments(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    INDEX idx_sales_order (sales_order_number),
    INDEX idx_department (department_id),
    INDEX idx_return_date (return_date)
);

-- SOP Failures table
CREATE TABLE sop_failures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    department_id INT NOT NULL,
    area_id INT NOT NULL,
    failure_type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    submitted_by INT NOT NULL,
    assigned_to INT NULL,
    status ENUM('Open', 'Escalated', 'Accepted', 'Rejected', 'Closed') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    escalated_at TIMESTAMP NULL,
    notes TEXT,
    reassigned_from_department INT NULL,
    reassigned_count INT DEFAULT 0,
    encrypted_data JSON,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (area_id) REFERENCES department_areas(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_department (department_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- NCR Reports table (linked to SOP Failures)
CREATE TABLE ncr_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sop_failure_id INT NOT NULL,
    report_content TEXT NOT NULL,
    corrective_action TEXT,
    preventive_action TEXT,
    submitted_by INT NOT NULL,
    approved_by INT NULL,
    status ENUM('Draft', 'Submitted', 'Approved', 'Rejected') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    encrypted_data JSON,
    FOREIGN KEY (sop_failure_id) REFERENCES sop_failures(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_sop_failure (sop_failure_id)
);

-- Maintenance Tickets table
CREATE TABLE maintenance_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    machine_name VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    issue_description TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Open',
    submitted_by INT NOT NULL,
    assigned_to INT NULL,
    estimated_downtime INT NULL, -- in minutes
    actual_downtime INT NULL, -- in minutes
    parts_required TEXT,
    cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    encrypted_data JSON,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    INDEX idx_department (department_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority)
);

-- Dynamic Forms table (for admin-created forms)
CREATE TABLE dynamic_forms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    form_structure JSON NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_table_name (table_name)
);

-- Form Submissions table (for dynamic forms)
CREATE TABLE form_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    form_id INT NOT NULL,
    submitted_by INT NOT NULL,
    submission_data JSON NOT NULL,
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    encrypted_data JSON,
    FOREIGN KEY (form_id) REFERENCES dynamic_forms(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id),
    INDEX idx_form (form_id),
    INDEX idx_submitted_by (submitted_by)
);

-- Activity Logs table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_table VARCHAR(100),
    related_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- Add foreign key constraints
ALTER TABLE users ADD FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id);
ALTER TABLE departments ADD FOREIGN KEY (manager_id) REFERENCES users(id);
ALTER TABLE department_areas ADD FOREIGN KEY (supervisor_id) REFERENCES users(id);