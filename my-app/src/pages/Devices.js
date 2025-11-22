import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { devicesAPI } from '../services/api';
import { FiMonitor, FiWifi, FiWifiOff, FiRefreshCw, FiSearch, FiX, FiAlertCircle, FiClock, FiPlus, FiTerminal } from 'react-icons/fi';
import Terminal from '../components/Terminal/Terminal';

// Get resolved alerts from localStorage
const getResolvedAlerts = () => {
  try {
    const resolved = localStorage.getItem('resolvedAlerts');
    return resolved ? JSON.parse(resolved) : [];
  } catch {
    return [];
  }
};

// Calculate alert count for a device based on unresolved alerts
const calculateDeviceAlertCount = (deviceName) => {
  const resolvedAlerts = getResolvedAlerts();
  // Mock alerts data - must match the alerts in Alerts.js
  const mockAlerts = [
    { id: 1, device: 'PC-001' },
    { id: 2, device: 'PC-015' },
    { id: 3, device: 'PC-023' },
  ];
  
  // Count unresolved alerts for this device
  return mockAlerts.filter(
    (alert) => alert.device === deviceName && !resolvedAlerts.includes(alert.id)
  ).length;
};

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalDevice, setTerminalDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    ip: '',
    os: '',
    status: 'online',
  });

  const fetchDevices = useCallback(async () => {
    try {
      const response = await devicesAPI.getAll();
      setDevices(response.data);
    } catch (error) {
      console.error('Error fetching devices:', error);
      // Mock data for development
      const mockDevices = [
        {
          id: 1,
          name: 'PC-001',
          ip: '192.168.1.101',
          status: 'online',
          lastSeen: new Date().toISOString(),
          os: 'Windows 10',
          alerts: 3,
        },
        {
          id: 2,
          name: 'PC-015',
          ip: '192.168.1.115',
          status: 'online',
          lastSeen: new Date(Date.now() - 120000).toISOString(),
          os: 'Windows 11',
          alerts: 1,
        },
        {
          id: 3,
          name: 'PC-023',
          ip: '192.168.1.123',
          status: 'offline',
          lastSeen: new Date(Date.now() - 3600000).toISOString(),
          os: 'Windows 10',
          alerts: 5,
        },
      ];
      
      // Update alert counts based on resolved alerts
      const devicesWithUpdatedAlerts = mockDevices.map((device) => ({
        ...device,
        alerts: calculateDeviceAlertCount(device.name),
      }));
      
      setDevices(devicesWithUpdatedAlerts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    // Listen for storage changes to update when alerts are resolved
    const handleStorageChange = () => {
      fetchDevices();
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check periodically (for same-tab updates)
    const interval = setInterval(fetchDevices, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchDevices]);

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip.includes(searchTerm)
  );

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      // Try to call the API first
      try {
        const response = await devicesAPI.create(newDevice);
        const deviceToAdd = response.data;
        setDevices((prevDevices) => [...prevDevices, deviceToAdd]);
      } catch (apiError) {
        // If API fails, use mock data (for development)
        console.warn('API unavailable, using mock data:', apiError);
        const deviceToAdd = {
          id: Date.now(), // Simple ID generation
          ...newDevice,
          lastSeen: new Date().toISOString(),
          alerts: calculateDeviceAlertCount(newDevice.name),
        };
        setDevices((prevDevices) => [...prevDevices, deviceToAdd]);
      }
      
      setShowAddModal(false);
      setNewDevice({
        name: '',
        ip: '',
        os: '',
        status: 'online',
      });
    } catch (error) {
      console.error('Error adding device:', error);
      alert('Failed to add device. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'online') {
      return (
        <span className="px-2 py-1 bg-success-100 text-success-800 text-xs font-medium rounded-full flex items-center space-x-1">
          <FiWifi className="w-3 h-3" />
          <span>Online</span>
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full flex items-center space-x-1">
        <FiWifiOff className="w-3 h-3" />
        <span>Offline</span>
      </span>
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600 mt-1">Monitor all network endpoints</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDevices}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search devices by name or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  OS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alerts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Seen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No devices found
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiMonitor className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{device.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {device.os}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(device.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {device.alerts > 0 ? (
                        <span className="px-2 py-1 bg-danger-100 text-danger-800 text-xs font-medium rounded-full">
                          {device.alerts}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(device.lastSeen).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowDetails(true);
                          }}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => {
                            setTerminalDevice(device);
                            setShowTerminal(true);
                          }}
                          className="flex items-center space-x-1 text-success-600 hover:text-success-700 font-medium"
                          title="Connect via Terminal"
                        >
                          <FiTerminal className="w-4 h-4" />
                          <span>Connect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Details Modal */}
      {showDetails && selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Device Details</h2>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedDevice(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <FiMonitor className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedDevice.name}</h3>
                  <p className="text-gray-500">{selectedDevice.ip}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Operating System</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDevice.os}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedDevice.status)}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">IP Address</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedDevice.ip}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">Active Alerts</p>
                  <div className="mt-1">
                    {selectedDevice.alerts > 0 ? (
                      <span className="px-3 py-1 bg-danger-100 text-danger-800 text-sm font-medium rounded-full flex items-center space-x-1 w-fit">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{selectedDevice.alerts} Alert{selectedDevice.alerts !== 1 ? 's' : ''}</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">No alerts</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiClock className="w-5 h-5" />
                  <div>
                    <p className="text-sm text-gray-500">Last Seen</p>
                    <p className="font-medium">{new Date(selectedDevice.lastSeen).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {selectedDevice.alerts > 0 && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-danger-800">
                    <FiAlertCircle className="w-5 h-5" />
                    <p className="font-medium">
                      This device has {selectedDevice.alerts} active alert{selectedDevice.alerts !== 1 ? 's' : ''}. 
                      <Link to="/alerts" className="ml-2 underline hover:text-danger-900">
                        View Alerts →
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setTerminalDevice(selectedDevice);
                    setShowTerminal(true);
                    setShowDetails(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
                >
                  <FiTerminal className="w-5 h-5" />
                  <span>Connect via Terminal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Add New Device</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewDevice({
                    name: '',
                    ip: '',
                    os: '',
                    status: 'online',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Name *
                </label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., PC-001"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Address *
                </label>
                <input
                  type="text"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 192.168.1.101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Operating System *
                </label>
                <input
                  type="text"
                  value={newDevice.os}
                  onChange={(e) => setNewDevice({ ...newDevice, os: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Windows 10, Windows 11, Linux"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={newDevice.status}
                  onChange={(e) => setNewDevice({ ...newDevice, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDevice({
                      name: '',
                      ip: '',
                      os: '',
                      status: 'online',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Terminal Modal */}
      {showTerminal && terminalDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FiTerminal className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">
                  Terminal - {terminalDevice.name} ({terminalDevice.ip})
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowTerminal(false);
                  setTerminalDevice(null);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-hidden">
              <Terminal
                device={terminalDevice}
                onClose={() => {
                  setShowTerminal(false);
                  setTerminalDevice(null);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices;

