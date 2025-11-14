import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FormBuilder from '../../components/admin/FormBuilder';
import UserManagement from '../../components/admin/UserManagement';
import DepartmentManagement from '../../components/admin/DepartmentManagement';
import RoleManagement from '../../components/admin/RoleManagement';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'forms' | 'users' | 'departments' | 'roles'>('forms');

  const tabs = [
    { id: 'forms', label: 'Form Builder', icon: '📝' },
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'departments', label: 'Departments', icon: '🏢' },
    { id: 'roles', label: 'Roles & Permissions', icon: '🔐' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Administration
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage forms, users, departments, and permissions
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        {activeTab === 'forms' && <FormBuilder />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'departments' && <DepartmentManagement />}
        {activeTab === 'roles' && <RoleManagement />}
      </div>
    </div>
  );
};

export default AdminPage;
