import React, { useState, useEffect } from 'react';
import { User, List, Users, LogOut, Briefcase, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../firebase/auth';
import { useUser } from '../hooks/useUser';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useUser();
  const [userInitials, setUserInitials] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [selectedNav, setSelectedNav] = useState(() => {
    const path = location.pathname;
    if (path === '/') return 'projects';
    if (path.includes('/my-tasks')) return 'tasks';
    if (path.includes('/all')) return 'all-tasks';
    return path.substring(1);
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.displayName) {
      const initials = user.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
      setUserInitials(initials);
    }
  }, []);

  const handleNavClick = (navId, path) => {
    setSelectedNav(navId);
    
    // If there's a current project and we're navigating to tasks
    if (userData?.currentProject && (navId === 'tasks' || navId === 'all-tasks')) {
      navigate(navId === 'tasks' 
        ? `/tasks/${userData.currentProject}/my-tasks`
        : `/tasks/${userData.currentProject}/all`
      );
    } else if (navId === 'projects') {
      navigate('/');
    } else if (navId === 'profile') {
      navigate('/profile');
    } else if (!userData?.currentProject && (navId === 'tasks' || navId === 'all-tasks')) {
      // If no project is selected, navigate to projects page
      navigate('/');
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Helper function to check if a path is active
  const isPathActive = (navId) => {
    if (navId === 'tasks' && location.pathname.includes('/my-tasks')) return true;
    if (navId === 'all-tasks' && location.pathname.includes('/all')) return true;
    if (navId === 'projects' && location.pathname === '/') return true;
    if (navId === 'profile' && location.pathname === '/profile') return true;
    return false;
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
              isPathActive('tasks')
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('tasks')}
          >
            <List
              className={`w-5 h-5 mr-3 transition-colors ${
                isPathActive('tasks') ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            My Tasks
          </button>

          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isPathActive('all-tasks')
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('all-tasks')}
          >
            <LayoutGrid
              className={`w-5 h-5 mr-3 transition-colors ${
                isPathActive('all-tasks') ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            All Tasks
          </button>

          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isPathActive('projects')
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('projects')}
          >
            <Briefcase
              className={`w-5 h-5 mr-3 transition-colors ${
                isPathActive('projects') ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            Projects
          </button>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
          <button
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isPathActive('profile')
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => handleNavClick('profile')}
          >
            <User
              className={`w-5 h-5 mr-3 transition-colors ${
                isPathActive('profile') ? 'text-blue-600' : 'text-slate-400'
              }`}
            />
            My Profile
          </button>
          
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium 
              text-slate-600 hover:bg-slate-50 transition-all
              ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <LogOut className={`w-5 h-5 mr-3 ${isLoggingOut ? 'text-slate-300' : 'text-slate-400'}`} />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;