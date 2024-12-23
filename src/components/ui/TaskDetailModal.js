import React, { useEffect, useState } from 'react';
import { Calendar, X, Edit2, Clock, Check, MessageSquare, AlertCircle } from 'lucide-react';

const TaskDetailModal = ({ isOpen, onClose, task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'notes', 'history'
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
      
      // Add the note to taskNotes
      const newNote = {
        timestamp,
        user,
        content: notes
      };
      setTaskNotes(prev => [...prev, newNote]);
      
      // Add a corresponding entry to taskHistory
      const historyEntry = {
        type: 'updated',
        timestamp,
        user,
        details: `Added note: "${notes.length > 50 ? notes.slice(0, 50) + '...' : notes}"`
      };
      setTaskHistory(prev => [...prev, historyEntry]);
      
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
                  <div className="flex flex-wrap gap-2">
                    {task.assignees.map((initials) => (
                      <div
                        key={initials}
                        className="w-8 h-8 rounded-full flex items-center justify-center 
                          text-xs font-medium text-white shadow-md
                          transition-transform duration-300 hover:scale-110
                          bg-gradient-to-br from-blue-500 to-blue-600"
                      >
                        {initials}
                      </div>
                    ))}
                  </div>
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
                    <div key={index} className="p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          {note.user}
                        </span>
                        <span className="text-xs text-slate-500">
                          {note.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {taskHistory.map((event, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                      <div className="p-2 rounded-full bg-white shadow-sm">
                        {event.type === 'created' && <Clock className="w-4 h-4 text-blue-500" />}
                        {event.type === 'updated' && <Edit2 className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-700">
                            {event.user}
                          </span>
                          <span className="text-xs text-slate-500">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {event.details}
                        </p>
                      </div>
                    </div>
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