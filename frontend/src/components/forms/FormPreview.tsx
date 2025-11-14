import React, { useState } from 'react';

interface FormField {
  id?: number;
  fieldName: string;
  label: string;
  fieldType: string;
  required: boolean;
  validationRules?: Record<string, any>;
  options?: string[];
  dependsOn?: string;
  dependsOnValue?: string;
  helpText?: string;
}

interface FormDefinition {
  name: string;
  description: string;
  fields: FormField[];
}

interface FormPreviewProps {
  form: FormDefinition;
}

export default function FormPreview({ form }: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Calculate which fields are visible
    const visible = new Set<string>();
    for (const field of form.fields) {
      if (!field.dependsOn) {
        visible.add(field.fieldName);
      } else if (formValues[field.dependsOn] === field.dependsOnValue) {
        visible.add(field.fieldName);
      }
    }
    setVisibleFields(visible);
  }, [formValues, form.fields]);

  const renderField = (field: FormField) => {
    if (!visibleFields.has(field.fieldName)) {
      return null;
    }

    const value = formValues[field.fieldName] || '';

    switch (field.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={e =>
              setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
            }
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e =>
              setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
            }
            placeholder={field.label}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={e =>
              setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
            }
            placeholder={field.label}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'currency':
        return (
          <div className="flex items-center">
            <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
              R
            </span>
            <input
              type="number"
              value={value}
              onChange={e =>
                setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
              }
              placeholder="0.00"
              step="0.01"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={e =>
              setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
            }
            aria-label={field.label}
            title={field.label}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={e =>
              setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
            }
            aria-label={field.label}
            title={field.label}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value === 'true'}
              onChange={e =>
                setFormValues(prev => ({
                  ...prev,
                  [field.fieldName]: e.target.checked ? 'true' : 'false',
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              I agree to {field.label}
            </span>
          </label>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map(option => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.fieldName}
                  value={option}
                  checked={value === option}
                  onChange={e =>
                    setFormValues(prev => ({ ...prev, [field.fieldName]: e.target.value }))
                  }
                  className="rounded-full border-gray-300"
                />
                <span className="text-sm text-gray-900 dark:text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {/* Form Title */}
      <div className="pb-2 border-b border-gray-300 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-white">{form.name}</h3>
        {form.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{form.description}</p>
        )}
      </div>

      {/* Fields */}
      {form.fields.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No fields to preview
        </p>
      ) : (
        form.fields.map(field => (
          <div key={field.fieldName}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.required && <span className="text-red-500"> *</span>}
            </label>
            {renderField(field)}
            {field.helpText && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{field.helpText}</p>
            )}
          </div>
        ))
      )}

      {/* Submit Button */}
      {form.fields.length > 0 && (
        <button
          type="button"
          disabled
          className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg opacity-50 text-sm font-medium"
        >
          Submit (Preview Only)
        </button>
      )}
    </div>
  );
}
