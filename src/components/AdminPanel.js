import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, LayoutDashboard, Users, FolderKanban, Activity } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './ui/Header';
import { useAuth } from '../context/AuthContext';
import AdminDashboardTab from './admin/AdminDashboardTab';
import AdminUsersTab from './admin/AdminUsersTab';
import AdminProjectsTab from './admin/AdminProjectsTab';
import AdminActivityTab from './admin/AdminActivityTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'users',     label: 'Users',           icon: Users },
  { id: 'projects',  label: 'Projects',        icon: FolderKanban },
  { id: 'activity',  label: 'Activity Logs',   icon: Activity },
];

const AdminPanel = () => {
  const { isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!loading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboardTab />;
      case 'users':     return <AdminUsersTab />;
      case 'projects':  return <AdminProjectsTab />;
      case 'activity':  return <AdminActivityTab />;
      default:          return <AdminDashboardTab />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Admin Panel</h1>
              <p className="text-sm text-slate-500">Manage your workspace</p>
            </div>
          </div>
        </Header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-8">
          <div className="flex space-x-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium
                    border-b-2 transition-all
                    ${selected
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto">
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
