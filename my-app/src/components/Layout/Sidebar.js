import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiMonitor,
  FiAlertCircle,
  FiFileText,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/devices', icon: FiMonitor, label: 'Devices' },
    { path: '/alerts', icon: FiAlertCircle, label: 'Alerts' },
    { path: '/logs', icon: FiFileText, label: 'Logs' },
    { path: '/policies', icon: FiSettings, label: 'Policies' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">DIDS</h1>
        <p className="text-sm text-gray-400 mt-1">Intrusion Detection System</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

