import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DynamicForm from '../../components/forms/DynamicForm';

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  validation_rules?: Record<string, any>;
  options?: string[];
  help_text?: string;
  depends_on?: string;
  depends_on_value?: string;
}

interface FormDefinition {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormSubmissionPageProps {
  formName: string;
  formId?: number;
}

export default function FormSubmissionPage({ formName, formId }: FormSubmissionPageProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [responseId, setResponseId] = useState<number | null>(null);

  const API_BASE = 'http://localhost:5000/api';

  // Load form by name or ID
  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      try {
        // If formId is provided, use it; otherwise, search by name
        let url = `${API_BASE}/forms`;
        if (formId) {
          url = `${API_BASE}/forms/${formId}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Form not found');
        }

        const data = await response.json();

        // If we got a list, find the form by name
        if (Array.isArray(data.data)) {
          const foundForm = data.data.find(
            (f: FormDefinition) => f.name.toLowerCase() === formName.toLowerCase()
          );
          if (!foundForm) throw new Error('Form not found');
          setForm(foundForm);
        } else {
          // Single form response
          setForm(data.data);
        }

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formName, formId]);

  const handleSubmit = async (formData: Record<string, any>) => {
    if (!form) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/forms/${form.id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit form');
      }

      setSuccess(true);
      setResponseId(data.data?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
        </div>

        {/* Success Message */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center space-y-6">
          <CheckCircle size={48} className="text-green-600 dark:text-green-400 mx-auto" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Form Submitted!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your {form?.name} form has been successfully submitted.
            </p>
          </div>

          {responseId && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Confirmation Number</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">#{responseId}</p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setResponseId(null);
              }}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium mb-4"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 flex items-center justify-center min-h-96">
          <p className="text-gray-600 dark:text-gray-400">Loading form...</p>
        </div>
      ) : form ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{form.name}</h1>
            {form.description && (
              <p className="text-gray-600 dark:text-gray-400">{form.description}</p>
            )}
          </div>

          <hr className="border-gray-200 dark:border-gray-700 mb-8" />

          {/* Form */}
          <DynamicForm
            form={form}
            isLoading={isSubmitting}
            onSubmit={handleSubmit}
            submitButtonText="Submit Form"
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <AlertCircle size={48} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Form Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The form you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
