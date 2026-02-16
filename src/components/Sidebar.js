import React, { useState } from 'react';
import { User, List, LogOut, Briefcase, LayoutGrid, Shield } from 'lucide-react';
import irpcLogo from '../irpcLogo.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, isAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavClick = (navId) => {
    if (navId === 'projects') { navigate('/'); return; }
    if (navId === 'profile')  { navigate('/profile'); return; }
    if (navId === 'admin')    { navigate('/admin'); return; }
    if (navId === 'tasks' || navId === 'all-tasks') {
      if (userData?.currentProject) {
        navigate(navId === 'tasks'
          ? `/tasks/${userData.currentProject}/my-tasks`
          : `/tasks/${userData.currentProject}/all`
        );
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (navId) => {
    if (navId === 'tasks'     && location.pathname.includes('/my-tasks')) return true;
    if (navId === 'all-tasks' && location.pathname.includes('/all'))      return true;
    if (navId === 'projects'  && location.pathname === '/')               return true;
    if (navId === 'profile'   && location.pathname === '/profile')        return true;
    if (navId === 'admin'     && location.pathname === '/admin')          return true;
    return false;
  };

  const navBtn = (navId, Icon, label) => (
    <button
      key={navId}
      onClick={() => handleNavClick(navId)}
      className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive(navId)
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
          : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive(navId) ? 'text-blue-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="w-72 bg-white shadow-lg">
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50
          border border-blue-100/60 rounded-2xl px-4 py-3
          shadow-[0_2px_12px_-2px_rgba(59,130,246,0.15)]">
          <img src={irpcLogo} alt="IRPC Logo" className="w-12 h-12 rounded-xl object-contain flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent leading-tight">
              TaskApp
            </span>
            <span className="text-[10px] font-medium text-slate-400 tracking-widest uppercase">by IRPC</span>
          </div>
        </div>
      </div>

      <nav className="px-4 mt-6">
        <div className="space-y-2">
          {navBtn('tasks',     List,       'My Tasks')}
          {navBtn('all-tasks', LayoutGrid, 'All Tasks')}
          {navBtn('projects',  Briefcase,  'Projects')}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
          {isAdmin && navBtn('admin', Shield, 'Admin Panel')}
          {navBtn('profile', User, 'My Profile')}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium
              text-slate-600 hover:bg-slate-50 transition-all
              ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <LogOut className={`w-5 h-5 mr-3 ${isLoggingOut ? 'text-slate-300' : 'text-slate-400'}`} />
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
