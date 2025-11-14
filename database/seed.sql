-- Comprehensive Seed Data for Production Management Application
-- This file populates the database with sample data for testing and initial setup

-- ==================== ROLES ====================
INSERT INTO roles (id, name, description, is_active) VALUES
(1, 'Production Coordinators', 'Production floor coordinators managing daily operations', TRUE),
(2, 'Quality Control Checker', 'Quality control staff checking production quality', TRUE),
(3, 'Department Floor Managers', 'Managers overseeing department operations', TRUE),
(4, 'Planning Manager', 'Manager of planning department with cross-department visibility', TRUE),
(5, 'Planner', 'Planning staff with limited permissions', TRUE),
(6, 'System Admin', 'Full system administrator with all permissions', TRUE),
(7, 'Head Of Production', 'Head of production overseeing all departments', TRUE),
(8, 'Quality Inspector', 'Senior quality inspector with oversight permissions', TRUE);

-- ==================== PERMISSIONS ====================
INSERT INTO permissions (id, name, description, module, action) VALUES
(1, 'submit_internal_rejects', 'Can submit internal reject forms', 'rejects', 'create'),
(2, 'submit_customer_returns', 'Can submit customer return forms', 'returns', 'create'),
(3, 'submit_sop_failures', 'Can submit SOP failure reports', 'sop', 'create'),
(4, 'submit_maintenance_tickets', 'Can submit maintenance tickets', 'maintenance', 'create'),
(5, 'update_reject_status', 'Can update internal reject statuses', 'rejects', 'update_status'),
(6, 'view_own_department_data', 'Can view own department data', 'dashboard', 'view_department'),
(7, 'edit_own_tickets', 'Can edit and delete own tickets', 'tickets', 'edit_own'),
(8, 'view_department_tickets', 'Can view department ticket details', 'tickets', 'view_department'),
(9, 'access_all_forms', 'Can access all form types', 'forms', 'access'),
(10, 'update_return_status', 'Can update customer return statuses', 'returns', 'update_status'),
(11, 'manage_department_users', 'Can manage department users', 'users', 'manage_department'),
(12, 'assign_tickets', 'Can assign tickets to users', 'tickets', 'assign'),
(13, 'reassign_tickets', 'Can reassign tickets to other departments', 'tickets', 'reassign'),
(14, 'update_all_ticket_status', 'Can update status of all department tickets', 'tickets', 'update_all_status'),
(15, 'edit_all_department_tickets', 'Can edit and delete all department tickets', 'tickets', 'edit_all_department'),
(16, 'view_department_reports', 'Can view department reports', 'reports', 'view_department'),
(17, 'track_user_activity', 'Can track department user activity logs', 'activity', 'track_department'),
(18, 'send_admin_requests', 'Can send requests to system admin', 'admin', 'request'),
(19, 'view_cross_department_rejects', 'Can view all departments internal rejects and returns', 'rejects', 'view_all_departments'),
(20, 'view_cross_department_returns', 'Can view all departments customer returns', 'returns', 'view_all_departments'),
(21, 'create_forms', 'Can create new forms', 'forms', 'create'),
(22, 'edit_forms', 'Can edit existing forms', 'forms', 'edit'),
(23, 'delete_forms', 'Can delete forms', 'forms', 'delete'),
(24, 'manage_user_permissions', 'Can grant and revoke user permissions', 'permissions', 'manage'),
(25, 'reset_user_passwords', 'Can reset user passwords', 'users', 'reset_password'),
(26, 'manage_departments', 'Can add departments and areas', 'departments', 'manage'),
(27, 'manage_roles', 'Can add more app roles and permissions', 'roles', 'manage'),
(28, 'create_database_tables', 'Can create database tables from frontend', 'database', 'create_tables'),
(29, 'full_system_access', 'Full access to all system features and functions', 'system', 'full_access'),
(30, 'edit_all_data', 'Can edit, create, delete all system data', 'data', 'full_crud'),
(31, 'view_all_departments', 'Can view all department records and performances', 'departments', 'view_all'),
(32, 'view_escalated_tickets', 'Can view escalated and rejected tickets', 'tickets', 'view_escalated'),
(33, 'manage_escalated_tickets', 'Can manage escalated and rejected tickets', 'tickets', 'manage_escalated'),
(34, 'view_performance_matrix', 'Can view performance matrix of all managers', 'performance', 'view_matrix');

