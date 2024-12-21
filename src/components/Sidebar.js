import React, { useState } from 'react';
import { User, List, Users, LogOut, Briefcase, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNav, setSelectedNav] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 'projects';
    return path.substring(1);
  });

  const handleNavClick = (navId, path) => {
    setSelectedNav(navId);
    navigate(path);
  };

  return (
    <div className="w-72 bg-white shadow-lg">
      {/* Logo Panel */}
      <div className="p-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
            <List className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TaskApp
          </span>
        </div>
      </div>
      
      <nav className="px-4 mt-6">
        <div className="space-y-2">
          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedNav === 'tasks'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('tasks', '/tasks')}
          >
            <List
              className={`w-5 h-5 mr-3 transition-colors ${
                selectedNav === 'tasks' ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            My Tasks
          </button>

          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedNav === 'all-tasks'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('all-tasks', '/tasks')}
          >
            <LayoutGrid
              className={`w-5 h-5 mr-3 transition-colors ${
                selectedNav === 'all-tasks' ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            All Tasks
          </button>

          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedNav === 'projects'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('projects', '/')}
          >
            <Briefcase
              className={`w-5 h-5 mr-3 transition-colors ${
                selectedNav === 'projects' ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            Projects
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedNav === 'profile'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('profile', '/profile')}
          >
            <User
              className={`w-5 h-5 mr-3 transition-colors ${
                selectedNav === 'profile' ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            My Profile
          </button>
          
          <button className="w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            <LogOut className="w-5 h-5 mr-3 text-slate-400" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;