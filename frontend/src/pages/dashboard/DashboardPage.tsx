import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardStats from '../../components/dashboard/DashboardStats';
import DataTable from '../../components/tables/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import StatusTimeline from '../../components/common/StatusTimeline';
import PerformanceIndicator from '../../components/common/PerformanceIndicator';
import { useQuery } from '@tanstack/react-query';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface PendingItem {
  type: string;
  id: number;
  reference: string;
  status: string;
  amount?: number;
  created_at: string;
  hours_pending: number;
  department: string;
}

interface Activity {
  id: number;
  action: string;
  entity_type: string;
  created_at: string;
  username: string;
  record_id: number;
}

interface RecentRecord {
  id: number;
  reference: string;
  type: string;
  status: string;
  created_at: string;
  created_by: string;
  amount?: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch pending items
  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery<PendingItem[]>({
    queryKey: ['dashboard-pending', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}` : '';
      const response = await fetch(`/api/dashboard/pending${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  // Fetch recent activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ['dashboard-activities', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}` : '';
      const response = await fetch(`/api/dashboard/activities${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  // Fetch recent records
  const { data: recentRecords = [] } = useQuery<RecentRecord[]>({
    queryKey: ['dashboard-recent', user?.department_id],
    queryFn: async () => {
      const params = user?.department_id ? `?department_id=${user.department_id}&limit=10` : '?limit=10';
      const response = await fetch(`/api/dashboard/recent${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.json();
    }
  });

  // Timeline data from activities
  const timelineItems = useMemo(() => {
    return activities.slice(0, 5).map(activity => ({
      id: activity.id.toString(),
      date: new Date(activity.created_at),
      title: activity.action,
      description: `${activity.username} in ${activity.entity_type}`,
      status: 'completed' as const,
    }));
  }, [activities]);

  // Performance metrics
  const pendingByStatus = useMemo(() => {
    const counts = { pending: 0, escalated: 0, urgent: 0 };
    pendingItems.forEach(item => {
      if (item.hours_pending >= 72) counts.urgent++;
      else if (item.hours_pending >= 48) counts.escalated++;
      else counts.pending++;
    });
    return counts;
  }, [pendingItems]);

  const pendingColumns = [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => {
        const typeMap: Record<string, string> = {
          'reject': 'Internal Reject',
          'return': 'Customer Return',
          'sop_failure': 'SOP Failure',
          'maintenance': 'Maintenance'
        };
        return <StatusBadge status={value} size="sm" />;
      }
    },
    {
      key: 'reference',
      label: 'Reference',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} size="sm" variant="subtle" />
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (value: number) => value ? `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}` : '-'
    },
    {
      key: 'hours_pending',
      label: 'Hours',
      sortable: true,
      render: (value: number) => (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
          value >= 72 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : value >= 48
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        }`}>
          {value}h
        </span>
      )
    }
  ];

  const activityColumns = [
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {value}
        </span>
      )
    },
    {
      key: 'entity_type',
      label: 'Module',
      sortable: true,
      render: (value: string) => (
        <span className="capitalize text-gray-600 dark:text-gray-400">
          {value?.replace('_', ' ') || 'System'}
        </span>
      )
    },
    {
      key: 'username',
      label: 'User',
      sortable: true,
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'created_at',
      label: 'Time',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value);
        return date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
      }
    }
  ];

  const recentColumns = [
    {
      key: 'reference',
      label: 'Reference',
      sortable: true
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} size="sm" />
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => <StatusBadge status={value} size="sm" variant="subtle" />
    },
    {
      key: 'created_by',
      label: 'Submitted By',
      sortable: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.department_name} • {user?.role_name}
            </p>
          </div>
          <div className="text-right text-sm text-blue-100">
            <Calendar size={20} className="inline-block mr-2" />
            {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats departmentId={user?.department_id} />

      {/* Key Performance Indicators */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PerformanceIndicator
            label="Pending Items"
            current={pendingByStatus.pending}
            target={0}
            threshold={{ warning: 5, critical: 10 }}
            size="md"
          />
          <PerformanceIndicator
            label="Escalated (48h+)"
            current={pendingByStatus.escalated}
            target={0}
            threshold={{ warning: 3, critical: 5 }}
            size="md"
          />
          <PerformanceIndicator
            label="Critical (72h+)"
            current={pendingByStatus.urgent}
            target={0}
            threshold={{ warning: 1, critical: 3 }}
            size="md"
          />
        </div>
      </div>

      {/* Alert Section */}
      {pendingItems.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 space-y-3">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">
                Action Required
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">
                You have <strong>{pendingByStatus.urgent}</strong> critical items requiring immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Items - spans 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Items Requiring Attention</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{pendingItems.length} total</span>
          </div>
          <DataTable
            data={pendingItems}
            columns={pendingColumns}
            pageSize={8}
            searchable={true}
            filterable={true}
            isLoading={pendingLoading}
            pagination={pendingItems.length > 8}
          />
        </div>

        {/* Recent Activities */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Activity Feed</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {activitiesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : timelineItems.length > 0 ? (
              <StatusTimeline items={timelineItems} vertical={true} compact={true} maxItems={5} />
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Records */}
      {recentRecords.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recently Created</h2>
          <DataTable
            data={recentRecords}
            columns={recentColumns}
            pageSize={10}
            searchable={true}
            filterable={false}
            pagination={recentRecords.length > 10}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;