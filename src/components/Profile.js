import React, { useState, useEffect } from 'react';
import {
  Mail, Calendar, CheckCircle, Activity, Clock, Palette, LogOut,
  TrendingUp, AlertTriangle, CalendarClock, BarChart3, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './ui/Header';
import { AVATAR_COLOR_MAP, getInitials } from '../utils';
import { useAuth } from '../context/AuthContext';
import { authService } from '../firebase/auth';
import { useMetrics } from '../hooks/useMetrics';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData, loading: userLoading, error: userError, updateUserProfile, isAdmin } = useAuth();
  const { metrics, loading: metricsLoading } = useMetrics(userData?.id);
  const [selectedColorId, setSelectedColorId] = useState(userData?.avatarColor || 'teal');

  useEffect(() => {
    if (userData?.avatarColor) setSelectedColorId(userData.avatarColor);
  }, [userData?.avatarColor]);

  const handleColorChange = async (colorId) => {
    try {
      setSelectedColorId(colorId);
      await updateUserProfile({ avatarColor: colorId });
    } catch (err) {
      console.error('Failed to update avatar color:', err);
      setSelectedColorId(userData?.avatarColor || 'teal');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-red-500">Error loading profile: {userError}</div>
      </div>
    );
  }

  const selectedColor = AVATAR_COLOR_MAP[selectedColorId];

  const performanceMetrics = [
    {
      title: 'Tasks Completed',
      value: metrics?.tasksCompleted ?? 0,
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      bgIcon: 'bg-emerald-50',
    },
    {
      title: 'Completion Rate',
      value: `${metrics?.completionRate ?? 0}%`,
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
      bgIcon: 'bg-blue-50',
    },
    {
      title: 'Avg Completion Time',
      value: `${metrics?.avgCompletionTime ?? 0}d`,
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      bgIcon: 'bg-amber-50',
    },
    {
      title: 'On-time Completion',
      value: `${metrics?.onTimePercent ?? 0}%`,
      icon: <TrendingUp className="w-5 h-5 text-indigo-500" />,
      bgIcon: 'bg-indigo-50',
    },
  ];

  const workloadMetrics = [
    {
      title: 'Active Tasks',
      value: metrics?.activeTasks ?? 0,
      icon: <Activity className="w-5 h-5 text-blue-500" />,
      bgIcon: 'bg-blue-50',
    },
    {
      title: 'Overdue Tasks',
      value: metrics?.overdueTasks ?? 0,
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      bgIcon: 'bg-red-50',
      highlight: (metrics?.overdueTasks ?? 0) > 0 ? 'text-red-600' : undefined,
    },
    {
      title: 'Due This Week',
      value: metrics?.dueThisWeek ?? 0,
      icon: <CalendarClock className="w-5 h-5 text-orange-500" />,
      bgIcon: 'bg-orange-50',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${selectedColor?.bgClass}
                flex items-center justify-center text-xl font-medium text-white`}>
                {getInitials(userData?.name || '')}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-slate-800">{userData?.name}</h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                      bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 ring-1 ring-amber-200/60 shadow-sm">
                      <Shield className="w-3 h-3" />
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center text-slate-500">
                    <Mail className="w-4 h-4 mr-1.5" />
                    <span className="text-sm">{userData?.email}</span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    <span className="text-sm">Joined {userData?.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-slate-600 hover:text-slate-800
                bg-white hover:bg-slate-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        </Header>

        <main className="flex-1 p-8 space-y-8">
          {/* Avatar Color Picker */}
          <div className="bg-white rounded-[32px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">Avatar Color</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {Object.values(AVATAR_COLOR_MAP).map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  className={`relative p-4 rounded-xl transition-all duration-200
                    ${selectedColorId === color.id ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${color.bgClass} shadow-sm`} />
                    <span className="text-sm text-slate-600">{color.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Performance</h2>
            {metricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric) => (
                  <div key={metric.title} className="bg-white rounded-[32px] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{metric.title}</p>
                        <h3 className="text-2xl font-semibold text-slate-800 mt-1">{metric.value}</h3>
                      </div>
                      <div className={`p-3 rounded-xl ${metric.bgIcon}`}>{metric.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Workload */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Current Workload</h2>
            {metricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {workloadMetrics.map((metric) => (
                  <div key={metric.title} className="bg-white rounded-[32px] p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{metric.title}</p>
                        <h3 className={`text-2xl font-semibold mt-1 ${metric.highlight || 'text-slate-800'}`}>
                          {metric.value}
                        </h3>
                      </div>
                      <div className={`p-3 rounded-xl ${metric.bgIcon}`}>{metric.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
