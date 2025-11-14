import React from 'react';
import { useQuery } from '@tanstack/react-query';

const DepartmentManagement: React.FC = () => {
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Department Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept: any) => (
          <div key={dept.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{dept.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">ID: {dept.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentManagement;
