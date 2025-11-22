import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiUser } from 'react-icons/fi';

const Header = ({ unreadAlerts = 0 }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500">Monitor and manage your network security</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <FiBell className="w-6 h-6" />
              {unreadAlerts > 0 && (
                <span className="absolute top-0 right-0 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

