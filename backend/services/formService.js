/**
 * Form Service
 * Handles form management, dynamic table creation, and form response processing
 */

const { executeQuery } = require('../config/database');
const { logActivity } = require('./activityLogger');

class FormService {
  /**
   * Create a new form with fields
   * @param {Object} formData - Form definition
   * @param {number} userId - User creating the form
   * @returns {Object} Created form with ID
   */
  async createForm(formData, userId) {
    const { name, description, fields } = formData;
    
    if (!name || !fields || fields.length === 0) {
      throw new Error('Form name and fields are required');
    }

    // Generate table name from form name
    const tableName = this.generateTableName(name);

    try {
      // Create form record
      const formResult = await executeQuery(
        `INSERT INTO forms (name, description, table_name, created_by) 
         VALUES (?, ?, ?, ?)`,
        [name, description || null, tableName, userId]
      );

      const formId = formResult.insertId;

      // Create form fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const columnName = this.generateColumnName(field.fieldName);

        await executeQuery(
          `INSERT INTO form_fields 
           (form_id, field_name, label, field_type, required, field_order, 
            validation_rules, options, depends_on, depends_on_value, 
            help_text, db_column_name) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            formId,
            field.fieldName,
            field.label,
            field.fieldType,
            field.required ? 1 : 0,
            i,
            field.validationRules ? JSON.stringify(field.validationRules) : null,
            field.options ? JSON.stringify(field.options) : null,
            field.dependsOn || null,
            field.dependsOnValue || null,
            field.helpText || null,
            columnName
          ]
        );
      }

      // Create dynamic response table
      await this.createResponseTable(formId, tableName, fields);

      // Log activity
      await logActivity(userId, 'CREATE', 'FORM', formId, `Created form: ${name}`);

      return { id: formId, name, table_name: tableName };
    } catch (error) {
      throw new Error(`Failed to create form: ${error.message}`);
    }
  }

  /**
   * Update an existing form
   * @param {number} formId - Form ID to update
   * @param {Object} formData - Updated form data
   * @param {number} userId - User updating the form
   * @returns {Object} Updated form
   */
  async updateForm(formId, formData, userId) {
    const { name, description, fields } = formData;

    try {
      // Get current form
      const forms = await executeQuery(
        'SELECT * FROM forms WHERE id = ?',
        [formId]
      );

      if (forms.length === 0) {
        throw new Error('Form not found');
      }

      const currentForm = forms[0];

      // Update form metadata
      await executeQuery(
        `UPDATE forms SET name = ?, description = ? WHERE id = ?`,
        [name || currentForm.name, description !== undefined ? description : currentForm.description, formId]
      );

      // Get current fields
      const currentFields = await executeQuery(
        'SELECT * FROM form_fields WHERE form_id = ? ORDER BY field_order',
        [formId]
      );

      // Update fields
      if (fields && fields.length > 0) {
        // Remove fields not in new definition
        const newFieldIds = fields.filter(f => f.id).map(f => f.id);
        const currentFieldIds = currentFields.map(f => f.id);

        for (const fieldId of currentFieldIds) {
          if (!newFieldIds.includes(fieldId)) {
            await this.deleteFormField(formId, fieldId, currentForm.table_name);
          }
        }

        // Add or update fields
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];

          if (field.id) {
            // Update existing field
            await executeQuery(
              `UPDATE form_fields 
               SET label = ?, field_type = ?, required = ?, field_order = ?,
                   validation_rules = ?, options = ?, depends_on = ?,
                   depends_on_value = ?, help_text = ?
               WHERE id = ? AND form_id = ?`,
              [
                field.label,
                field.fieldType,
                field.required ? 1 : 0,
                i,
                field.validationRules ? JSON.stringify(field.validationRules) : null,
                field.options ? JSON.stringify(field.options) : null,
                field.dependsOn || null,
                field.dependsOnValue || null,
                field.helpText || null,
                field.id,
                formId
              ]
            );
          } else {
            // Add new field
            const columnName = this.generateColumnName(field.fieldName);

            const result = await executeQuery(
              `INSERT INTO form_fields 
               (form_id, field_name, label, field_type, required, field_order,
                validation_rules, options, depends_on, depends_on_value,
                help_text, db_column_name)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                formId,
                field.fieldName,
                field.label,
                field.fieldType,
                field.required ? 1 : 0,
                i,
                field.validationRules ? JSON.stringify(field.validationRules) : null,
                field.options ? JSON.stringify(field.options) : null,
                field.dependsOn || null,
                field.dependsOnValue || null,
                field.helpText || null,
                columnName
              ]
            );

            // Add column to response table
            await this.addColumnToResponseTable(
              currentForm.table_name,
              columnName,
              field.fieldType
            );
          }
        }
      }

      await logActivity(userId, 'UPDATE', 'FORM', formId, `Updated form: ${name}`);

      return { id: formId, name };
    } catch (error) {
      throw new Error(`Failed to update form: ${error.message}`);
    }
  }

  /**
   * Delete a form and its response table
   * @param {number} formId - Form ID to delete
   * @param {number} userId - User deleting the form
   */
  async deleteForm(formId, userId) {
    try {
      const forms = await executeQuery(
        'SELECT * FROM forms WHERE id = ?',
        [formId]
      );

      if (forms.length === 0) {
        throw new Error('Form not found');
      }

      const form = forms[0];

      // Drop response table
      await executeQuery(`DROP TABLE IF EXISTS \`${form.table_name}\``);

      // Delete form (cascade will delete fields and metadata)
      await executeQuery('DELETE FROM forms WHERE id = ?', [formId]);

      await logActivity(userId, 'DELETE', 'FORM', formId, `Deleted form: ${form.name}`);
    } catch (error) {
      throw new Error(`Failed to delete form: ${error.message}`);
    }
  }

  /**
   * Get form definition by ID
   * @param {number} formId - Form ID
   * @returns {Object} Form with fields
   */
  async getForm(formId) {
    try {
      const forms = await executeQuery(
        'SELECT * FROM forms WHERE id = ? AND is_active = 1',
        [formId]
      );

      if (forms.length === 0) {
        throw new Error('Form not found');
      }

      const form = forms[0];

      // Get form fields
      const fields = await executeQuery(
        `SELECT id, field_name, label, field_type, required, field_order,
                validation_rules, options, depends_on, depends_on_value, help_text,
                db_column_name
         FROM form_fields 
         WHERE form_id = ? 
         ORDER BY field_order`,
        [formId]
      );

      // Parse JSON fields
      form.fields = fields.map(f => ({
        ...f,
        validationRules: f.validation_rules ? JSON.parse(f.validation_rules) : null,
        options: f.options ? JSON.parse(f.options) : null,
        required: f.required === 1
      }));

      return form;
    } catch (error) {
      throw new Error(`Failed to get form: ${error.message}`);
    }
  }

  /**
   * List all active forms
   * @returns {Array} Array of forms
   */
  async listForms() {
    try {
      const forms = await executeQuery(
        `SELECT f.id, f.name, f.description, f.table_name, f.created_by,
                f.created_at, f.updated_at, u.username as created_by_name,
                COUNT(ff.id) as field_count
         FROM forms f
         LEFT JOIN users u ON f.created_by = u.id
         LEFT JOIN form_fields ff ON f.id = ff.form_id
         WHERE f.is_active = 1
         GROUP BY f.id
         ORDER BY f.created_at DESC`,
        []
      );

      return forms;
    } catch (error) {
      throw new Error(`Failed to list forms: ${error.message}`);
    }
  }

  /**
   * Submit a form response
   * @param {number} formId - Form ID
   * @param {Object} responseData - Form response data
   * @param {number} userId - User submitting form
   * @returns {Object} Created response record
   */
  async submitFormResponse(formId, responseData, userId) {
    try {
      // Get form
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Validate form data
      this.validateFormData(responseData, form.fields);

      // Insert into response metadata table
      const metaResult = await executeQuery(
        `INSERT INTO form_responses_meta (form_id, table_name, user_id, response_data)
         VALUES (?, ?, ?, ?)`,
        [formId, form.table_name, userId, JSON.stringify(responseData)]
      );

      const responseId = metaResult.insertId;

      // Build insert query for dynamic table
      const columns = ['id'];
      const values = [responseId];
      const placeholders = ['?'];

      for (const field of form.fields) {
        const value = responseData[field.field_name];
        if (value !== undefined) {
          columns.push(`\`${field.db_column_name}\``);
          values.push(this.formatFieldValue(value, field.field_type));
          placeholders.push('?');
        }
      }

      // Insert into dynamic response table
      const query = `INSERT INTO \`${form.table_name}\` (${columns.join(', ')}) 
                     VALUES (${placeholders.join(', ')})`;
      await executeQuery(query, values);

      // Log activity
      await logActivity(userId, 'CREATE', 'FORM_RESPONSE', responseId, 
        `Submitted form: ${form.name}`);

      return { id: responseId, formId, status: 'submitted' };
    } catch (error) {
      throw new Error(`Failed to submit form: ${error.message}`);
    }
  }

  /**
   * Get all responses for a form
   * @param {number} formId - Form ID
   * @param {Object} options - Query options (limit, offset, filters)
   * @returns {Array} Form responses
   */
  async getFormResponses(formId, options = {}) {
    try {
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const limit = options.limit || 50;
      const offset = options.offset || 0;

      const responses = await executeQuery(
        `SELECT * FROM \`${form.table_name}\` 
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      const countResult = await executeQuery(
        `SELECT COUNT(*) as total FROM \`${form.table_name}\``
      );

      return {
        data: responses,
        total: countResult[0].total,
        limit,
        offset
      };
    } catch (error) {
      throw new Error(`Failed to get form responses: ${error.message}`);
    }
  }

  /**
   * Get single form response
   * @param {number} formId - Form ID
   * @param {number} responseId - Response ID
   * @returns {Object} Form response
   */
  async getFormResponse(formId, responseId) {
    try {
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      const responses = await executeQuery(
        `SELECT * FROM \`${form.table_name}\` WHERE id = ?`,
        [responseId]
      );

      if (responses.length === 0) {
        throw new Error('Response not found');
      }

      return responses[0];
    } catch (error) {
      throw new Error(`Failed to get form response: ${error.message}`);
    }
  }

  /**
   * Update a form response
   * @param {number} formId - Form ID
   * @param {number} responseId - Response ID
   * @param {Object} updateData - Updated data
   * @param {number} userId - User updating
   * @returns {Object} Updated response
   */
  async updateFormResponse(formId, responseId, updateData, userId) {
    try {
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Validate data
      this.validateFormData(updateData, form.fields);

      // Build update query
      const setClauses = [];
      const values = [];

      for (const field of form.fields) {
        if (updateData[field.field_name] !== undefined) {
          setClauses.push(`\`${field.db_column_name}\` = ?`);
          values.push(this.formatFieldValue(updateData[field.field_name], field.field_type));
        }
      }

      if (setClauses.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(responseId);

      const query = `UPDATE \`${form.table_name}\` SET ${setClauses.join(', ')} WHERE id = ?`;
      await executeQuery(query, values);

      // Update metadata
      await executeQuery(
        `UPDATE form_responses_meta SET response_data = ?, status = 'updated' WHERE id = ? AND form_id = ?`,
        [JSON.stringify(updateData), responseId, formId]
      );

      await logActivity(userId, 'UPDATE', 'FORM_RESPONSE', responseId,
        `Updated form response: ${form.name}`);

      return { id: responseId, status: 'updated' };
    } catch (error) {
      throw new Error(`Failed to update form response: ${error.message}`);
    }
  }

  /**
   * Delete a form response (admin only)
   * @param {number} formId - Form ID
   * @param {number} responseId - Response ID
   * @param {number} userId - User deleting (admin)
   */
  async deleteFormResponse(formId, responseId, userId) {
    try {
      const form = await this.getForm(formId);
      if (!form) {
        throw new Error('Form not found');
      }

      // Delete from both tables
      await executeQuery(
        `DELETE FROM \`${form.table_name}\` WHERE id = ?`,
        [responseId]
      );

      await executeQuery(
        `DELETE FROM form_responses_meta WHERE id = ? AND form_id = ?`,
        [responseId, formId]
      );

      await logActivity(userId, 'DELETE', 'FORM_RESPONSE', responseId,
        `Deleted form response: ${form.name}`);
    } catch (error) {
      throw new Error(`Failed to delete form response: ${error.message}`);
    }
  }

  /**
   * Create dynamic response table
   * @private
   */
  async createResponseTable(formId, tableName, fields) {
    let createTableSQL = `
      CREATE TABLE \`${tableName}\` (
        id INT PRIMARY KEY AUTO_INCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `;

    for (const field of fields) {
      const columnName = this.generateColumnName(field.fieldName);
      const columnType = this.getColumnType(field.fieldType);
      createTableSQL += `,\n        \`${columnName}\` ${columnType}`;
    }

    createTableSQL += `
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableSQL);
  }

  /**
   * Add column to response table
   * @private
   */
  async addColumnToResponseTable(tableName, columnName, fieldType) {
    const columnType = this.getColumnType(fieldType);
    const alterSQL = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType}`;
    await executeQuery(alterSQL);
  }

  /**
   * Delete form field and corresponding column
   * @private
   */
  async deleteFormField(formId, fieldId, tableName) {
    const fields = await executeQuery(
      'SELECT db_column_name FROM form_fields WHERE id = ?',
      [fieldId]
    );

    if (fields.length > 0) {
      const columnName = fields[0].db_column_name;
      await executeQuery(
        `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnName}\``
      );
    }

    await executeQuery(
      'DELETE FROM form_fields WHERE id = ? AND form_id = ?',
      [fieldId, formId]
    );
  }

  /**
   * Generate table name from form name
   * @private
   */
  generateTableName(formName) {
    return `form_${formName.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 90)}`;
  }

  /**
   * Generate column name from field name
   * @private
   */
  generateColumnName(fieldName) {
    return fieldName.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 64);
  }

  /**
   * Get SQL column type for field type
   * @private
   */
  getColumnType(fieldType) {
    const typeMap = {
      text: 'VARCHAR(255)',
      textarea: 'TEXT',
      number: 'DECIMAL(15, 2)',
      currency: 'DECIMAL(15, 2)',
      date: 'DATE',
      select: 'VARCHAR(255)',
      multiselect: 'JSON',
      checkbox: 'BOOLEAN',
      radio: 'VARCHAR(255)'
    };
    return typeMap[fieldType] || 'VARCHAR(255)';
  }

  /**
   * Format field value for insertion
   * @private
   */
  formatFieldValue(value, fieldType) {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (fieldType) {
      case 'number':
      case 'currency':
        return parseFloat(value);
      case 'checkbox':
        return value ? 1 : 0;
      case 'multiselect':
        return typeof value === 'string' ? value : JSON.stringify(value);
      case 'date':
        return value;
      default:
        return String(value);
    }
  }

  /**
   * Validate form data against form definition
   * @private
   */
  validateFormData(data, fields) {
    const errors = [];

    for (const field of fields) {
      const value = data[field.field_name];

      // Check required
      if (field.required && (value === null || value === undefined || value === '')) {
        errors.push(`${field.label} is required`);
        continue;
      }

      if (value === null || value === undefined) {
        continue;
      }

      // Type-specific validation
      const fieldValue = String(value).trim();

      if (field.field_type === 'email' && fieldValue) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValue)) {
          errors.push(`${field.label} must be a valid email`);
        }
      }

      if (field.field_type === 'number' && fieldValue) {
        if (isNaN(parseFloat(fieldValue))) {
          errors.push(`${field.label} must be a number`);
        }
      }

      // Validation rules
      if (field.validationRules) {
        if (field.validationRules.min && parseFloat(fieldValue) < field.validationRules.min) {
          errors.push(`${field.label} must be at least ${field.validationRules.min}`);
        }

        if (field.validationRules.max && parseFloat(fieldValue) > field.validationRules.max) {
          errors.push(`${field.label} must be at most ${field.validationRules.max}`);
        }

        if (field.validationRules.pattern) {
          const regex = new RegExp(field.validationRules.pattern);
          if (!regex.test(fieldValue)) {
            errors.push(`${field.label}: ${field.validationRules.message || 'Invalid format'}`);
          }
        }
      }
    }

    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.validationErrors = errors;
      throw error;
    }
  }
}

module.exports = new FormService();
