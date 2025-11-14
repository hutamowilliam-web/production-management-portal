import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import SOPFailureForm from '../../components/forms/SOPFailureForm';
import { useAuth } from '../../contexts/AuthContext';

const SOPFailuresPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const { data: sopFailures = [], isLoading, refetch } = useQuery({
    queryKey: ['sop-failures', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}` : '';
      const response = await fetch(`/api/sop${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  const processedFailures = sopFailures.map((sop: any) => {
    const formData = JSON.parse(sop.form_data || '{}');
    return {
      ...sop,
      failure_type: formData.failure_type || 'N/A',
      area: formData.area || 'N/A',
      description: formData.description || 'N/A',
      severity: formData.severity || 'N/A'
    };
  });

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'failure_type', label: 'Failure Type', sortable: true },
    { key: 'area', label: 'Area', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    {
      key: 'severity',
      label: 'Severity',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Critical' 
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : value === 'High'
            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
            : value === 'Medium'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Open' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : value === 'Escalated'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'submitted_by_username', label: 'Submitted By', sortable: true },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SOP Failures
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage Standard Operating Procedure failures
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Report SOP Failure
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Report SOP Failure
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <SOPFailureForm
                onSuccess={() => {
                  setShowForm(false);
                  refetch();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={processedFailures}
        columns={columns}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default SOPFailuresPage;