import React, { useState, useMemo } from 'react';
import {
  Trash2, UserX, UserCheck, Search, X, ChevronDown,
  CheckCircle, BarChart3, Clock, TrendingUp, Activity,
  AlertTriangle, CalendarClock
} from 'lucide-react';
import { useAllUsers } from '../../context/UsersContext';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../firebase/adminService';
import { useMetrics } from '../../hooks/useMetrics';
import Avatar from '../ui/Avatar';
import AppModal from '../ui/AppModal';
import useModal from '../../hooks/useModal';
import { getAvatarColor } from '../../utils';

// Separate component so the useMetrics hook is always called
const UserMetricsPanel = ({ userId }) => {
  const { metrics, loading } = useMetrics(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    );
  }

  const performanceMetrics = [
    { title: 'Tasks Completed',     value: metrics?.tasksCompleted ?? 0,              icon: CheckCircle,  bg: 'bg-emerald-50', text: 'text-emerald-500' },
    { title: 'Completion Rate',     value: `${metrics?.completionRate ?? 0}%`,        icon: BarChart3,    bg: 'bg-blue-50',    text: 'text-blue-500' },
    { title: 'Avg Completion Time', value: `${metrics?.avgCompletionTime ?? 0}d`,     icon: Clock,        bg: 'bg-amber-50',   text: 'text-amber-500' },
    { title: 'On-time Completion',  value: `${metrics?.onTimePercent ?? 0}%`,         icon: TrendingUp,   bg: 'bg-indigo-50',  text: 'text-indigo-500' },
  ];

  const workloadMetrics = [
    { title: 'Active Tasks',  value: metrics?.activeTasks ?? 0,  icon: Activity,       bg: 'bg-blue-50',   text: 'text-blue-500' },
    { title: 'Overdue Tasks', value: metrics?.overdueTasks ?? 0,  icon: AlertTriangle,  bg: 'bg-red-50',    text: 'text-red-500',
      highlight: (metrics?.overdueTasks ?? 0) > 0 ? 'text-red-600' : undefined },
    { title: 'Due This Week', value: metrics?.dueThisWeek ?? 0,  icon: CalendarClock,  bg: 'bg-orange-50', text: 'text-orange-500' },
  ];

  return (
    <div className="px-6 py-5 bg-slate-50 space-y-4">
      {/* Performance */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Performance</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {performanceMetrics.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{m.title}</p>
                  <p className="text-lg font-semibold text-slate-800 mt-0.5">{m.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.text}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workload */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Workload</h4>
        <div className="grid grid-cols-3 gap-3">
          {workloadMetrics.map(m => {
            const Icon = m.icon;
            return (
              <div key={m.title} className="bg-white rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{m.title}</p>
                  <p className={`text-lg font-semibold mt-0.5 ${m.highlight || 'text-slate-800'}`}>{m.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${m.bg}`}>
                  <Icon className={`w-4 h-4 ${m.text}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AdminUsersTab = () => {
  const { users, loading } = useAllUsers();
  const { userData: currentAdmin } = useAuth();
  const { modalState, showModal, hideModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(u =>
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setIsProcessing(true);
      await adminService.updateUserRole(userId, newRole);
    } catch (err) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to update role: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
    try {
      setIsProcessing(true);
      await adminService.toggleUserStatus(userId, newStatus);
    } catch (err) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to update status: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!confirmAction?.userId) return;
    try {
      setIsProcessing(true);
      await adminService.removeUser(confirmAction.userId);
      setConfirmAction(null);
    } catch (err) {
      showModal({ type: 'error', title: 'Error', message: 'Failed to remove user: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (userId) => {
    setExpandedUserId(prev => prev === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-gradient-to-r from-blue-50 to-blue-100
            border border-blue-200 rounded-lg text-sm text-slate-600 placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="w-8 px-4 py-4" />
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Joined</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => {
                const isSelf = user.id === currentAdmin?.id;
                const isDeactivated = user.status === 'deactivated';
                const isExpanded = expandedUserId === user.id;
                return (
                  <React.Fragment key={user.id}>
                    <tr
                      onClick={() => toggleExpand(user.id)}
                      className={`cursor-pointer transition-colors
                        ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-slate-50'}
                        ${isDeactivated ? 'opacity-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            initials={user.initials || '?'}
                            avatarColor={user.avatarColor || getAvatarColor(user.name || '')}
                            size="sm"
                          />
                          <span className="text-sm font-medium text-slate-700">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{user.email}</span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={user.role || 'Team Member'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={isSelf || isProcessing}
                          className="text-sm px-2 py-1 rounded-md border border-slate-200
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Team Member">Team Member</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                          ${isDeactivated
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-600'
                          }`}>
                          {isDeactivated ? 'Deactivated' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">{user.joinDate || '—'}</span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {!isSelf && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(user.id, user.status)}
                                disabled={isProcessing}
                                title={isDeactivated ? 'Reactivate' : 'Deactivate'}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50
                                  ${isDeactivated
                                    ? 'text-emerald-500 hover:bg-emerald-50'
                                    : 'text-amber-500 hover:bg-amber-50'
                                  }`}
                              >
                                {isDeactivated ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setConfirmAction({ type: 'remove', userId: user.id, name: user.name })}
                                disabled={isProcessing}
                                title="Remove user"
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isSelf && (
                            <span className="text-xs text-slate-400 italic">You</span>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Metrics Row */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <UserMetricsPanel userId={user.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            {searchTerm ? `No users matching "${searchTerm}"` : 'No users found'}
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full m-3">
            <div className="text-center">
              <Trash2 className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Remove User</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to remove <strong>{confirmAction.name}</strong>? This will delete their profile data.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                disabled={isProcessing}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Removing...' : 'Remove User'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default AdminUsersTab;