-- Insert Role Permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES
-- Production Coordinators
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10),
-- Quality Control Checker
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10),
-- Department Floor Managers
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9), (3, 10),
(3, 11), (3, 12), (3, 13), (3, 14), (3, 15), (3, 16), (3, 17), (3, 18),
-- Planning Manager
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8), (4, 9), (4, 10),
(4, 11), (4, 12), (4, 13), (4, 14), (4, 15), (4, 16), (4, 17), (4, 18), (4, 19), (4, 20),
-- Planner
(5, 1), (5, 3), (5, 6), (5, 7), (5, 8), (5, 19), (5, 20),
-- System Admin (all permissions)
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8), (6, 9), (6, 10),
(6, 11), (6, 12), (6, 13), (6, 14), (6, 15), (6, 16), (6, 17), (6, 18), (6, 19), (6, 20),
(6, 21), (6, 22), (6, 23), (6, 24), (6, 25), (6, 26), (6, 27), (6, 28), (6, 29), (6, 30),
-- Head Of Production
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10),
(7, 11), (7, 12), (7, 13), (7, 14), (7, 15), (7, 16), (7, 17), (7, 18), (7, 19), (7, 20),
(7, 31), (7, 32), (7, 33), (7, 34),
-- Quality Inspector
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), (8, 7), (8, 8), (8, 9), (8, 10),
(8, 11), (8, 12), (8, 13), (8, 14), (8, 15), (8, 16), (8, 17), (8, 18), (8, 19), (8, 20),
(8, 31), (8, 32), (8, 33), (8, 34);

-- ==================== DEPARTMENTS ====================
INSERT INTO departments (id, name, description, is_active) VALUES
(1, 'Planning Department', 'Handles production planning and scheduling', TRUE),
(2, 'Embroidery and Alterations Department', 'Manages embroidery and alteration services', TRUE),
(3, 'Gifting Department', 'Handles gift production and packaging', TRUE),
(4, 'Display and Sublimation Department', 'Manages display items and sublimation printing', TRUE),
(5, 'Warehouse Department', 'Handles inventory and logistics', TRUE),
(6, 'Artwork Department', 'Creates and manages artwork and layouts', TRUE),
(7, 'Quality Control Department', 'Ensures quality standards and processes', TRUE),
(8, 'IT Department', 'Manages technology infrastructure and support', TRUE);

-- ==================== USERS ====================
-- System Admin
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 8, 6, TRUE);

-- Head of Production
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('sarah.head', 'sarah.head@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', 1, 7, TRUE);

-- Quality Inspector
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('mike.inspector', 'mike.inspector@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Chen', 7, 8, TRUE);

-- Department Managers
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('john.planning', 'john@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Smith', 1, 4, TRUE),
('maria.embroidery', 'maria@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria', 'Garcia', 2, 3, TRUE),
('david.gifting', 'david@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David', 'Wilson', 3, 3, TRUE),
('susan.display', 'susan@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Susan', 'Brown', 4, 3, TRUE),
('robert.warehouse', 'robert@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Davis', 5, 3, TRUE),
('james.artwork', 'james@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James', 'Martinez', 6, 3, TRUE),
('linda.quality', 'linda@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Linda', 'Anderson', 7, 3, TRUE),
('thomas.it', 'thomas@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas', 'Miller', 8, 3, TRUE);

