import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, X, Edit2, Clock, Check, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { useUserDetails } from '../../hooks/useUserDetails';

import { authService } from '../../firebase/auth';
import Avatar from './Avatar';
import useTaskDetails from '../../hooks/useTaskDetail';

const TaskDetailModal = ({ 
  isOpen, 
  onClose, 
  taskId,
  onTaskUpdate,
  onNoteAdd,
  onStatusChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { taskDetails, loading, error } = useTaskDetails(taskId);
  const { users: assigneeUsers, loading: loadingAssignees } = useUserDetails(taskDetails?.assignees || []);
  const currentUser = authService.getCurrentUser();
  const commentsEndRef = useRef(null);


   // Get comments from either notes or comments array
   const getComments = useCallback(() => {
    return taskDetails?.comments || taskDetails?.notes || [];
  }, [taskDetails]);

  // Reset states when task changes
  useEffect(() => {
    if (taskDetails) {
      setEditedTask(taskDetails);
      // Scroll to bottom if new comment added
      if (activeTab === 'notes' && 
          getComments().length > (editedTask?.comments?.length || editedTask?.notes?.length || 0)) {
        scrollToBottom();
      }
    }
  }, [taskDetails, activeTab, getComments]);

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
    if (!taskId || !currentUser) return;
    try {
      setIsSubmitting(true);
      await onStatusChange(taskId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskId, currentUser, onStatusChange]);

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

  const formatDateTime = (timestamp) => {
    if (!timestamp) return '';
    
    const formatOptions = {
      date: { year: 'numeric', month: 'short', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' }
    };

    let date;
    // Handle Firestore Timestamp
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    }
    // Handle JavaScript Date
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // Handle string date
    else {
      date = new Date(timestamp);
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateStr;
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    } else {
      dateStr = date.toLocaleDateString(undefined, formatOptions.date);
    }

    const timeStr = date.toLocaleTimeString(undefined, formatOptions.time);
    return `${dateStr} at ${timeStr}`;
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
              {formatDateTime(comment.createdAt)}
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
              {formatDateTime(event.createdAt)}
            </span>
          </div>
          <p className="text-sm text-slate-600">{event.description}</p>
        </div>
      </div>
    );
  };

 
  // Updated TabButton for comments count
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
    if (!comment.trim() || isSubmitting || !currentUser?.uid || !taskId) return;

    try {
      setIsSubmitting(true);
      await onNoteAdd(taskId, {
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
    if (isSubmitting || !currentUser?.uid || !taskId) return;

    try {
      setIsSubmitting(true);
      await onTaskUpdate(taskId, {
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

  if (!isOpen || !taskId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
        <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
          <Loader className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="text-slate-600">Loading task details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
        <div className="bg-white p-6 rounded-lg shadow-xl text-red-500">
          Error loading task: {error}
        </div>
      </div>
    );
  }

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
                  value={editedTask?.title || ''}
                  onChange={e => setEditedTask({...editedTask, title: e.target.value})}
                  className="text-xl font-semibold text-slate-800 w-full px-2 py-1 border rounded"
                />
              ) : (
                <h2 className="text-xl font-semibold text-slate-800">{taskDetails?.title || 'Untitled Task'}</h2>
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
                  value={editedTask?.priority || 'medium'}
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
                  ring-1 ring-inset ${priorityStyles[taskDetails?.priority || 'medium']} shadow-sm`}
                >
                  {(taskDetails?.priority || 'medium').charAt(0).toUpperCase() + (taskDetails?.priority || 'medium').slice(1)} Priority
                </span>
              )}

              <select
                value={taskDetails?.status || 'todo'}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-md border"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="done">Done</option>
              </select>

              {taskDetails?.dueDate && (
                <span className="flex items-center text-sm text-slate-500 bg-slate-50/80 
                  px-3 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {taskDetails.dueDate}
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
                count={getComments().length} 
              />
              <TabButton 
                id="history" 
                label="History" 
                icon={Clock} 
                count={taskDetails?.history?.length || 0} 
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
                      {taskDetails?.description || 'No description provided'}
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
                  {getComments().map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                  {getComments().length === 0 && (
                    <p className="text-center text-slate-500">No comments yet</p>
                  )}
                  <div ref={commentsEndRef} /> {/* Scroll anchor */}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {taskDetails?.history?.map((event) => (
                    <HistoryItem key={event.id} event={event} />
                  ))}
                  {(!taskDetails?.history || taskDetails.history.length === 0) && (
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