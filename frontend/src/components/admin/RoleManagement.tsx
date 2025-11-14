import React from 'react';
import { useQuery } from '@tanstack/react-query';

const RoleManagement: React.FC = () => {
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await fetch('/api/users/roles', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      return response.json();
    }
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Roles & Permissions</h2>
      <div className="space-y-4">
        {roles.map((role: any) => (
          <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{role.name}</h3>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(role.permissions || '[]').map((perm: string, idx: number) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded text-xs">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleManagement;