-- Production Coordinators
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('jane.coordinator', 'jane@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Taylor', 1, 1, TRUE),
('michael.coord', 'michael@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Thompson', 2, 1, TRUE),
('karen.coord', 'karen@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Karen', 'White', 3, 1, TRUE),
('thomas.coord', 'thomas.c@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas', 'Harris', 4, 1, TRUE),
('patricia.coord', 'patricia@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Patricia', 'Clark', 5, 1, TRUE),
('paul.coord', 'paul@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Paul', 'Lewis', 6, 1, TRUE),
('nancy.coord', 'nancy@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nancy', 'Walker', 7, 1, TRUE);

-- Quality Control Checkers
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('andrew.checker', 'andrew@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andrew', 'Hall', 7, 2, TRUE),
('sarah.checker', 'sarah.c@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Allen', 7, 2, TRUE);

-- Planners
INSERT INTO users (username, email, password_hash, first_name, last_name, department_id, role_id, is_active) VALUES
('edward.planner', 'edward@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Edward', 'Young', 1, 5, TRUE),
('margaret.planner', 'margaret@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Margaret', 'King', 1, 5, TRUE);

-- Update departments with managers
UPDATE departments SET manager_id = 2 WHERE id = 1;
UPDATE departments SET manager_id = 5 WHERE id = 2;
UPDATE departments SET manager_id = 6 WHERE id = 3;
UPDATE departments SET manager_id = 7 WHERE id = 4;
UPDATE departments SET manager_id = 8 WHERE id = 5;
UPDATE departments SET manager_id = 9 WHERE id = 6;
UPDATE departments SET manager_id = 10 WHERE id = 7;
UPDATE departments SET manager_id = 11 WHERE id = 8;

-- ==================== DEPARTMENT AREAS ====================
INSERT INTO department_areas (id, department_id, name, supervisor_id, is_active) VALUES
-- Planning Department
(1, 1, 'Scheduling', 13, TRUE),
(2, 1, 'Unpacking', 13, TRUE),
(3, 1, 'Double Checking', 13, TRUE),
(4, 1, 'Manager', 2, TRUE),
(5, 1, 'Supervisor', 13, TRUE),
-- Embroidery and Alterations
(6, 2, 'Alterations', 14, TRUE),
(7, 2, 'Cleaning', 14, TRUE),
(8, 2, 'Machines', 14, TRUE),
(9, 2, 'Packing', 14, TRUE),
(10, 2, 'Manager', 5, TRUE),
(11, 2, 'Supervisor', 14, TRUE),
(12, 2, 'Digitizing', 14, TRUE),
-- Gifting Department
(13, 3, 'Pre-prep (Posies; ink; Screens)', 15, TRUE),
(14, 3, 'Machines', 15, TRUE),
(15, 3, 'Packing', 15, TRUE),
(16, 3, 'Supervisor', 15, TRUE),
(17, 3, 'Manager', 6, TRUE),
-- Display and Sublimation
(18, 4, 'Printing Machines', 16, TRUE),
(19, 4, 'Branding Coordinator', 16, TRUE),
(20, 4, 'Sublimating', 16, TRUE),
(21, 4, 'Cutting', 16, TRUE),
(22, 4, 'Sewing', 16, TRUE),
(23, 4, 'Packing', 16, TRUE),
(24, 4, 'Supervisor', 16, TRUE),
(25, 4, 'Manager', 7, TRUE),
-- Warehouse Department
(26, 5, 'Receiving', 17, TRUE),
(27, 5, 'Storage', 17, TRUE),
(28, 5, 'Picking', 17, TRUE),
(29, 5, 'Packing', 17, TRUE),
(30, 5, 'Shipping', 17, TRUE),
(31, 5, 'Manager', 8, TRUE),
(32, 5, 'Supervisor', 17, TRUE),
-- Artwork Department
(33, 6, 'Layouts', 18, TRUE),
(34, 6, 'Print file', 18, TRUE),
(35, 6, 'Supervisor', 18, TRUE),
-- Quality Control Department
(36, 7, 'First Strike', 19, TRUE),
(37, 7, 'Returns', 19, TRUE),
(38, 7, 'Manager', 10, TRUE),
(39, 7, 'Supervisor', 19, TRUE),
-- IT Department
(40, 8, 'Support', 20, TRUE),
(41, 8, 'Infrastructure', 20, TRUE),
(42, 8, 'Security', 20, TRUE),
(43, 8, 'Development', 20, TRUE),
(44, 8, 'Admin', 20, TRUE),
(45, 8, 'Manager', 11, TRUE);

