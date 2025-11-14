import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  validation_rules?: Record<string, any>;
  options?: string[];
  help_text?: string;
}

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export default function DynamicFormField({
  field,
  value,
  onChange,
  error,
}: DynamicFormFieldProps) {
  const renderInput = () => {
    switch (field.field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            rows={4}
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder="0"
            step={field.validation_rules?.step || '1'}
            min={field.validation_rules?.min}
            max={field.validation_rules?.max}
            className="w-full px-4 py-2 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          />
        );

      case 'currency':
        return (
          <div className="flex items-center overflow-hidden bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
            <span className="px-4 py-2 font-semibold text-gray-700 bg-gray-100 dark:bg-gray-600 dark:text-gray-300">
              R
            </span>
            <input
              type="number"
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min={field.validation_rules?.min || '0'}
              max={field.validation_rules?.max}
              className="flex-1 px-4 py-2 text-gray-900 placeholder-gray-500 bg-transparent dark:text-white dark:placeholder-gray-400 focus:outline-none"
              aria-label={field.label}
            />
          </div>
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          >
            <option value="">Select {field.label}</option>
            {(field.options || []).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : value ? [value] : []}
            onChange={e => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(selected);
            }}
            className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label={field.label}
          >
            {(field.options || []).map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={field.field_name}
              checked={value === true || value === 'true' || value === 1}
              onChange={e => onChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              aria-label={field.label}
            />
            <label htmlFor={field.field_name} className="text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {(field.options || []).map(option => (
              <label key={option} className="flex items-center gap-3">
                <input
                  type="radio"
                  name={field.field_name}
                  value={option}
                  checked={value === option}
                  onChange={e => onChange(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500"
                  aria-label={`${field.label}: ${option}`}
                />
                <span className="text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  // Different layout for checkbox fields
  if (field.field_type === 'checkbox') {
    return (
      <div>
        {renderInput()}
        {field.help_text && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{field.help_text}</p>
        )}
        {error && (
          <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {renderInput()}
      {field.help_text && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{field.help_text}</p>
      )}
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}
