-- Phase 5: Analytics Database Schema
-- Tables for analytics, reporting, and scheduled reports

-- Table for tracking analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  form_id INT,
  event_type VARCHAR(50) NOT NULL, -- 'submission', 'response', 'rejection', 'approval'
  metric_name VARCHAR(100),
  metric_value DECIMAL(10,2),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_department_time (department_id, created_at),
  INDEX idx_form_time (form_id, created_at),
  INDEX idx_event_type (event_type),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL
);

-- Table for generated reports
CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'csv'
  department_id INT,
  form_id INT,
  created_by INT NOT NULL,
  file_path VARCHAR(500),
  file_size INT,
  date_from DATE,
  date_to DATE,
  filters JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_archived BOOLEAN DEFAULT FALSE,
  INDEX idx_department_created (department_id, created_at),
  INDEX idx_created_by (created_by),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table for scheduled reports
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'csv'
  department_id INT,
  form_id INT,
  created_by INT NOT NULL,
  recipient_emails TEXT NOT NULL, -- comma-separated or JSON array
  schedule_cron VARCHAR(100) NOT NULL, -- cron expression
  schedule_type VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'custom'
  filters JSON,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMP NULL,
  next_send_at TIMESTAMP NULL,
  send_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_next_send (next_send_at),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Table for report distribution log
CREATE TABLE IF NOT EXISTS report_distribution_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  scheduled_report_id INT NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL, -- 'sent', 'failed', 'bounced'
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scheduled_report (scheduled_report_id),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (scheduled_report_id) REFERENCES scheduled_reports(id) ON DELETE CASCADE
);

-- Table for dashboard metrics (cached for performance)
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_id INT NOT NULL,
  metric_type VARCHAR(100) NOT NULL, -- 'total_forms', 'avg_response_time', etc
  metric_value DECIMAL(15,2),
  period VARCHAR(50), -- 'today', 'week', 'month', 'year'
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE KEY unique_metric (department_id, metric_type, period),
  INDEX idx_department_period (department_id, period),
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
);

-- Create triggers to populate analytics_events on form submission
DELIMITER //

CREATE TRIGGER tr_form_submission_analytics
AFTER INSERT ON form_responses
FOR EACH ROW
BEGIN
  INSERT INTO analytics_events (
    department_id,
    form_id,
    event_type,
    metric_name,
    metric_value,
    metadata
  ) VALUES (
    (SELECT department_id FROM forms WHERE id = NEW.form_id),
    NEW.form_id,
    'submission',
    'form_response_created',
    1,
    JSON_OBJECT('response_id', NEW.id, 'user_id', NEW.submitted_by)
  );
END//

DELIMITER ;

-- Grant permissions
-- GRANT SELECT, INSERT, UPDATE ON production_management.analytics_events TO 'app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON production_management.reports TO 'app_user'@'localhost';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON production_management.scheduled_reports TO 'app_user'@'localhost';
-- GRANT SELECT, INSERT ON production_management.analytics_events TO 'app_user'@'localhost';
