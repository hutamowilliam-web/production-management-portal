import React, { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Edit2, Trash2, Download, Search } from 'lucide-react';
import DataTable from '../tables/DataTable';

interface FormField {
  id: number;
  field_name: string;
  label: string;
  field_type: string;
  required: boolean;
}

interface FormResponse {
  id: number;
  [key: string]: any;
}

interface FormResponsesViewerProps {
  formId: number;
  formName: string;
  fields: FormField[];
  responses: FormResponse[];
  total: number;
  isLoading?: boolean;
  onEdit?: (responseId: number, data: any) => Promise<void>;
  onDelete?: (responseId: number) => Promise<void>;
  onExport?: () => Promise<void>;
  onPageChange?: (page: number) => void;
  currentPage?: number;
  pageSize?: number;
}

export default function FormResponsesViewer({
  formId,
  formName,
  fields,
  responses,
  total,
  isLoading = false,
  onEdit,
  onDelete,
  onExport,
  onPageChange,
  currentPage = 1,
  pageSize = 50,
}: FormResponsesViewerProps) {
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  const filteredResponses = useMemo(() => {
    return responses.filter(response => {
      // Filter by status if set
      if (statusFilter !== 'all' && response.status !== statusFilter) {
        return false;
      }
      // Filter by search term
      if (searchTerm.trim()) {
        return fields.some(field => {
          const value = response[field.field_name];
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      }
      return true;
    });
  }, [responses, searchTerm, statusFilter, fields]);

  const tableColumns = useMemo(() => {
    const cols = fields
      .slice(0, 3)
      .map(field => ({
        key: field.field_name,
        label: field.label,
        render: (value: any) => {
          if (value === null || value === undefined) return '-';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).substring(0, 50);
        },
      }));

    cols.push({
      key: 'actions',
      label: 'Actions',
      render: (_, row: FormResponse) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedResponse(row);
              setIsDetailModalOpen(true);
            }}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded transition-colors"
            title="View Details"
          >
            <Search size={16} />
          </button>
          {onEdit && (
            <button
              onClick={() => {
                setSelectedResponse(row);
                setEditData({ ...row });
                setIsEditModalOpen(true);
              }}
              className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded transition-colors"
              title="Edit Response"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to delete this response? This action cannot be undone.'
                  )
                ) {
                  onDelete(row.id);
                }
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
              title="Delete Response"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    });

    return cols;
  }, [fields, onEdit, onDelete]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport?.();
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedResponse || !onEdit) return;
    await onEdit(selectedResponse.id, editData);
    setIsEditModalOpen(false);
    setEditData({});
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {formName} - Responses
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Showing {filteredResponses.length} of {total} total responses
          </p>
        </div>
        {onExport && (
          <button
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search responses..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              onPageChange?.(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            onPageChange?.(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="viewed">Viewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {filteredResponses.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No responses match your search' : 'No responses yet'}
            </p>
          </div>
        ) : (
          <>
            <DataTable
              columns={tableColumns}
              data={filteredResponses}
              isLoading={isLoading}
              rowKey="id"
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedResponse && (
        <DetailModal
          response={selectedResponse}
          fields={fields}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedResponse && (
        <EditModal
          response={selectedResponse}
          editData={editData}
          fields={fields}
          onChangeField={(fieldName, value) => {
            setEditData({ ...editData, [fieldName]: value });
          }}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditModalOpen(false)}
          isSaving={isLoading}
        />
      )}
    </div>
  );
}

// Detail Modal Component
function DetailModal({
  response,
  fields,
  onClose,
}: {
  response: FormResponse;
  fields: FormField[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-11/12 max-h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Response Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-6">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white break-words">
                  {response[field.field_name] !== null &&
                  response[field.field_name] !== undefined
                    ? typeof response[field.field_name] === 'object'
                      ? JSON.stringify(response[field.field_name])
                      : String(response[field.field_name])
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({
  response,
  editData,
  fields,
  onChangeField,
  onSave,
  onCancel,
  isSaving,
}: {
  response: FormResponse;
  editData: any;
  fields: FormField[];
  onChangeField: (fieldName: string, value: any) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-11/12 max-h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Response</h2>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-2 gap-6">
            {fields.map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {field.label}
                </label>
                {field.field_type === 'textarea' ? (
                  <textarea
                    value={editData[field.field_name] || ''}
                    onChange={e => onChangeField(field.field_name, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                ) : field.field_type === 'select' ? (
                  <select
                    value={editData[field.field_name] || ''}
                    onChange={e => onChangeField(field.field_name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select an option</option>
                  </select>
                ) : (
                  <input
                    type={field.field_type === 'date' ? 'date' : field.field_type === 'number' ? 'number' : 'text'}
                    value={editData[field.field_name] || ''}
                    onChange={e => onChangeField(field.field_name, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
