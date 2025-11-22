import React, { useState, useEffect, useCallback } from 'react';
import { dashboardAPI } from '../services/api';
import {
  FiMonitor,
  FiAlertCircle,
  FiCheckCircle,
  FiActivity,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, title, value, subtitle, color, link }) => {
  const content = (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color.replace('border-', 'text-').replace('-600', '-600')}`} />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentAlerts(),
      ]);
      setStats(statsRes.data);
      setRecentAlerts(alertsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for development
      setStats({
        totalDevices: 45,
        activeDevices: 38,
        totalAlerts: 127,
        criticalAlerts: 12,
        resolvedAlerts: 89,
      });
      setRecentAlerts([
        {
          id: 1,
          device: 'PC-001',
          type: 'Unauthorized Application',
          severity: 'high',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          device: 'PC-015',
          type: 'USB Device Detected',
          severity: 'medium',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 3,
          device: 'PC-023',
          type: 'Antivirus Disabled',
          severity: 'critical',
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-danger-100 text-danger-800 border-danger-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time network security monitoring</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FiMonitor}
          title="Total Devices"
          value={stats.totalDevices}
          subtitle={`${stats.activeDevices} active`}
          color="border-primary-600"
          link="/devices"
        />
        <StatCard
          icon={FiAlertCircle}
          title="Total Alerts"
          value={stats.totalAlerts}
          subtitle={`${stats.criticalAlerts} critical`}
          color="border-danger-600"
          link="/alerts"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Resolved"
          value={stats.resolvedAlerts}
          subtitle="Successfully handled"
          color="border-success-600"
        />
        <StatCard
          icon={FiActivity}
          title="Active Monitoring"
          value={stats.activeDevices}
          subtitle="Devices online"
          color="border-blue-600"
        />
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Alerts</h2>
            <Link
              to="/alerts"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentAlerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent alerts</p>
          ) : (
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.type}</p>
                      <p className="text-sm text-gray-500">
                        {alert.device} • {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

