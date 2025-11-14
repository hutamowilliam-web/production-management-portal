import React, { useState, useMemo } from 'react';
import { X, Plus, Trash2, Eye, ChevronDown } from 'lucide-react';

interface FormField {
  id?: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  validation_rules?: Record<string, any>;
  options?: string[];
  help_text?: string;
  depends_on?: string;
  depends_on_value?: string;
  field_order?: number;
}

interface FormData {
  id?: number;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormBuilderProps {
  initialForm?: FormData;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'multiselect', label: 'Multi-Select' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Buttons' },
];

export default function FormBuilder({
  initialForm,
  onSave,
  onCancel,
  isLoading = false,
}: FormBuilderProps) {
  const [formName, setFormName] = useState(initialForm?.name || '');
  const [formDescription, setFormDescription] = useState(initialForm?.description || '');
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
  const [showFieldTypeSelector, setShowFieldTypeSelector] = useState(false);
  const [optionInput, setOptionInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedField = useMemo(
    () => (selectedFieldIndex !== null ? fields[selectedFieldIndex] : null),
    [selectedFieldIndex, fields]
  );

  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      field_name: `field_${fields.length + 1}`,
      label: '',
      field_type: fieldType,
      required: false,
      options: ['select', 'multiselect', 'radio'].includes(fieldType) ? [''] : undefined,
      validation_rules: {},
      field_order: fields.length,
    };
    setFields([...fields, newField]);
    setSelectedFieldIndex(fields.length);
    setShowFieldTypeSelector(false);
  };

  const handleUpdateField = (updates: Partial<FormField>) => {
    if (selectedFieldIndex === null) return;
    const newFields = [...fields];
    newFields[selectedFieldIndex] = {
      ...newFields[selectedFieldIndex],
      ...updates,
    };
    setFields(newFields);
  };

  const handleDeleteField = () => {
    if (selectedFieldIndex === null) return;
    const newFields = fields.filter((_, i) => i !== selectedFieldIndex);
    setFields(newFields);
    setSelectedFieldIndex(null);
  };

  const handleAddOption = () => {
    if (!selectedField || !optionInput.trim()) return;
    const newOptions = [...(selectedField.options || [])];
    newOptions.push(optionInput.trim());
    handleUpdateField({ options: newOptions });
    setOptionInput('');
  };

  const handleRemoveOption = (index: number) => {
    if (!selectedField) return;
    const newOptions = selectedField.options?.filter((_, i) => i !== index) || [];
    handleUpdateField({ options: newOptions });
  };

