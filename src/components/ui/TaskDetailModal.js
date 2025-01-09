// src/components/ui/TaskDetailModal.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, X, Edit2, Clock, Check, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { useUserDetails } from '../../hooks/useUserDetails';
import { authService } from '../../firebase/auth';
import Avatar from './Avatar';

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  task,
  onTaskUpdate,
  onNoteAdd,
  onStatusChange,
  isLoading = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { users: assigneeUsers, loading: loadingAssignees } = useUserDetails(task?.assignees || []);
  const currentUser = authService.getCurrentUser();
  const commentsEndRef = useRef(null);

  // Reset states when task changes
  useEffect(() => {
    if (task) {
      setEditedTask(task);
      // Scroll to bottom if new comment added
      if (activeTab === 'notes' && 
          task.comments?.length > (editedTask?.comments?.length || 0)) {
        scrollToBottom();
      }
    }
  }, [task, activeTab]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

  const handleStatusChange = useCallback(async (newStatus) => {
    if (!task?.id || !currentUser) return;
    try {
      setIsSubmitting(true);
      await onStatusChange(task.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [task?.id, currentUser, onStatusChange]);

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
              avatarColor={user.avatarColor || getAvatarColor(user.initials)}
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

  const CommentItem = ({ comment }) => {
    const { users, loading } = useUserDetails([comment.createdBy]);
    const user = users[0];
  
    if (loading) {
      return (
        <div className="p-4 rounded-lg bg-slate-50 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-slate-200 rounded" />
              <div className="w-32 h-3 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="ml-10 w-full h-4 bg-slate-200 rounded mt-2" />
        </div>
      );
    }
  
    return (
      <div className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <Avatar
            initials={user?.initials || '??'}
            avatarColor={user?.avatarColor || getAvatarColor(user?.name || 'XX')}
            size="sm"
          />
          <div>
            <span className="text-sm font-medium text-slate-700">
              {user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-slate-500 ml-2">
              {comment.createdAt?.toDate().toLocaleString()}
            </span>
          </div>
        </div>
        <p className="text-sm text-slate-600 whitespace-pre-wrap ml-10">
          {comment.content}
        </p>
      </div>
    );
  };

  const HistoryItem = ({ event }) => {
    const { users, loading } = useUserDetails([event.createdBy]);
    const user = users[0];
  
    if (loading) {
      return (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-24 h-4 bg-slate-200 rounded" />
              <div className="w-32 h-3 bg-slate-200 rounded" />
            </div>
            <div className="w-full h-4 bg-slate-200 rounded" />
          </div>
        </div>
      );
    }
  
    return (
      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
        <Avatar
          initials={user?.initials || '??'}
          avatarColor={user?.avatarColor || getAvatarColor(user?.name || 'XX')}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">
              {user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-slate-500">
              {event.createdAt?.toDate().toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-slate-600">{event.description}</p>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors
        ${activeTab === id 
          ? 'bg-slate-100 text-slate-800' 
          : 'text-slate-600 hover:bg-slate-50'}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && (
        <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
          {count}
        </span>
      )}
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

  const handleCommentSubmit = async () => {
    if (!comment.trim() || isSubmitting || !currentUser?.uid || !task?.id) return;

    try {
      setIsSubmitting(true);
      await onNoteAdd(task.id, {
        content: comment.trim(),
      });
      setComment('');
      // Scroll will happen automatically due to useEffect
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    if (isSubmitting || !currentUser?.uid || !task?.id) return;

    try {
      setIsSubmitting(true);
      await onTaskUpdate(task.id, {
        title: editedTask.title,
        description: editedTask.description,
        priority: editedTask.priority,
        dueDate: editedTask.dueDate
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-slate-600">Loading task details...</span>
        </div>
      </div>
    );
  }

  // Sort comments and history by date
  const sortedComments = task.comments?.slice().sort((a, b) => 
    b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime()
  ) || [];

  const sortedHistory = task.history?.slice().sort((a, b) => 
    b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime()
  ) || [];

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
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 disabled:opacity-50"
                >
                  {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 disabled:opacity-50"
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
                  disabled={isSubmitting}
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

              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-md border"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>

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
              <TabButton 
                id="notes" 
                label="Comments" 
                icon={MessageSquare} 
                count={task.comments?.length || 0} 
              />
              <TabButton 
                id="history" 
                label="History" 
                icon={Clock} 
                count={task.history?.length || 0} 
              />
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
                      disabled={isSubmitting}
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
                {/* Comment Input */}
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add your comment here..."
                    className="w-full px-3 py-2 border rounded-lg text-slate-600 min-h-[100px]"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={isSubmitting || !comment.trim()}
                    className="px-4 py-2 text-sm font-medium text-white 
                      bg-blue-600 hover:bg-blue-700 rounded-lg 
                      transition-colors duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto comments-container">
                  {sortedComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {(!task.comments || task.comments.length === 0) && (
                    <p className="text-center text-slate-500">No comments yet</p>
                  )}
                  <div ref={commentsEndRef} /> {/* Scroll anchor */}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {sortedHistory.map((event) => (
                    <HistoryItem key={event.id} event={event} />
                  ))}
                  {(!task.history || task.history.length === 0) && (
                    <p className="text-center text-slate-500">No history available</p>
                  )}
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
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-blue-600 hover:bg-blue-700 
                    rounded-lg transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={onClose}
                disabled={isSubmitting}
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