-- ==================== PRODUCTION PRODUCTS ====================
INSERT INTO production_products (product_code, description, cost_per_unit, department_id, is_active) VALUES
('EMBC-001', 'Embroidered Polo Shirt - Blue', 45.50, 2, TRUE),
('EMBC-002', 'Embroidered Baseball Cap', 12.75, 2, TRUE),
('EMBC-003', 'Custom Embroidered Logo Hoodie', 65.00, 2, TRUE),
('GIFTB-001', 'Gift Box Set - Standard', 28.00, 3, TRUE),
('GIFTB-002', 'Gift Wrap Premium', 5.50, 3, TRUE),
('GIFTB-003', 'Luxury Gift Basket', 85.00, 3, TRUE),
('DISP-001', 'Display Banner 2x3m', 85.00, 4, TRUE),
('DISP-002', 'Sublimated Mug - White', 8.99, 4, TRUE),
('DISP-003', 'Sublimated T-Shirt - Large', 15.50, 4, TRUE),
('DISP-004', 'Sublimated Mouse Pad', 12.00, 4, TRUE),
('ARTWORK-001', 'Custom Print Design File', 125.00, 6, TRUE),
('ARTWORK-002', 'Vector Logo Design', 200.00, 6, TRUE),
('QC-LABEL', 'Quality Control Label Pack', 3.25, 7, TRUE),
('PACKAGING-001', 'Custom Branded Box - 100 pcs', 55.00, 5, TRUE),
('PACKAGING-002', 'Tissue Paper Roll', 8.50, 5, TRUE);

-- ==================== SAMPLE INTERNAL REJECTS ====================
INSERT INTO internal_rejects (sales_order_number, department_id, customer_name, product, reason, reject_quantity, details, total_reject_cost, responsible_employee, submitted_by, shift, faulty_department_id, status, created_at) VALUES
('SO-001', 1, 'ABC Corporation', 'Embroidered Polo Shirt - Blue', 'Wrong color printed', 50, 'Received wrong blue shade, customer required navy', 2275.00, 'John Smith', 12, 'Day Shift', 2, 'Pending', NOW() - INTERVAL 2 DAY),
('SO-002', 2, 'XYZ Industries', 'Sublimated Mug - White', 'Cracked during production', 25, 'Cracks found in sublimation process', 224.75, 'Maria Garcia', 14, 'Night Shift', 4, 'Stock Received', NOW() - INTERVAL 5 HOUR),
('SO-003', 3, 'DEF Limited', 'Gift Box Set - Standard', 'Damaged packaging', 100, 'Box corners crushed during transport', 2800.00, 'Karen White', 16, 'Day Shift', 3, 'No Stock', NOW() - INTERVAL 8 HOUR),
('SO-004', 5, 'Global Enterprises', 'Custom Branded Box - 100 pcs', 'Misaligned print', 150, 'Print off-center by 2cm', 8250.00, 'Patricia Clark', 17, 'Day Shift', 5, 'Wrong Stock Received', NOW() - INTERVAL 12 HOUR),
('SO-005', 4, 'Tech Solutions Inc', 'Display Banner 2x3m', 'Color fading', 10, 'Color faded after 48 hours', 850.00, 'Thomas Harris', 15, 'Night Shift', 4, 'Pending', NOW() - INTERVAL 36 HOUR),
('SO-006', 2, 'Fashion Forward', 'Embroidered Baseball Cap', 'Loose threads', 75, 'Embroidery loose, quality issue', 956.25, 'Michael Thompson', 14, 'Day Shift', 2, 'Pending', NOW() - INTERVAL 1 DAY);

