import React, { useState } from 'react';
import { X } from 'lucide-react';

interface FormField {
  id?: number;
  fieldName: string;
  label: string;
  fieldType: string;
  required: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: string[];
  dependsOn?: string;
  dependsOnValue?: string;
  helpText?: string;
}

interface FormFieldConfiguratorProps {
  field: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
}

export default function FormFieldConfigurator({
  field,
  onSave,
  onCancel,
}: FormFieldConfiguratorProps) {
  const [formField, setFormField] = useState<FormField>(field);
  const [optionInput, setOptionInput] = useState('');

  const handleAddOption = () => {
    if (optionInput.trim()) {
      const options = formField.options || [];
      setFormField(prev => ({
        ...prev,
        options: [...options, optionInput.trim()],
      }));
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setFormField(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index),
    }));
  };

  const requiresOptions = ['select', 'multiselect', 'radio'].includes(formField.fieldType);

  return (
    <div className="space-y-4">
      {/* Label */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Field Label *
        </label>
        <input
          type="text"
          value={formField.label}
          onChange={e => setFormField(prev => ({ ...prev, label: e.target.value }))}
          placeholder="Enter field label"
          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Field Name */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Field Name
        </label>
        <input
          type="text"
          value={formField.fieldName}
          onChange={e => setFormField(prev => ({ ...prev, fieldName: e.target.value }))}
          placeholder="field_name"
          className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={formField.required}
          onChange={e => setFormField(prev => ({ ...prev, required: e.target.checked }))}
          className="border-gray-300 rounded"
        />
        <label htmlFor="required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Required Field
        </label>
      </div>

      {/* Help Text */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Help Text
        </label>
        <textarea
          value={formField.helpText || ''}
          onChange={e => setFormField(prev => ({ ...prev, helpText: e.target.value }))}
          placeholder="Optional hint text for users"
          rows={2}
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Options for select/radio/checkbox */}
      {requiresOptions && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Options
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={optionInput}
              onChange={e => setOptionInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddOption()}
              placeholder="Add option"
              className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddOption}
              className="px-3 py-2 text-sm text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="space-y-1">
            {(formField.options || []).map((option, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-100 rounded dark:bg-gray-700"
              >
                <span className="text-sm text-gray-900 dark:text-white">{option}</span>
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="p-1 transition rounded hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <X size={14} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Rules */}
      {(formField.fieldType === 'number' || formField.fieldType === 'currency') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Validation Rules
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Min Value</label>
              <input
                type="number"
                value={formField.validationRules?.min || ''}
                onChange={e =>
                  setFormField(prev => ({
                    ...prev,
                    validationRules: {
                      ...prev.validationRules,
                      min: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  }))
                }
                className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Max Value</label>
              <input
                type="number"
                value={formField.validationRules?.max || ''}
                onChange={e =>
                  setFormField(prev => ({
                    ...prev,
                    validationRules: {
                      ...prev.validationRules,
                      max: e.target.value ? parseFloat(e.target.value) : undefined,
                    },
                  }))
                }
                className="w-full px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Logic */}
      <div className="p-3 space-y-2 rounded bg-blue-50 dark:bg-blue-900/20">
        <label className="block text-sm font-medium text-blue-900 dark:text-blue-200">
          Show if Another Field Equals...
        </label>
        <input
          type="text"
          value={formField.dependsOn || ''}
          onChange={e => setFormField(prev => ({ ...prev, dependsOn: e.target.value }))}
          placeholder="field_name (leave empty to always show)"
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-blue-300 rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          value={formField.dependsOnValue || ''}
          onChange={e => setFormField(prev => ({ ...prev, dependsOnValue: e.target.value }))}
          placeholder="expected value"
          className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-blue-300 rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={() => onSave(formField)}
          className="flex-1 px-4 py-2 font-medium text-white transition bg-green-600 rounded-lg hover:bg-green-700"
        >
          Save Field
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 transition border border-gray-300 rounded-lg dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
