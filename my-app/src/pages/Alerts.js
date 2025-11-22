import React, { useState, useEffect, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFilter,
  FiRefreshCw,
  FiSearch,
} from 'react-icons/fi';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get resolved alerts from localStorage
  const getResolvedAlerts = () => {
    try {
      const resolved = localStorage.getItem('resolvedAlerts');
      return resolved ? JSON.parse(resolved) : [];
    } catch {
      return [];
    }
  };

  // Save resolved alert to localStorage
  const saveResolvedAlert = (id) => {
    try {
      const resolved = getResolvedAlerts();
      if (!resolved.includes(id)) {
        resolved.push(id);
        localStorage.setItem('resolvedAlerts', JSON.stringify(resolved));
      }
    } catch (error) {
      console.error('Error saving resolved alert:', error);
    }
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Mock data
      const resolvedAlerts = getResolvedAlerts();
      const mockAlerts = [
        {
          id: 1,
          device: 'PC-001',
          type: 'Unauthorized Application',
          description: 'User attempted to install unauthorized software',
          severity: 'high',
          status: 'open',
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          device: 'PC-015',
          type: 'USB Device Detected',
          description: 'Unauthorized USB device connected',
          severity: 'medium',
          status: 'open',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 3,
          device: 'PC-023',
          type: 'Antivirus Disabled',
          description: 'Antivirus protection was disabled',
          severity: 'critical',
          status: 'resolved',
          timestamp: new Date(Date.now() - 600000).toISOString(),
        },
      ];
      
      // Update status based on localStorage
      const alertsWithStatus = mockAlerts.map((alert) => ({
        ...alert,
        status: resolvedAlerts.includes(alert.id) ? 'resolved' : alert.status,
      }));
      
      setAlerts(alertsWithStatus);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleResolve = async (id) => {
    try {
      await alertsAPI.markAsResolved(id);
      // Save to localStorage for persistence
      saveResolvedAlert(id);
      // Update local state immediately for better UX
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === id ? { ...alert, status: 'resolved' } : alert
        )
      );
      // Trigger storage event to notify other tabs/components
      window.dispatchEvent(new Event('storage'));
      // Refresh to get latest data from backend
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      // Even if API call fails, save to localStorage and update local state for mock data
      saveResolvedAlert(id);
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === id ? { ...alert, status: 'resolved' } : alert
        )
      );
      // Trigger storage event to notify other tabs/components
      window.dispatchEvent(new Event('storage'));
    }
  };

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

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="text-gray-600 mt-1">Security violations and policy breaches</p>
        </div>
        <button
          onClick={fetchAlerts}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400 w-5 h-5" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Alerts</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiAlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No alerts found</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                        alert.severity
                      )}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    {alert.status === 'resolved' && (
                      <span className="px-3 py-1 bg-success-100 text-success-800 text-xs font-medium rounded-full">
                        Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {alert.type}
                  </h3>
                  <p className="text-gray-600 mb-3">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Device: {alert.device}</span>
                    <span>•</span>
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                {alert.status === 'open' && (
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="ml-4 flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                  >
                    <FiCheckCircle className="w-5 h-5" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;

