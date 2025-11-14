// frontend/src/components/dashboard/AnalyticsDashboard.tsx
// Advanced analytics dashboard for Power Apps integration

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface DashboardStats {
  totalForms: number;
  totalResponses: number;
  pendingResponses: number;
  completedResponses: number;
  rejectedResponses: number;
  avgResponseTime: number;
  completionRate: number;
  rejectionRate: number;
  dateFrom: string;
  dateTo: string;
}

interface FormMetric {
  id: number;
  name: string;
  total_responses: number;
  completed: number;
  rejected: number;
  pending: number;
  avg_response_hours: number;
  completion_rate: number;
}

interface TrendData {
  date_period: string;
  submission_count: number;
  unique_forms: number;
}

interface AnalyticsDashboardProps {
  departmentId: number;
  dateFrom?: string;
  dateTo?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#fbbf24', '#10b981', '#8b5cf6', '#ec4899'];

const StatCard: React.FC<{ title: string; value: number | string; unit?: string; color?: string }> = ({
  title,
  value,
  unit = '',
  color = 'bg-blue-50'
}) => (
  <div className={`${color} rounded-lg p-6 shadow-sm border border-gray-200`}>
    <p className="text-sm text-gray-600 mb-2">{title}</p>
    <p className="text-2xl font-bold text-gray-900">
      {typeof value === 'number' ? value.toFixed(1) : value}
      <span className="text-lg ml-1">{unit}</span>
    </p>
  </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  departmentId,
  dateFrom,
  dateTo
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [formMetrics, setFormMetrics] = useState<FormMetric[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [period, setPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch dashboard stats
      const statsResponse = await fetch(
        `/api/analytics/dashboard/${departmentId}?${new URLSearchParams({
          ...(dateFrom && { dateFrom }),
          ...(dateTo && { dateTo })
        })}`,
        { headers }
      );

      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats');
      const statsData = await statsResponse.json();
      setStats(statsData.data);

      // Fetch trends
      const trendsResponse = await fetch(
        `/api/analytics/trends/${departmentId}?period=${period}`,
        { headers }
      );

      if (!trendsResponse.ok) throw new Error('Failed to fetch trends');
      const trendsData = await trendsResponse.json();
      setTrends(trendsData.data);

      // Fetch form metrics
      const formsResponse = await fetch(
        `/api/analytics/forms/${departmentId}`,
        { headers }
      );

      if (!formsResponse.ok) throw new Error('Failed to fetch form metrics');
      const formsData = await formsResponse.json();
      setFormMetrics(formsData.data);

      // Fetch real-time metrics
      const realtimeResponse = await fetch(
        `/api/analytics/realtime/${departmentId}`,
        { headers }
      );

      if (!realtimeResponse.ok) throw new Error('Failed to fetch real-time metrics');
      const realtimeData = await realtimeResponse.json();
      setRealTimeMetrics(realtimeData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [departmentId, dateFrom, dateTo, period]);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) return <LoadingSpinner />;

  const statusDistribution = stats ? [
    { name: 'Completed', value: stats.completedResponses, color: '#10b981' },
    { name: 'Pending', value: stats.pendingResponses, color: '#fbbf24' },
    { name: 'Rejected', value: stats.rejectedResponses, color: '#ef4444' }
  ].filter(item => item.value > 0) : [];

  const formChartData = formMetrics.slice(0, 10).map(form => ({
    name: form.name.substring(0, 15),
    completionRate: parseFloat(form.completion_rate?.toString() || '0'),
    responses: form.total_responses
  }));

  return (
    <div className="space-y-6 p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('forms')}
          className={`px-4 py-2 font-medium ${activeTab === 'forms' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Forms Performance
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-4 py-2 font-medium ${activeTab === 'trends' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
        >
          Trends
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* KPI Cards - Real Time */}
          {realTimeMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <StatCard
                title="Today's Submissions"
                value={realTimeMetrics.todaySubmissions}
                color="bg-blue-100"
              />
              <StatCard
                title="Today's Completed"
                value={realTimeMetrics.todayCompleted}
                color="bg-green-100"
              />
              <StatCard
                title="Pending Today"
                value={realTimeMetrics.todayPending}
                color="bg-yellow-100"
              />
              <StatCard
                title="Active Users"
                value={realTimeMetrics.activeUsersToday}
                color="bg-purple-100"
              />
            </div>
          )}

          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Forms"
              value={stats.totalForms}
              color="bg-blue-50"
            />
            <StatCard
              title="Total Responses"
              value={stats.totalResponses}
              color="bg-indigo-50"
            />
            <StatCard
              title="Avg Response Time"
              value={stats.avgResponseTime}
              unit="hrs"
              color="bg-purple-50"
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              title="Completion Rate"
              value={stats.completionRate}
              unit="%"
              color="bg-green-50"
            />
            <StatCard
              title="Rejection Rate"
              value={stats.rejectionRate}
              unit="%"
              color="bg-red-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Response Time Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed (< 24h)</span>
                  <span className="font-semibold text-green-600">{stats.completedResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-600">{stats.pendingResponses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-600">{stats.rejectedResponses}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Avg Time to Complete</span>
                    <span className="font-bold text-gray-900">{stats.avgResponseTime.toFixed(1)} hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === 'forms' && formMetrics.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={formChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" label={{ value: 'Completion %', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Responses', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
              <Bar yAxisId="right" dataKey="responses" fill="#3b82f6" name="Total Responses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && trends.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date_period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="submission_count"
                stroke="#3b82f6"
                name="Submissions"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="unique_forms"
                stroke="#10b981"
                name="Unique Forms"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