-- ==================== SAMPLE CUSTOMER RETURNS ====================
INSERT INTO customer_returns (sales_order_number, department_id, return_date, customer_name, product, reason, return_quantity, details, total_cost_return, responsible_employee, submitted_by, faulty_department_id, raf_date, production_status, date_resolved, created_at) VALUES
('SO-007', 1, CURDATE() - INTERVAL 5 DAY, 'Retail Partners Ltd', 'Embroidered Polo Shirt - Blue', 'Size mismatch', 30, 'Customer received Medium instead of Large', 1365.00, 'Jane Taylor', 12, 2, CURDATE() - INTERVAL 3 DAY, 'replaced', CURDATE() - INTERVAL 1 DAY, NOW() - INTERVAL 5 DAY),
('SO-008', 2, CURDATE() - INTERVAL 8 DAY, 'Corporate Gifts Co', 'Gift Box Set - Standard', 'Product defect', 50, 'Box closure mechanism broken', 1400.00, 'Michael Thompson', 14, 3, CURDATE() - INTERVAL 6 DAY, 'credited', CURDATE(), NOW() - INTERVAL 8 DAY),
('SO-009', 4, CURDATE() - INTERVAL 2 DAY, 'Premium Merchandise', 'Sublimated T-Shirt - Large', 'Color bleeding', 20, 'Color bled through to back', 310.00, 'Thomas Harris', 15, 4, CURDATE() - INTERVAL 1 DAY, 'credit and replaced', NULL, NOW() - INTERVAL 2 DAY),
('SO-010', 3, CURDATE() - INTERVAL 1 DAY, 'Event Supplies Inc', 'Luxury Gift Basket', 'Missing items', 5, 'Items missing from basket assembly', 425.00, 'Karen White', 16, 3, CURDATE(), 'pending', NULL, NOW() - INTERVAL 1 DAY);

-- ==================== SAMPLE SOP FAILURES ====================
INSERT INTO sop_failures (department_id, area_id, failure_type, description, submitted_by, assigned_to, status, priority, created_at, notes) VALUES
(1, 1, 'Scheduled incorrectly', 'Production schedule did not account for material delivery delay', 12, 2, 'Open', 'Medium', NOW() - INTERVAL 36 HOUR, 'Material arrived 2 hours late'),
(2, 8, 'Quality Reject', 'Embroidery machine calibration was off, causing misaligned stitching', 14, 5, 'Open', 'High', NOW() - INTERVAL 48 HOUR, 'Machine calibration drift detected'),
(5, 26, 'Stock received is short', 'Received 80 units instead of 100 as per purchase order', 17, 8, 'Open', 'Medium', NOW() - INTERVAL 24 HOUR, 'Short shipment from supplier'),
(4, 20, 'Target Report', 'Sublimation temperature not reaching spec', 15, 7, 'Escalated', 'Critical', NOW() - INTERVAL 60 HOUR, 'Oven temperature fluctuating 5 degrees'),
(3, 15, 'Missed Deadline', 'Packing station fell behind schedule', 16, 6, 'Open', 'Medium', NOW() - INTERVAL 20 HOUR, 'Staff called in sick'),
(7, 36, 'Quality Reject', 'First strike quality check failed on batch', 19, 10, 'Open', 'High', NOW() - INTERVAL 72 HOUR, 'Defect rate exceeded threshold');

-- ==================== SAMPLE NCR REPORTS ====================
INSERT INTO ncr_reports (sop_failure_id, report_content, corrective_action, preventive_action, submitted_by, approved_by, status, created_at) VALUES
(1, 'Root cause: Supplier delayed material delivery by 2 hours due to traffic', 'Extended deadline by 2 hours', 'Implement early delivery buffer in schedule', 2, 2, 'Submitted', NOW() - INTERVAL 30 HOUR),
(3, 'Root cause: Warehouse miscounted shipment, only 80 units actually received', 'Recount and verify all incoming shipments', 'Implement barcode scanning at receiving', 8, 10, 'Submitted', NOW() - INTERVAL 18 HOUR);

