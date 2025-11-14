import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

interface FormTemplate {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
  table_name: string;
  is_active: boolean;
}

const FormBuilder: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const queryClient = useQueryClient();

  const { data: forms = [] } = useQuery<FormTemplate[]>({
    queryKey: ['form-templates'],
    queryFn: async () => {
      const response = await fetch('/api/forms', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: Partial<FormTemplate>) => {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-templates'] });
      setShowEditor(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Form Templates</h2>
        <button
          onClick={() => { setSelectedForm(null); setShowEditor(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <div key={form.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{form.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{form.description}</p>
            <div className="text-xs text-gray-500 mt-2">
              {form.fields?.length || 0} fields
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormBuilder;
