import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, AlertCircle } from 'lucide-react';
import FormBuilder from '../../components/forms/FormBuilder';
import FormResponsesViewer from '../../components/forms/FormResponsesViewer';

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
  field_order: number;
}

interface Form {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
  created_by: string;
  created_at: string;
  field_count: number;
  response_count: number;
}

interface FormResponse {
  id: number;
  [key: string]: any;
}

type Tab = 'forms' | 'responses';

export default function FormManagementPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [tab, setTab] = useState<Tab>('forms');
  const [isLoading, setIsLoading] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ formId: number; formName: string } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [responsesTotal, setResponsesTotal] = useState(0);
  const [responsesPage, setResponsesPage] = useState(1);
  const [responsesLoading, setResponsesLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api';

  // Load forms
  const loadForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/forms`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to load forms');
      const data = await response.json();
      setForms(data.data || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load form responses
  const loadResponses = useCallback(async (formId: number, page: number = 1) => {
    if (!selectedForm) return;
    setResponsesLoading(true);
    try {
      const offset = (page - 1) * 50;
      const response = await fetch(
        `${API_BASE}/forms/${formId}/responses?limit=50&offset=${offset}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to load responses');
      const data = await response.json();
      setResponses(data.data?.data || []);
      setResponsesTotal(data.data?.total || 0);
      setResponsesPage(page);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load responses');
    } finally {
      setResponsesLoading(false);
    }
  }, [selectedForm]);

  useEffect(() => {
    loadForms();
  }, [loadForms]);

  // Load responses when form selected and tab changed to responses
  useEffect(() => {
    if (tab === 'responses' && selectedForm) {
      loadResponses(selectedForm.id, 1);
    }
  }, [tab, selectedForm, loadResponses]);

  // Create or update form
  const handleSaveForm = async (formData: any) => {
    setIsLoading(true);
    try {
      const method = editingForm ? 'PUT' : 'POST';
      const url = editingForm ? `${API_BASE}/forms/${editingForm.id}` : `${API_BASE}/forms`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save form');
      }

      setSuccess(editingForm ? 'Form updated successfully' : 'Form created successfully');
      setShowFormBuilder(false);
      setEditingForm(null);
      loadForms();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete form
  const handleDeleteForm = async (formId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/forms/${formId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete form');

      setSuccess('Form deleted successfully');
      setDeleteConfirmation(null);
      loadForms();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete form');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete response
  const handleDeleteResponse = async (responseId: number) => {
    if (!selectedForm) return;
    setResponsesLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/forms/${selectedForm.id}/responses/${responseId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete response');

      setSuccess('Response deleted successfully');
      loadResponses(selectedForm.id, responsesPage);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete response');
    } finally {
      setResponsesLoading(false);
    }
  };

  // Export responses
  const handleExportResponses = async () => {
    if (!selectedForm) return;
    try {
      const response = await fetch(
        `${API_BASE}/forms/${selectedForm.id}/responses/export/csv`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedForm.name}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('CSV exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage dynamic forms for your organization
          </p>
        </div>
        <button
          onClick={() => {
            setEditingForm(null);
            setShowFormBuilder(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Create Form
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-900 dark:text-red-200">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="w-5 h-5 bg-green-600 dark:bg-green-400 rounded-full flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-900 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* Tabs */}
      {selectedForm ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setSelectedForm(null)}
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 pb-3 px-3"
            >
              ← Back to Forms
            </button>
          </div>

          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTab('forms')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                tab === 'forms'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Form Details
            </button>
            <button
              onClick={() => setTab('responses')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                tab === 'responses'
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Responses ({selectedForm.response_count})
            </button>
          </div>

          {/* Form Details Tab */}
          {tab === 'forms' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedForm.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedForm.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fields</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedForm.field_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Responses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedForm.response_count}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(selectedForm.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Fields</h3>
                  <div className="space-y-2">
                    {selectedForm.fields.map(field => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{field.label}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {field.field_type}
                            {field.required && ' • Required'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingForm(selectedForm);
                      setShowFormBuilder(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <Edit2 size={18} />
                    Edit Form
                  </button>
                  <button
                    onClick={() =>
                      setDeleteConfirmation({
                        formId: selectedForm.id,
                        formName: selectedForm.name,
                      })
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                    Delete Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Responses Tab */}
          {tab === 'responses' && selectedForm && (
            <FormResponsesViewer
              formId={selectedForm.id}
              formName={selectedForm.name}
              fields={selectedForm.fields}
              responses={responses}
              total={responsesTotal}
              isLoading={responsesLoading}
              onDelete={handleDeleteResponse}
              onExport={handleExportResponses}
              onPageChange={page => loadResponses(selectedForm.id, page)}
              currentPage={responsesPage}
              pageSize={50}
            />
          )}
        </div>
      ) : (
        /* Forms List */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No forms created yet</p>
              <button
                onClick={() => {
                  setEditingForm(null);
                  setShowFormBuilder(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                Create First Form
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {forms.map(form => (
                <div
                  key={form.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg dark:hover:bg-gray-700 transition-all"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{form.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {form.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>{form.field_count} fields</span>
                    <span>{form.response_count} responses</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedForm(form)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditingForm(form);
                        setShowFormBuilder(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded hover:bg-yellow-200 dark:hover:bg-yellow-900/40 transition-colors text-sm font-medium"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          formId: form.id,
                          formName: form.name,
                        })
                      }
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors text-sm font-medium"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Builder Modal */}
      {showFormBuilder && (
        <FormBuilder
          initialForm={editingForm || undefined}
          onSave={handleSaveForm}
          onCancel={() => {
            setShowFormBuilder(false);
            setEditingForm(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-11/12 p-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Form?</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete "<strong>{deleteConfirmation.formName}</strong>"? This will also delete
              all responses associated with this form. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteForm(deleteConfirmation.formId)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
