import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAllUsers } from '../../context/UsersContext';
import { useProjects } from '../../hooks/useProjects';
import { MessageSquare, ArrowRightLeft, Plus, Edit, Users as UsersIcon } from 'lucide-react';
import Avatar from '../ui/Avatar';
import { getAvatarColor } from '../../utils';

const HISTORY_TYPE_META = {
  CREATED:           { icon: Plus,           color: 'bg-emerald-50 text-emerald-600' },
  STATUS_CHANGED:    { icon: ArrowRightLeft, color: 'bg-blue-50 text-blue-600' },
  UPDATED:           { icon: Edit,           color: 'bg-amber-50 text-amber-600' },
  COMMENT_ADDED:     { icon: MessageSquare,  color: 'bg-violet-50 text-violet-600' },
  ASSIGNEES_UPDATED: { icon: UsersIcon,      color: 'bg-indigo-50 text-indigo-600' },
};

const formatRelativeTime = (date) => {
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const AdminActivityTab = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getUserById } = useAllUsers();
  const { projects } = useProjects();
  const [displayCount, setDisplayCount] = useState(50);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      const allActivities = [];

      snapshot.docs.forEach(d => {
        const task = d.data();
        const taskTitle = task.title || 'Untitled Task';
        const projectId = task.projectId;

        (task.history || []).forEach(entry => {
          allActivities.push({
            ...entry,
            taskId: d.id,
            taskTitle,
            projectId,
            timestamp: entry.createdAt?.toDate?.() || new Date(0),
          });
        });
      });

      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      setActivities(allActivities);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const resolveUser = (userId) => {
    const u = getUserById(userId);
    return u || { name: 'Unknown', initials: '?', avatarColor: 'blue' };
  };

  const resolveProject = (projectId) => {
    const p = projects.find(pr => pr.id === projectId);
    return p?.title || 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  const visible = activities.slice(0, displayCount);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[32px] p-6">
        <div className="space-y-1">
          {visible.map((activity, i) => {
            const meta = HISTORY_TYPE_META[activity.type] || HISTORY_TYPE_META.UPDATED;
            const Icon = meta.icon;
            const user = resolveUser(activity.createdBy);
            const projectTitle = resolveProject(activity.projectId);

            return (
              <div
                key={activity.id || i}
                className="flex items-start gap-4 py-3 px-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                {/* Type Icon */}
                <div className={`p-2 rounded-lg flex-shrink-0 ${meta.color}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* User Avatar */}
                <Avatar
                  initials={user.initials || '?'}
                  avatarColor={user.avatarColor || getAvatarColor(user.name || '')}
                  size="sm"
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-700">{user.name}</span>
                    <span className="text-sm text-slate-400">-</span>
                    <span className="text-sm text-slate-500">{activity.description}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-blue-500 font-medium truncate">{activity.taskTitle}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-400 truncate">{projectTitle}</span>
                  </div>
                </div>

                {/* Time */}
                <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-8 text-slate-400">No activity yet</div>
        )}

        {activities.length > displayCount && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount(prev => prev + 50)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Load more ({activities.length - displayCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityTab;
