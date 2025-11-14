-- Form Management Schema
-- Tables for managing dynamic forms and their responses

-- Forms table - stores form definitions
CREATE TABLE IF NOT EXISTS forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  table_name VARCHAR(100) UNIQUE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_active (is_active),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Form fields table - stores field definitions for each form
CREATE TABLE IF NOT EXISTS form_fields (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  required BOOLEAN DEFAULT 0,
  field_order INT NOT NULL,
  validation_rules JSON,
  options JSON COMMENT 'For select/radio/checkbox fields',
  depends_on VARCHAR(100) COMMENT 'Field this depends on',
  depends_on_value VARCHAR(255) COMMENT 'Value that triggers visibility',
  help_text TEXT,
  db_column_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_field_per_form (form_id, field_name),
  UNIQUE KEY unique_column_per_form (form_id, db_column_name),
  INDEX idx_form_order (form_id, field_order),
  INDEX idx_form_type (form_id, field_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Form responses metadata table - stores submission info
CREATE TABLE IF NOT EXISTS form_responses_meta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  form_id INT NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'submitted' COMMENT 'submitted, draft, approved, rejected',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  response_data LONGJSON COMMENT 'Full response data stored as backup',
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_form (form_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Field type definitions reference (informational)
-- text: Single line text
-- textarea: Multi-line text area
-- number: Numeric value
-- currency: Currency with 2 decimals
-- date: Date picker
-- select: Dropdown selection (single)
-- multiselect: Multiple selections
-- checkbox: Boolean checkbox
-- radio: Radio button group

-- Example validation_rules JSON:
-- {
--   "min": 0,
--   "max": 1000,
--   "pattern": "^[A-Z0-9]+$",
--   "message": "Custom error message"
-- }

-- Create trigger to update form updated_at timestamp
DELIMITER //
CREATE TRIGGER IF NOT EXISTS form_fields_update_trigger
BEFORE UPDATE ON form_fields
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;

-- Create trigger to update forms updated_at timestamp
DELIMITER //
CREATE TRIGGER IF NOT EXISTS forms_update_trigger
BEFORE UPDATE ON forms
FOR EACH ROW
BEGIN
  SET NEW.updated_at = CURRENT_TIMESTAMP;
END //
DELIMITER ;
