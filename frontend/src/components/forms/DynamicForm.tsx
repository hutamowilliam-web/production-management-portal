import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import DynamicFormField from './DynamicFormField';

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  field_order: number;
  validation_rules?: Record<string, any>;
  options?: string[];
  depends_on?: string;
  depends_on_value?: string;
  help_text?: string;
  db_column_name: string;
}

interface FormDefinition {
  id: number;
  name: string;
  description: string;
  table_name: string;
  fields: FormField[];
}

interface DynamicFormProps {
  form: FormDefinition;
  isLoading?: boolean;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  submitButtonText?: string;
}

export default function DynamicForm({
  form,
  isLoading = false,
  onSubmit,
  submitButtonText = 'Submit',
}: DynamicFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Calculate visible fields based on conditional logic
  useEffect(() => {
    const visible = new Set<string>();

    for (const field of form.fields) {
      if (!field.depends_on) {
        visible.add(field.field_name);
      } else if (formValues[field.depends_on] === field.depends_on_value) {
        visible.add(field.field_name);
      }
    }

    setVisibleFields(visible);
  }, [formValues, form.fields]);

  // Validate a single field
  const validateField = (fieldName: string, value: any): string | null => {
    const field = form.fields.find(f => f.field_name === fieldName);
    if (!field) return null;

    // Check required
    if (field.required && (value === '' || value === null || value === undefined)) {
      return `${field.label} is required`;
    }

    if (value === '' || value === null || value === undefined) {
      return null;
    }

    // Type-specific validation
    const stringValue = String(value).trim();

    if (field.field_type === 'number' || field.field_type === 'currency') {
      if (isNaN(parseFloat(stringValue))) {
        return `${field.label} must be a valid number`;
      }

      const numValue = parseFloat(stringValue);

      if (field.validation_rules?.min !== undefined && numValue < field.validation_rules.min) {
        return `${field.label} must be at least ${field.validation_rules.min}`;
      }

      if (field.validation_rules?.max !== undefined && numValue > field.validation_rules.max) {
        return `${field.label} cannot exceed ${field.validation_rules.max}`;
      }
    }

    if (field.field_type === 'date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
        return `${field.label} must be a valid date`;
      }
    }

    // Regex pattern validation
    if (field.validation_rules?.pattern) {
      const regex = new RegExp(field.validation_rules.pattern);
      if (!regex.test(stringValue)) {
        return field.validation_rules.message || `${field.label}: Invalid format`;
      }
    }

    return null;
  };

  // Handle field change
  const handleFieldChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error for this field if fixed
    const error = validateField(fieldName, value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldName] = error;
      } else {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    setGeneralError(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setErrors({});

    // Validate all visible fields
    const newErrors: Record<string, string> = {};

    for (const fieldName of visibleFields) {
      const error = validateField(fieldName, formValues[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setGeneralError('Please fix the errors below');
      return;
    }

    try {
      setIsSubmitting(true);

      // Build submission data with field names
      const submissionData: Record<string, any> = {};
      for (const field of form.fields) {
        if (visibleFields.has(field.field_name) && formValues[field.field_name] !== undefined) {
          submissionData[field.field_name] = formValues[field.field_name];
        }
      }

      await onSubmit(submissionData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
      setGeneralError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort fields by field_order
  const sortedFields = useMemo(
    () => [...form.fields].sort((a, b) => a.field_order - b.field_order),
    [form.fields]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name}</h2>
        {form.description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">{form.description}</p>
        )}
      </div>

      {/* General Error */}
      {generalError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300">{generalError}</p>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-6">
        {sortedFields.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No fields in this form
          </p>
        ) : (
          sortedFields.map(field =>
            visibleFields.has(field.field_name) ? (
              <DynamicFormField
                key={field.id}
                field={field}
                value={formValues[field.field_name] || ''}
                onChange={value => handleFieldChange(field.field_name, value)}
                error={errors[field.field_name]}
              />
            ) : null
          )
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition font-medium"
        >
          {isSubmitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
