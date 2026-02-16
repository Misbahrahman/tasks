import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Calendar, X, Edit2, Clock, Check, MessageSquare, AlertCircle, Loader } from 'lucide-react';
import { authService } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useAllUsers } from '../../context/UsersContext';
import Avatar from './Avatar';
import useTaskDetails from '../../hooks/useTaskDetail';
import AppModal from './AppModal';
import useModal from '../../hooks/useModal';

// ─── Module-level sub-components (no re-mounts, no N+1 reads) ─────────────────

const priorityStyles = {
  high: "bg-rose-50 text-rose-700 ring-rose-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
};

const getAvatarColor = (name = '') => {
  const colors = ['blue', 'teal', 'cyan', 'indigo', 'fuchsia', 'lime', 'yellow'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const formatDateTime = (timestamp) => {
  if (!timestamp) return '';
  let date;
  if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
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
    dateStr = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} at ${timeStr}`;
};

const TabButton = ({ id, label, icon: Icon, count, activeTab, setActiveTab }) => (
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

const AssigneesSection = ({ users }) => (
  <div className="flex flex-wrap gap-3">
    {users.map((user) => (
      <div key={user.id} className="flex flex-col items-center gap-1">
        <Avatar
          initials={user.initials}
          avatarColor={user.avatarColor || getAvatarColor(user.name || '')}
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

const CommentItem = ({ comment, user }) => (
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

const HistoryItem = ({ event, user }) => (
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

// ─── Main component ────────────────────────────────────────────────────────────

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
  const currentUser = authService.getCurrentUser();
  const { isAdmin } = useAuth();
  const { getUsersByIds, getUserById } = useAllUsers();
  const { modalState, showModal, hideModal } = useModal();
  const commentsEndRef = useRef(null);

  // Resolve assignees from context (no extra Firestore reads)
  const assigneeUsers = getUsersByIds(taskDetails?.assignees || []);

  const getComments = useCallback(() => {
    return taskDetails?.comments || taskDetails?.notes || [];
  }, [taskDetails]);

  useEffect(() => {
    if (taskDetails) {
      setEditedTask(taskDetails);
    }
  }, [taskDetails]);

  const scrollToBottom = () => {
    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    if (activeTab === 'notes') scrollToBottom();
  }, [taskDetails?.comments, taskDetails?.notes, activeTab]);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (!taskId || !currentUser) return;
    try {
      setIsSubmitting(true);
      await onStatusChange(taskId, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [taskId, currentUser, onStatusChange]);

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
      await onNoteAdd(taskId, { content: comment.trim() });
      setComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
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
        dueDate: editedTask.dueDate,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update task:', err);
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
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editedTask?.title || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-xl font-semibold text-slate-800 w-full px-2 py-1 border rounded"
                />
              ) : (
                <h2 className="text-xl font-semibold text-slate-800">{taskDetails?.title || 'Untitled Task'}</h2>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!isEditing && !isAdmin) {
                      showModal({
                        type: 'error',
                        title: 'Access Denied',
                        message: 'Only admins can edit task details, including due dates. Contact your administrator to request changes.',
                      });
                      return;
                    }
                    if (isEditing) {
                      handleSaveChanges();
                    } else {
                      setIsEditing(true);
                    }
                  }}
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
                  onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
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

              {isEditing ? (
                <div className="flex items-center text-sm bg-white px-3 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  <input
                    type="date"
                    value={editedTask?.dueDate || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                    className="text-sm text-slate-700 border-none outline-none bg-transparent cursor-pointer"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                taskDetails?.dueDate && (
                  <span className="flex items-center text-sm text-slate-500 bg-slate-50/80
                    px-3 py-1.5 rounded-md ring-1 ring-inset ring-slate-200/60 shadow-sm"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Due: {taskDetails.dueDate}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 py-2 border-b border-slate-200 bg-white">
            <div className="flex gap-2">
              <TabButton id="details" label="Details" icon={AlertCircle} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="notes" label="Comments" icon={MessageSquare} count={getComments().length} activeTab={activeTab} setActiveTab={setActiveTab} />
              <TabButton id="history" label="History" icon={Clock} count={taskDetails?.history?.length || 0} activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
                  {isEditing ? (
                    <textarea
                      value={editedTask?.description || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
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
                  <AssigneesSection users={assigneeUsers} />
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-6 space-y-6">
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
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {getComments().map((c) => (
                    <CommentItem key={c.id} comment={c} user={getUserById(c.createdBy)} />
                  ))}
                  {getComments().length === 0 && (
                    <p className="text-center text-slate-500">No comments yet</p>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {taskDetails?.history?.map((event) => (
                    <HistoryItem key={event.id} event={event} user={getUserById(event.createdBy)} />
                  ))}
                  {(!taskDetails?.history || taskDetails.history.length === 0) && (
                    <p className="text-center text-slate-500">No history available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
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

      <AppModal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </div>
  );
};

export default TaskDetailModal;