  const handleGenerateFieldName = () => {
    if (!selectedField?.label) return;
    const name = selectedField.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    handleUpdateField({ field_name: name });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formName.trim()) newErrors.formName = 'Form name is required';
    if (fields.length === 0) newErrors.fields = 'At least one field is required';
    fields.forEach((field, i) => {
      if (!field.label.trim()) newErrors[`field_${i}_label`] = 'Field label is required';
      if (!field.field_name.trim()) newErrors[`field_${i}_name`] = 'Field name is required';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const formData: FormData = {
      ...(initialForm?.id && { id: initialForm.id }),
      name: formName,
      description: formDescription,
      fields: fields.map((f, i) => ({ ...f, field_order: i })),
    };
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-11/12 h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialForm ? 'Edit Form' : 'Create New Form'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Form Details */}
          <div className="w-1/4 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Form Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Form Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => {
                    setFormName(e.target.value);
                    setErrors({ ...errors, formName: '' });
                  }}
                  placeholder="e.g., Internal Reject Form"
                  className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.formName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.formName && (
                  <p className="mt-1 text-sm text-red-600">{errors.formName}</p>
                )}
              </div>

              {/* Form Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Describe what this form is for"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Fields List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Fields ({fields.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {fields.map((field, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedFieldIndex(i)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedFieldIndex === i
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {field.label || '(Untitled field)'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {field.field_type}
                        {field.required && ' • Required'}
                      </div>
                    </button>
                  ))}
                </div>
                {errors.fields && (
                  <p className="mt-2 text-sm text-red-600">{errors.fields}</p>
                )}
              </div>

              {/* Add Field Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFieldTypeSelector(!showFieldTypeSelector)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Add Field
                  <ChevronDown size={18} />
                </button>
                {showFieldTypeSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                    {FIELD_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleAddField(type.value)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm text-gray-900 dark:text-white first:rounded-t-lg last:rounded-b-lg"
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Panel - Field Configuration */}
          <div className="w-2/4 border-r border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            {selectedField ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configure Field
                </h3>

                {/* Field Label */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field Label *
                  </label>
                  <input
                    type="text"
                    value={selectedField.label}
                    onChange={e => {
                      handleUpdateField({ label: e.target.value });
                      const i = fields.indexOf(selectedField);
                      setErrors({ ...errors, [`field_${i}_label`]: '' });
                    }}
                    placeholder="e.g., Sales Order Number"
                    className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[`field_${fields.indexOf(selectedField)}_label`]
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Field Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field Name (Database Column) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedField.field_name}
                      onChange={e => {
                        handleUpdateField({ field_name: e.target.value });
                        const i = fields.indexOf(selectedField);
                        setErrors({ ...errors, [`field_${i}_name`]: '' });
                      }}
                      placeholder="sales_order_number"
                      className={`flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`field_${fields.indexOf(selectedField)}_name`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <button
                      onClick={handleGenerateFieldName}
                      className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                {/* Field Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field Type
                  </label>
                  <select
                    value={selectedField.field_type}
                    onChange={e => handleUpdateField({ field_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {FIELD_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={e => handleUpdateField({ required: e.target.checked })}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Required Field
                  </label>
                </div>

                {/* Help Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Help Text
                  </label>
                  <textarea
                    value={selectedField.help_text || ''}
                    onChange={e => handleUpdateField({ help_text: e.target.value })}
                    placeholder="Additional guidance for users"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Options (for select/radio/multiselect) */}
                {['select', 'multiselect', 'radio'].includes(selectedField.field_type) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Options
                    </label>
                    <div className="space-y-2">
                      {(selectedField.options || []).map((option, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={e => {
                              const newOptions = [...(selectedField.options || [])];
                              newOptions[i] = e.target.value;
                              handleUpdateField({ options: newOptions });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            onClick={() => handleRemoveOption(i)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={optionInput}
                        onChange={e => setOptionInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleAddOption()}
                        placeholder="Add new option"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={handleAddOption}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Validation Rules */}
                {['number', 'currency'].includes(selectedField.field_type) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Validation Rules</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Minimum Value
                      </label>
                      <input
                        type="number"
                        value={selectedField.validation_rules?.min || ''}
                        onChange={e =>
                          handleUpdateField({
                            validation_rules: {
                              ...selectedField.validation_rules,
                              min: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Maximum Value
                      </label>
                      <input
                        type="number"
                        value={selectedField.validation_rules?.max || ''}
                        onChange={e =>
                          handleUpdateField({
                            validation_rules: {
                              ...selectedField.validation_rules,
                              max: e.target.value ? parseFloat(e.target.value) : undefined,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Logic */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Conditional Logic (Optional)
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Show this field only if another field has a specific value
                  </p>
                  <div className="space-y-2">
                    <select
                      value={selectedField.depends_on || ''}
                      onChange={e =>
                        handleUpdateField({
                          depends_on: e.target.value || undefined,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Depends on field...</option>
                      {fields
                        .filter((f, i) => i !== fields.indexOf(selectedField))
                        .map((f, i) => (
                          <option key={i} value={f.field_name}>
                            {f.label || f.field_name}
                          </option>
                        ))}
                    </select>
                    {selectedField.depends_on && (
                      <input
                        type="text"
                        value={selectedField.depends_on_value || ''}
                        onChange={e =>
                          handleUpdateField({
                            depends_on_value: e.target.value,
                          })
                        }
                        placeholder="When field value equals..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Delete Field Button */}
                <button
                  onClick={handleDeleteField}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Field
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Select a field to configure or add a new one</p>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="w-1/4 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={18} className="text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Preview</h3>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {formName || 'Form Title'}
                </h2>
                {formDescription && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formDescription}</p>
                )}
              </div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                    No fields yet
                  </p>
                ) : (
                  fields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                        {field.field_type}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : initialForm ? 'Update Form' : 'Create Form'}
          </button>
        </div>
      </div>
    </div>
  );
}
