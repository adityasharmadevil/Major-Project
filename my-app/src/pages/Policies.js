import React, { useState, useEffect } from 'react';
import { policiesAPI, devicesAPI } from '../services/api';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: {
      blockUnauthorizedApps: false,
      blockUSB: false,
      requireAntivirus: false,
      blockInternetAccess: false,
      monitorFileChanges: false,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [policiesRes, devicesRes] = await Promise.all([
        policiesAPI.getAll(),
        devicesAPI.getAll(),
      ]);
      setPolicies(policiesRes.data);
      setDevices(devicesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mock data
      setPolicies([
        {
          id: 1,
          name: 'Standard Security Policy',
          description: 'Basic security rules for all devices',
          rules: {
            blockUnauthorizedApps: true,
            blockUSB: false,
            requireAntivirus: true,
            blockInternetAccess: false,
            monitorFileChanges: true,
          },
          active: true,
          deployedDevices: 25,
        },
        {
          id: 2,
          name: 'Strict Security Policy',
          description: 'Enhanced security for sensitive systems',
          rules: {
            blockUnauthorizedApps: true,
            blockUSB: true,
            requireAntivirus: true,
            blockInternetAccess: false,
            monitorFileChanges: true,
          },
          active: true,
          deployedDevices: 10,
        },
      ]);
      setDevices([
        { id: 1, name: 'PC-001' },
        { id: 2, name: 'PC-015' },
        { id: 3, name: 'PC-023' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await policiesAPI.update(editingPolicy.id, formData);
      } else {
        await policiesAPI.create(formData);
      }
      setShowModal(false);
      setEditingPolicy(null);
      setFormData({
        name: '',
        description: '',
        rules: {
          blockUnauthorizedApps: false,
          blockUSB: false,
          requireAntivirus: false,
          blockInternetAccess: false,
          monitorFileChanges: false,
        },
      });
      fetchData();
    } catch (error) {
      console.error('Error saving policy:', error);
    }
  };

  const handleEdit = (policy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      rules: policy.rules,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await policiesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  const handleDeploy = async (policyId) => {
    // In a real app, you'd show a device selection modal
    const deviceIds = devices.map((d) => d.id);
    try {
      await policiesAPI.deploy(policyId, deviceIds);
      alert('Policy deployed successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deploying policy:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
          <p className="text-gray-600 mt-1">Manage security policies and rules</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setEditingPolicy(null);
              setFormData({
                name: '',
                description: '',
                rules: {
                  blockUnauthorizedApps: false,
                  blockUSB: false,
                  requireAntivirus: false,
                  blockInternetAccess: false,
                  monitorFileChanges: false,
                },
              });
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Policy</span>
          </button>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-600"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {policy.name}
                </h3>
                <p className="text-sm text-gray-600">{policy.description}</p>
              </div>
              {policy.active ? (
                <span className="px-2 py-1 bg-success-100 text-success-800 text-xs font-medium rounded-full">
                  Active
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  Inactive
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {Object.entries(policy.rules).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2 text-sm">
                  {value ? (
                    <FiCheckCircle className="w-4 h-4 text-success-600" />
                  ) : (
                    <FiXCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                {policy.deployedDevices || 0} devices
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeploy(policy.id)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Deploy
                </button>
                <button
                  onClick={() => handleEdit(policy)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <FiEdit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(policy.id)}
                  className="text-danger-600 hover:text-danger-700"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Security Rules
                </label>
                <div className="space-y-3">
                  {Object.keys(formData.rules).map((key) => (
                    <label
                      key={key}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.rules[key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rules: {
                              ...formData.rules,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPolicy(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingPolicy ? 'Update' : 'Create'} Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;