-- ==================== SAMPLE MAINTENANCE TICKETS ====================
INSERT INTO maintenance_tickets (machine_name, department_id, issue_description, priority, submitted_by, assigned_to, estimated_downtime, actual_downtime, parts_required, cost, status, completed_at, created_at) VALUES
('Embroidery Machine #3', 2, 'Thread tension mechanism needs adjustment', 'Medium', 14, 5, 120, 90, 'Thread tension assembly', 250.00, 'In Progress', NULL, NOW() - INTERVAL 2 DAY),
('Sublimation Printer #1', 4, 'Print head cleaning required', 'Low', 15, 7, 60, 45, 'Cleaning solution cartridge', 150.00, 'Completed', NOW() - INTERVAL 1 DAY, NOW() - INTERVAL 3 DAY),
('Packaging Machine #2', 3, 'Conveyor belt slipping', 'High', 16, 6, 240, NULL, 'Conveyor belt, motor oil', 500.00, 'In Progress', NULL, NOW() - INTERVAL 1 DAY),
('Quality Control Scanner', 7, 'Barcode scanner not reading', 'Medium', 19, 10, 30, 25, 'Laser module', 180.00, 'Completed', NOW(), NOW() - INTERVAL 4 HOUR),
('Box Cutting Machine', 5, 'Blade dull - cutting quality degraded', 'Low', 17, 8, 45, 40, 'Replacement cutting blade set', 200.00, 'Scheduled', NULL, NOW() - INTERVAL 8 HOUR);

-- ==================== SAMPLE ACTIVITY LOGS ====================
INSERT INTO activity_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address, created_at) VALUES
(12, 'CREATE', 'internal_rejects', 1, NULL, '{"status":"Pending"}', '192.168.1.100', NOW() - INTERVAL 2 DAY),
(14, 'UPDATE', 'internal_rejects', 2, '{"status":"Pending"}', '{"status":"Stock Received"}', '192.168.1.101', NOW() - INTERVAL 5 HOUR),
(12, 'VIEW', 'internal_rejects', 1, NULL, NULL, '192.168.1.100', NOW() - INTERVAL 1 HOUR),
(2, 'UPDATE', 'sop_failures', 4, '{"status":"Open"}', '{"status":"Escalated"}', '192.168.1.102', NOW() - INTERVAL 60 HOUR),
(15, 'CREATE', 'maintenance_tickets', 1, NULL, '{"status":"In Progress"}', '192.168.1.103', NOW() - INTERVAL 2 DAY);

-- ==================== SAMPLE NOTIFICATIONS ====================
INSERT INTO notifications (user_id, title, message, type, is_read, related_table, related_id, created_at) VALUES
(2, 'High Value Reject Alert', 'Internal reject SO-004 (R8,250) requires approval from Quality Inspector', 'reject_alert', FALSE, 'internal_rejects', 4, NOW() - INTERVAL 12 HOUR),
(3, 'Escalated Ticket - Action Required', 'SOP Failure #4 (Sublimation Temperature) has been escalated and requires your review', 'escalation', FALSE, 'sop_failures', 4, NOW() - INTERVAL 60 HOUR),
(10, 'NCR Report Submitted', 'NCR Report for SOP Failure #1 has been submitted and is awaiting approval', 'ncr_report', FALSE, 'ncr_reports', 1, NOW() - INTERVAL 30 HOUR),
(2, 'Task Assignment', 'You have been assigned to SOP Failure #1: Scheduled incorrectly', 'assignment', TRUE, 'sop_failures', 1, NOW() - INTERVAL 36 HOUR),
(5, 'Maintenance Ticket Status Update', 'Maintenance Ticket #1 status changed to In Progress', 'maintenance_update', TRUE, 'maintenance_tickets', 1, NOW() - INTERVAL 2 DAY);

-- All password hashes are for 'password' (bcrypt hashed: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)
-- Default login credentials for testing:
-- Username: admin / Password: password
-- Username: sarah.head / Password: password
-- Username: john.planning / Password: password
-- Username: maria.embroidery / Password: password
-- (all users share the same default password for testing purposes)