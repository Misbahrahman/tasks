import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useAdminMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'tasks'),
      (snapshot) => {
        const allTasks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const now = new Date();

        // Time boundaries
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let completedThisWeek = 0;
        let completedThisMonth = 0;
        let totalOverdue = 0;
        let totalCompletionDays = 0;
        let completedWithTime = 0;
        let totalCompleted = 0;
        const totalTasks = allTasks.length;

        const statusCounts = { todo: 0, inProgress: 0, done: 0 };
        const activeUsersThisWeek = new Set();
        const userCompletionMap = {};
        const projectActivityMap = {};

        allTasks.forEach(task => {
          const isDone = task.status === 'done';
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          const createdAt = task.createdAt?.toDate?.() || null;

          if (statusCounts[task.status] !== undefined) {
            statusCounts[task.status]++;
          }

          if (isDone) {
            totalCompleted++;

            const doneEntry = (task.history || []).find(
              h => h.type === 'STATUS_CHANGED' && h.description?.includes('to done')
            );
            const completedAt = doneEntry?.createdAt?.toDate?.() || task.updatedAt?.toDate?.() || null;

            if (completedAt && completedAt >= startOfWeek) completedThisWeek++;
            if (completedAt && completedAt >= startOfMonth) completedThisMonth++;

            if (createdAt && completedAt) {
              totalCompletionDays += (completedAt - createdAt) / (1000 * 60 * 60 * 24);
              completedWithTime++;
            }

            (task.assignees || []).forEach(uid => {
              userCompletionMap[uid] = (userCompletionMap[uid] || 0) + 1;
            });
          } else {
            if (dueDate && dueDate < now) totalOverdue++;
          }

          (task.history || []).forEach(h => {
            const hDate = h.createdAt?.toDate?.() || null;
            if (hDate && hDate >= startOfWeek) {
              if (h.createdBy) activeUsersThisWeek.add(h.createdBy);
              if (task.projectId) {
                projectActivityMap[task.projectId] = (projectActivityMap[task.projectId] || 0) + 1;
              }
            }
          });
        });

        const completionRate = totalTasks > 0
          ? Math.round((totalCompleted / totalTasks) * 100) : 0;
        const avgCompletionTime = completedWithTime > 0
          ? Math.round(totalCompletionDays / completedWithTime) : 0;

        const topContributors = Object.entries(userCompletionMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([userId, count]) => ({ userId, count }));

        const mostActiveProjects = Object.entries(projectActivityMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([projectId, activityCount]) => ({ projectId, activityCount }));

        const bottleneck = statusCounts.todo >= statusCounts.inProgress
          ? { status: 'To Do', count: statusCounts.todo }
          : { status: 'In Progress', count: statusCounts.inProgress };

        setMetrics({
          completedThisWeek,
          completedThisMonth,
          totalOverdue,
          avgCompletionTime,
          completionRate,
          activeUsersThisWeek: activeUsersThisWeek.size,
          topContributors,
          mostActiveProjects,
          bottleneck,
          statusCounts,
          totalTasks,
          totalCompleted,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { metrics, loading, error };
};
