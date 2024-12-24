// src/components/TaskDetailModal.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, X, Edit2, Clock, Check, MessageSquare, AlertCircle } from 'lucide-react';
import { useUserDetails } from '../../hooks/useUserDetails';
import Avatar from './Avatar';


const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const { users: assigneeUsers, loading: loadingAssignees } = useUserDetails(task?.assignees || []);

  const [taskNotes, setTaskNotes] = useState([
    { timestamp: '2024-03-23 02:30 PM', user: 'JD', content: 'Initial project setup completed' },
    { timestamp: '2024-03-23 04:15 PM', user: 'AM', content: 'Added documentation for the API endpoints' }
  ]);

  const [taskHistory, setTaskHistory] = useState([
    { type: 'created', timestamp: '2024-03-23 10:00 AM', user: 'JD', details: 'Task created' },
    { type: 'updated', timestamp: '2024-03-23 02:30 PM', user: 'AM', details: 'Changed priority from Medium to High' },
    { type: 'updated', timestamp: '2024-03-23 04:15 PM', user: 'JD', details: 'Updated task description' }
  ]);

  const priorityStyles = {
    high: "bg-rose-50 text-rose-700 ring-rose-600/20",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  };

  const getAvatarColor = (initials) => {
    const colors = ['blue', 'teal', 'cyan', 'indigo', 'fuchsia', 'lime', 'yellow'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Components
  const AssigneesSection = () => {
    if (loadingAssignees) {
      return (
        <div className="flex gap-2">
          {[1, 2].map((n) => (
            <div key={n} className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
          ))}
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        {assigneeUsers.map((user) => (
          <div key={user.id} className="flex flex-col items-center gap-1">
            <Avatar
              initials={user.initials}
              avatarColor={user.avatarColor}
              size="lg"
              className="hover:scale-110 transition-transform duration-300"
            />
            <span className="text-xs text-slate-600 font-medium">
              {user.name || user.initials}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const NoteItem = ({ note }) => (
    <div className="p-4 rounded-lg bg-slate-50">
      <div className="flex items-center gap-3 mb-2">
        <Avatar
          initials={note.user}
          avatarColor={getAvatarColor(note.user)}
          size="sm"
        />
        <div>
          <span className="text-sm font-medium text-slate-700">{note.user}</span>
          <span className="text-xs text-slate-500 ml-2">{note.timestamp}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 whitespace-pre-wrap ml-10">
        {note.content}
      </p>
    </div>
  );

  const HistoryItem = ({ event }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
      <Avatar
        initials={event.user}
        avatarColor={getAvatarColor(event.user)}
        size="sm"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-700">{event.user}</span>
          <span className="text-xs text-slate-500">{event.timestamp}</span>
        </div>
        <p className="text-sm text-slate-600">{event.details}</p>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${activeTab === id 
          ? 'bg-slate-100 text-slate-800' 
          : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  // Event handlers
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleNotesSubmit = () => {
    if (notes.trim()) {
      const timestamp = new Date().toLocaleString();
      const user = 'JD';
      
      setTaskNotes(prev => [...prev, { timestamp, user, content: notes }]);
      setTaskHistory(prev => [...prev, {
        type: 'updated',
        timestamp,
        user,
        details: `Added note: "${notes.length > 50 ? notes.slice(0, 50) + '...' : notes}"`
      }]);
      
      setNotes('');
    }
  };

  const handleSaveChanges = () => {
    setTaskHistory(prev => [...prev, {
      type: 'updated',
      timestamp: new Date().toLocaleString(),
      user: 'JD',
      details: 'Updated task details'
    }]);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-4xl max-h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={e => setEditedTask({...editedTask, title: e.target.value})}
                  className="text-xl font-semibold text-slate-800 w-full px-2 py-1 border rounded"
                />
              ) : (
                <h2 className="text-xl font-semibold text-slate-800">{task.title}</h2>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <select
                  value={editedTask.priority}
                  onChange={e => setEditedTask({...editedTask, priority: e.target.value})}
                  className="text-sm px-3 py-1.5 rounded-md border"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              ) : (
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-md inline-flex items-center
                  ring-1 ring-inset ${priorityStyles[task.priority]} shadow-sm`}
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center text-sm text-slate-500 bg-slate-50/80 
                  px-3 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {task.dueDate}
                </span>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6 py-2 border-b border-slate-200 bg-white">
            <div className="flex gap-2">
              <TabButton id="details" label="Details" icon={AlertCircle} />
              <TabButton id="notes" label="Notes" icon={MessageSquare} />
              <TabButton id="history" label="History" icon={Clock} />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
                  {isEditing ? (
                    <textarea
                      value={editedTask.description}
                      onChange={e => setEditedTask({...editedTask, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-slate-600"
                      rows={4}
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">Assignees</h4>
                  <AssigneesSection />
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-6 space-y-6">
                {/* Notes Input */}
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full px-3 py-2 border rounded-lg text-slate-600 min-h-[100px]"
                  />
                  <button
                    onClick={handleNotesSubmit}
                    className="px-4 py-2 text-sm font-medium text-white 
                      bg-blue-600 hover:bg-blue-700 rounded-lg 
                      transition-colors duration-200"
                  >
                    Add Note
                  </button>
                </div>

                {/* Notes List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {taskNotes.map((note, index) => (
                    <NoteItem key={index} note={note} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {taskHistory.map((event, index) => (
                    <HistoryItem key={index} event={event} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-end gap-3">
              {isEditing && (
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-blue-600 hover:bg-blue-700 
                    rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 
                  bg-white hover:bg-slate-50 
                  border border-slate-200 rounded-lg 
                  transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;