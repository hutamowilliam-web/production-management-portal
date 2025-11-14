import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import InternalRejectForm from '../../components/forms/InternalRejectForm';
import { useAuth } from '../../contexts/AuthContext';

interface InternalReject {
  id: number;
  form_data: string;
  department_name: string;
  status: string;
  created_at: string;
  username: string;
}

const InternalRejectsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const { data: rejects = [], isLoading, refetch } = useQuery<InternalReject[]>({
    queryKey: ['internal-rejects', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}` : '';
      const response = await fetch(`/api/rejects${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  const processedRejects = rejects.map(reject => {
    const formData = JSON.parse(reject.form_data || '{}');
    return {
      ...reject,
      sales_order_number: formData.sales_order_number || 'N/A',
      customer_name: formData.customer_name || 'N/A',
      product: formData.product || 'N/A',
      reject_quantity: formData.reject_quantity || 0,
      total_cost: formData.total_cost || 0
    };
  });

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true
    },
    {
      key: 'sales_order_number',
      label: 'Sales Order',
      sortable: true
    },
    {
      key: 'customer_name',
      label: 'Customer',
      sortable: true
    },
    {
      key: 'product',
      label: 'Product',
      sortable: true
    },
    {
      key: 'reject_quantity',
      label: 'Quantity',
      sortable: true
    },
    {
      key: 'total_cost',
      label: 'Cost',
      sortable: true,
      render: (value: number) => `R${value.toLocaleString()}`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Pending' 
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : value === 'Stock Received'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'username',
      label: 'Submitted By',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Internal Rejects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track internal production rejects
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Reject
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Submit Internal Reject
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <InternalRejectForm
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
        data={processedRejects}
        columns={columns}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default InternalRejectsPage;