import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface DashboardStatsProps {
  departmentId?: number;
}

interface Stats {
  rejects: {
    count: number;
    totalCost: number;
  };
  returns: {
    count: number;
    totalCost: number;
  };
  sopFailures: {
    open: number;
    escalated: number;
    closed: number;
  };
  maintenanceTickets: {
    open: number;
    in_progress: number;
    completed: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ departmentId }) => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats', departmentId],
    queryFn: async () => {
      const params = departmentId ? `?department_id=${departmentId}` : '';
      const response = await fetch(`/api/dashboard/stats${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Internal Rejects',
      value: stats?.rejects.count || 0,
      subtitle: `R${(stats?.rejects.totalCost || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'red',
      icon: '❌'
    },
    {
      title: 'Customer Returns',
      value: stats?.returns.count || 0,
      subtitle: `R${(stats?.returns.totalCost || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: 'orange',
      icon: '↩️'
    },
    {
      title: 'Open SOP Failures',
      value: stats?.sopFailures.open || 0,
      subtitle: `${stats?.sopFailures.escalated || 0} escalated`,
      color: 'yellow',
      icon: '⚠️'
    },
    {
      title: 'Closed SOP Failures',
      value: stats?.sopFailures.closed || 0,
      subtitle: 'This period',
      color: 'green',
      icon: '✓'
    },
    {
      title: 'Open Maintenance',
      value: stats?.maintenanceTickets.open || 0,
      subtitle: `${stats?.maintenanceTickets.in_progress || 0} in progress`,
      color: 'blue',
      icon: '🔧'
    },
    {
      title: 'Completed Maintenance',
      value: stats?.maintenanceTickets.completed || 0,
      subtitle: 'This period',
      color: 'green',
      icon: '✓'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            New Reject
          </button>
          <button className="p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            New Return
          </button>
          <button className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            SOP Failure
          </button>
          <button className="p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;