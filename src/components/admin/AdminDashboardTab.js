import React from 'react';
import {
  CheckCircle, AlertTriangle, Clock, TrendingUp,
  Users, BarChart3, Trophy, Flame, AlertOctagon
} from 'lucide-react';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { useAllUsers } from '../../context/UsersContext';
import { useProjects } from '../../hooks/useProjects';
import Avatar from '../ui/Avatar';
import { getAvatarColor } from '../../utils';

const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-500' },
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-500' },
    red:     { bg: 'bg-red-50',     text: 'text-red-500' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-500' },
    indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-500' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-500' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-[32px] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-2xl font-semibold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
    </div>
  );
};

const AdminDashboardTab = () => {
  const { metrics, loading, error } = useAdminMetrics();
  const { getUserById } = useAllUsers();
  const { projects } = useProjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">Error: {error}</div>;
  }

  if (!metrics) return null;

  const workspaceMetrics = [
    { title: 'Completed This Week',  value: metrics.completedThisWeek,  icon: CheckCircle,   color: 'emerald' },
    { title: 'Completed This Month', value: metrics.completedThisMonth, icon: TrendingUp,    color: 'blue' },
    { title: 'Total Overdue',        value: metrics.totalOverdue,       icon: AlertTriangle, color: 'red' },
    { title: 'Avg Completion Time',  value: `${metrics.avgCompletionTime}d`, icon: Clock,    color: 'amber' },
    { title: 'Completion Rate',      value: `${metrics.completionRate}%`,    icon: BarChart3, color: 'indigo' },
    { title: 'Active Users (Week)',  value: metrics.activeUsersThisWeek,     icon: Users,     color: 'violet' },
  ];

  const resolveUser = (userId) => {
    const u = getUserById(userId);
    return u || { name: 'Unknown', initials: '?', avatarColor: 'blue' };
  };

  const resolveProject = (projectId) => {
    const p = projects.find(pr => pr.id === projectId);
    return p || { title: 'Unknown Project' };
  };

  return (
    <div className="space-y-8">
      {/* Workspace Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Workspace Productivity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceMetrics.map(m => (
            <MetricCard key={m.title} {...m} />
          ))}
        </div>
      </div>

      {/* Team Insights */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Team Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Top Contributors */}
          <div className="bg-white rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-700">Top Contributors</h3>
            </div>
            {metrics.topContributors.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet</p>
            ) : (
              <div className="space-y-3">
                {metrics.topContributors.map((c, i) => {
                  const user = resolveUser(c.userId);
                  return (
                    <div key={c.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                          {i + 1}
                        </span>
                        <Avatar
                          initials={user.initials || '?'}
                          avatarColor={user.avatarColor || getAvatarColor(user.name || '')}
                          size="sm"
                        />
                        <span className="text-sm font-medium text-slate-700">{user.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-emerald-600">{c.count} tasks</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Most Active Projects */}
          <div className="bg-white rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-slate-700">Most Active Projects</h3>
            </div>
            {metrics.mostActiveProjects.length === 0 ? (
              <p className="text-sm text-slate-400">No activity this week</p>
            ) : (
              <div className="space-y-3">
                {metrics.mostActiveProjects.map((p, i) => {
                  const proj = resolveProject(p.projectId);
                  return (
                    <div key={p.projectId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                          ${i === 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{proj.title}</span>
                      </div>
                      <span className="text-sm text-slate-500">{p.activityCount} actions</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottleneck */}
          <div className="bg-white rounded-[32px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-700">Bottleneck Column</h3>
            </div>
            <div className="flex flex-col items-center py-4">
              <span className="text-3xl font-bold text-slate-800">{metrics.bottleneck.count}</span>
              <span className="text-sm text-slate-500 mt-1">tasks stuck in</span>
              <span className="mt-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-600">
                {metrics.bottleneck.status}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(metrics.statusCounts).map(([status, count]) => {
                const label = status === 'todo' ? 'To Do' : status === 'inProgress' ? 'In Progress' : 'Done';
                const total = metrics.totalTasks || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-slate-500">{label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === 'done' ? 'bg-emerald-500' : status === 'inProgress' ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-slate-600 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTab;
