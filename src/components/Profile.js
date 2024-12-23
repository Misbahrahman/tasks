// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, Activity, Clock, Palette, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './ui/Header';
import { AVATAR_COLOR_MAP } from '../utils';
import { useUser, useUserMetrics } from '../hooks/useUser';
import { authService } from '../firebase/auth';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userData, loading: userLoading, error: userError, updateUserProfile } = useUser();
  const { metrics } = useUserMetrics(userData?.id);
  const [selectedColorId, setSelectedColorId] = useState(userData?.avatarColor || "teal");

  useEffect(() => {
    if (userData?.avatarColor) {
      setSelectedColorId(userData.avatarColor);
    }
  }, [userData]);

  const handleColorChange = async (colorId) => {
    try {
      setSelectedColorId(colorId);
      await updateUserProfile({ avatarColor: colorId });
    } catch (error) {
      console.error('Failed to update avatar color:', error);
      // Revert to previous color on error
      setSelectedColorId(userData?.avatarColor || "teal");
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  const metricsData = [
    {
      title: "Tasks Completed",
      value: metrics?.tasksCompleted || "0",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    },
    {
      title: "Active Projects",
      value: metrics?.activeProjects || "0",
      icon: <Activity className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Avg Response Time",
      value: metrics?.avgResponseTime || "0d",
      icon: <Clock className="w-5 h-5 text-amber-500" />
    }
  ];

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  console.log(selectedColor);
  

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
                <h1 className="text-2xl font-semibold text-slate-800">{userData?.name}</h1>
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
          {/* Color Picker Section */}
          <div className="bg-white rounded-[32px] p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-800">Avatar Color</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.values(AVATAR_COLOR_MAP).map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorChange(color.id)}
                  className={`relative p-4 rounded-xl transition-all duration-200 
                    ${selectedColorId === color.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2' 
                      : 'hover:bg-slate-50'}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${color.bgClass} shadow-sm`} />
                    <span className="text-sm text-slate-600">{color.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metricsData.map((metric, index) => (
              <div key={index} className="bg-white rounded-[32px] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{metric.title}</p>
                    <h3 className="text-2xl font-semibold text-slate-800 mt-1">
                      {metric.value}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    {metric.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Active Projects and Recent Tasks sections can be updated similarly */}
          {/* We'll implement these in the next step */}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;