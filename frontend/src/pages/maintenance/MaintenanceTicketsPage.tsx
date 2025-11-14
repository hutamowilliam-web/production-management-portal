import React from 'react';
import { useQuery } from '@tanstack/react-query';
import DataTable from '../../components/tables/DataTable';
import { useAuth } from '../../contexts/AuthContext';

const MaintenanceTicketsPage: React.FC = () => {
  const { user } = useAuth();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['maintenance-tickets', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}` : '';
      const response = await fetch(`/api/maintenance${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  const columns = [
    { key: 'machine_name', label: 'Machine', sortable: true },
    { key: 'department_name', label: 'Department', sortable: true },
    { key: 'issue_description', label: 'Issue', sortable: true },
    {
      key: 'priority',
      label: 'Priority',
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
            : value === 'In Progress'
            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'cost',
      label: 'Cost',
      sortable: true,
      render: (value: number) => `R${value.toLocaleString()}`
    },
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
            Maintenance Tickets
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track machinery maintenance requests and repairs
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          New Ticket
        </button>
      </div>

      <DataTable
        data={tickets}
        columns={columns}
        searchable={true}
        filterable={true}
        pagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default MaintenanceTicketsPage;