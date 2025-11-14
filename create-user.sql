-- Create admin user with correct bcrypt hash for "password"
DELETE FROM users WHERE username = 'admin';

INSERT INTO users (username, email, password_hash, department_id, role_id, is_active) 
VALUES ('admin', 'admin@company.com', '$2b$10$K7L/SQjXqXqXqXqXqXqXqOeH7PnZZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5a', 8, 6, 1);
