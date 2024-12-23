import React, { useState } from 'react';
import { Mail, Calendar, CheckCircle, Activity, Clock, Palette } from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './ui/Header';
import ProjectCard from './ui/ProjectCards';
import TaskCard from './ui/TaskCard';
import { AVATAR_COLOR_MAP } from '../utils';


const ProfilePage = () => {
  const [selectedColorId, setSelectedColorId] = useState("teal");

const selectedColor = AVATAR_COLOR_MAP[selectedColorId];

  
  // Rest of your existing user data...
  const userData = {
    name: "John Doe",
    initials: "JD",
    role: "Senior Frontend Developer",
    email: "john.doe@company.com",
    joinDate: "March 2023",
  };

  const metrics = [
    {
      title: "Tasks Completed",
      value: "147",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />
    },
    {
      title: "Active Projects",
      value: "5",
      icon: <Activity className="w-5 h-5 text-blue-500" />
    },
    {
      title: "Avg Response Time",
      value: "2.3d",
      icon: <Clock className="w-5 h-5 text-amber-500" />
    }
  ];

   // Sample active projects
   const activeProjects = [
    {
      id: 1,
      title: "Website Redesign",
      description: "Complete overhaul of the company's main website with modern design principles",
      progress: 75,
      metricsDescription: "15/20 tasks",
      daysLeft: "7 days",
      category: "design",
      team: ["JD", "AM", "SK"],
    },
    {
        id: 1,
        title: "Website Redesign",
        description: "Complete overhaul of the company's main website with modern design principles",
        progress: 75,
        metricsDescription: "15/20 tasks",
        daysLeft: "7 days",
        category: "design",
        team: ["JD", "AM", "SK"],
      },
    {
      id: 2,
      title: "Mobile App Development",
      description: "Building a cross-platform mobile application for customer engagement",
      progress: 45,
      metricsDescription: "9/20 tasks",
      daysLeft: "14 days",
      category: "development",
      team: ["JD", "RB"],
    }
  ];

  // Sample recent tasks
  const recentTasks = [
    {
      id: 1,
      title: "Design System Implementation",
      description: "Implement the new design system components across the platform",
      priority: "high",
      dueDate: "2024-12-20",
      assignees: ["JD", "SK"],
      columnId: "inProgress"
    },
    {
      id: 2,
      title: "User Authentication Flow",
      description: "Update the authentication flow with new security measures",
      priority: "medium",
      dueDate: "2024-12-25",
      assignees: ["JD"],
      columnId: "todo"
    }
  ];
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <Header>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${selectedColor.bgClass}
              flex items-center justify-center text-xl font-medium text-white`}>
              {userData.initials}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">{userData.name}</h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center text-slate-500">
                  <Mail className="w-4 h-4 mr-1.5" />
                  <span className="text-sm">{userData.email}</span>
                </div>
                <div className="flex items-center text-slate-500">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  <span className="text-sm">Joined {userData.joinDate}</span>
                </div>
              </div>
            </div>
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
      onClick={() => setSelectedColorId(color.id)}
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
            {metrics.map((metric, index) => (
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

          {/* Active Projects */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Active Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {activeProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={() => {}}
                  onClose={() => {}}
                />
              ))}
            </div>
          </div>

          {/* Recent Tasks */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Tasks</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  {...task}
                  onDelete={() => {}}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;