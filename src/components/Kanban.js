import React, { useState } from 'react';
import { User, List, Users, LogOut, Briefcase, MoreVertical, Plus, X, Calendar, AlertTriangle } from 'lucide-react';



const TaskModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignees: [],
    priority: 'medium',
    dueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const assigneeOptions = [
    { id: 'JD', name: 'John Doe', role: 'Frontend Developer' },
    { id: 'AM', name: 'Alice Moore', role: 'UI Designer' },
    { id: 'SK', name: 'Sam King', role: 'Product Manager' },
    { id: 'RB', name: 'Rachel Brown', role: 'Backend Developer' },
    { id: 'MP', name: 'Mike Parker', role: 'QA Engineer' },
    { id: 'EW', name: 'Emma Wilson', role: 'UX Researcher' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-800">Create New Task</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Task Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
                placeholder="Enter task description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Assignees
              </label>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                {assigneeOptions.map((assignee) => (
                  <label 
                    key={assignee.id}
                    className="flex items-center p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      checked={formData.assignees.includes(assignee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            assignees: [...formData.assignees, assignee.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            assignees: formData.assignees.filter(id => id !== assignee.id)
                          });
                        }
                      }}
                    />
                    <div className="ml-3 flex items-center space-x-3">
                      <Avatar 
                        initials={assignee.id}
                        gradientFrom={'blue-500'}
                        gradientTo={'blue-600'}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium text-slate-700">{assignee.name}</div>
                        <div className="text-sm text-slate-500">{assignee.role}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:shadow-md transition-all"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// Sample task data with priorities
const sampleTasks = {
  todo: [
    {
      title: 'Homepage Design',
      description: 'Create main landing page layout and components',
      assignees: ['JD', 'SK'],
      priority: 'high',
      dueDate: '2024-12-20'
    },
    {
      title: 'Feature Implementation',
      description: 'Implement core features for the dashboard',
      assignees: ['JD', 'AM'],
      priority: 'medium',
      dueDate: '2024-12-25'
    },
    {
      title: 'Design System',
      description: 'Create a consistent design system',
      assignees: ['SK'],
      priority: 'low',
      dueDate: '2024-12-28'
    }
  ],
  inProgress: [
    {
      title: 'Navigation Menu',
      description: 'Implement responsive navigation components',
      assignees: ['AM'],
      priority: 'medium',
      dueDate: '2024-12-18'
    },
    {
      title: 'API Integration',
      description: 'Connect frontend with backend services',
      assignees: ['JD', 'SK'],
      priority: 'high',
      dueDate: '2024-12-15'
    }
  ],
  done: [
    {
      title: 'User Research',
      description: 'Analyze user feedback and requirements',
      assignees: ['SK', 'JD'],
      priority: 'medium',
      dueDate: '2024-12-10'
    },
    {
      title: 'Wireframing',
      description: 'Create initial wireframes for approval',
      assignees: ['AM'],
      priority: 'low',
      dueDate: '2024-12-05'
    }
  ]
};

// Task Column Component
const TaskColumn = ({ title, tasks, count }) => {
  return (
    <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-slate-800">{title}</h2>
          <span className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-2.5 py-1 rounded-lg text-sm font-medium">
            {count}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <TaskCard key={index} {...task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Avatar = ({ initials, gradientFrom, gradientTo, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-sm'
  };

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full border-2 border-white flex items-center justify-center font-medium text-white shadow-sm bg-gradient-to-br from-${gradientFrom} to-${gradientTo}`}
    >
      {initials}
    </div>
  );
};

// Add this color palette for avatars at the top level
const AVATAR_COLORS = [
  // Blue shades
  { from: 'blue-500', to: 'blue-600' },
  { from: 'indigo-500', to: 'indigo-600' },
  { from: 'violet-500', to: 'violet-600' },
  // Green shades
  { from: 'emerald-500', to: 'emerald-600' },
  { from: 'teal-500', to: 'teal-600' },
  // Purple/Pink shades
  { from: 'purple-500', to: 'purple-600' },
  { from: 'fuchsia-500', to: 'fuchsia-600' },
  // Warm shades
  { from: 'rose-500', to: 'rose-600' },
  { from: 'orange-500', to: 'orange-600' }
];

// Update the AvatarGroup component to use the color palette
const AvatarGroup = ({ users }) => {

  return (
    <div className="flex -space-x-2">
      {users.map((user, index) => (
        <Avatar 
          key={user}
          initials={user}
          gradientFrom={'blue-500'}
          gradientTo={'blue-600'}
        />
      ))}
    </div>
  );
};

// Update the TaskCard component with enhanced styling
const TaskCard = ({ title, description, assignees, priority, dueDate }) => {
  const priorityStyles = {
    high: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    low: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
  };

  return (
    <div className="group p-5 rounded-xl border border-slate-100 bg-white 
      transition-all duration-300 ease-in-out
      hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] 
      hover:shadow-slate-200/60
      hover:border-slate-200
      hover:translate-y-[-2px]">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-2">
            <span 
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-md inline-flex items-center
                ring-1 ring-inset ${priorityStyles[priority]}
                shadow-sm`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
            {dueDate && (
              <span className="flex items-center text-xs text-slate-500 bg-slate-50/80 
                px-2.5 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {dueDate}
              </span>
            )}
          </div>
          <div className="group-hover:translate-x-0.5 transition-transform duration-300">
            <h3 className="font-medium text-slate-800 mb-1">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
          </div>
        </div>
        <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 
          hover:bg-slate-50 hover:shadow-sm">
          <MoreVertical className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2 hover:space-x-1 transition-all duration-300">
          {assignees.map((initials, idx) => (
            <div
              key={initials}
              className={`w-8 h-8 rounded-full border-2 border-white 
                flex items-center justify-center text-xs font-medium text-white 
                shadow-md transition-transform duration-300
                hover:scale-110 hover:z-10
                bg-gradient-to-br 
                from-${AVATAR_COLORS[0].from} 
                to-${AVATAR_COLORS[0].to}`}
            >
              {initials}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App Component (keeping the same as before, but using sampleTasks as initial state)
const Kanban = () => {
  const [selectedNav, setSelectedNav] = useState('my-tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState(sampleTasks);

  const handleAddTask = (newTask) => {
    setTasks({
      ...tasks,
      todo: [...tasks.todo, newTask]
    });
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
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
            {[
              { icon: List, label: 'My Tasks', id: 'my-tasks' },
              { icon: Briefcase, label: 'Projects', id: 'projects' },
              { icon: Users, label: 'All Tasks', id: 'all-tasks' },
              { icon: User, label: 'Profile', id: 'profile' }
            ].map((item) => (
              <button 
                key={item.id}
                className={`w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedNav === item.id 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedNav(item.id)}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  selectedNav === item.id ? 'text-blue-600' : 'text-slate-400'
                }`} />
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button className="w-full flex items-center px-4 py-3.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
              <LogOut className="w-5 h-5 mr-3 text-slate-400" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Project Header */}
        <header className="bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Website Redesign</h1>
              <p className="text-sm text-slate-500 mt-1">A project by Design Team</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </button>
              <AvatarGroup users={['JD', 'AM', 'SK']} />
            </div>
          </div>
        </header>

        {/* Task Columns */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex gap-8">
            <TaskColumn title="To Do" tasks={tasks.todo} count={tasks.todo.length} />
            <TaskColumn title="In Progress" tasks={tasks.inProgress} count={tasks.inProgress.length} />
            <TaskColumn title="Done" tasks={tasks.done} count={tasks.done.length} />
          </div>
        </main>
      </div>

      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTask}
      />
    </div>
  );
};

export default Kanban;