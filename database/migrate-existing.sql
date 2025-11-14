-- Migration script for existing database

-- Insert roles if not exists
INSERT IGNORE INTO roles (id, name, permissions) VALUES
(1, 'Production Coordinators', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status'),
(2, 'Quality Control Checker', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status'),
(3, 'Department Floor Managers', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status,manage_department_users,assign_tickets,reassign_tickets,update_all_ticket_status,edit_all_department_tickets,view_department_reports,track_user_activity,send_admin_requests'),
(4, 'Planning Manager', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status,manage_department_users,assign_tickets,reassign_tickets,update_all_ticket_status,edit_all_department_tickets,view_department_reports,track_user_activity,send_admin_requests,view_cross_department_rejects,view_cross_department_returns'),
(5, 'Planner', 'submit_sop_failures,view_own_department_data,edit_own_tickets,view_department_tickets,view_cross_department_rejects,view_cross_department_returns'),
(6, 'System Admin', 'full_system_access,edit_all_data,create_forms,edit_forms,delete_forms,manage_user_permissions,reset_user_passwords,manage_departments,manage_roles,create_database_tables'),
(7, 'Head Of Production', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status,manage_department_users,assign_tickets,reassign_tickets,update_all_ticket_status,edit_all_department_tickets,view_department_reports,track_user_activity,send_admin_requests,view_cross_department_rejects,view_cross_department_returns,view_all_departments,view_escalated_tickets,manage_escalated_tickets,view_performance_matrix'),
(8, 'Quality Inspector', 'submit_internal_rejects,submit_customer_returns,submit_sop_failures,submit_maintenance_tickets,update_reject_status,view_own_department_data,edit_own_tickets,view_department_tickets,access_all_forms,update_return_status,manage_department_users,assign_tickets,reassign_tickets,update_all_ticket_status,edit_all_department_tickets,view_department_reports,track_user_activity,send_admin_requests,view_cross_department_rejects,view_cross_department_returns,view_all_departments,view_escalated_tickets,manage_escalated_tickets,view_performance_matrix');

-- Insert departments if not exists
INSERT IGNORE INTO departments (id, name) VALUES
(1, 'Planning Department'),
(2, 'Embroidery and Alterations Department'),
(3, 'Gifting Department'),
(4, 'Display and Sublimation Department'),
(5, 'Warehouse Department'),
(6, 'Artwork Department'),
(7, 'Quality Control Department'),
(8, 'IT Department');

-- Insert sample users if not exists
INSERT IGNORE INTO users (id, username, email, password_hash, department_id, role_id) VALUES
(1, 'admin', 'admin@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8, 6),
(2, 'john.manager', 'john.manager@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 3),
(3, 'jane.coordinator', 'jane.coordinator@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1),
(4, 'mike.inspector', 'mike.inspector@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 7, 8),
(5, 'sarah.head', 'sarah.head@company.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 7);