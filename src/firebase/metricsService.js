import {
  collection, query, where, getDocs, doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

export const metricsService = {
  /**
   * Queries all tasks assigned to the user, computes 7 metrics,
   * and writes them to the metrics/{userId} document.
   */
  calculateAndStoreMetrics: async (userId) => {
    if (!userId) return null;

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('assignees', 'array-contains', userId));
    const snapshot = await getDocs(q);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    let totalTasks = 0;
    let tasksCompleted = 0;
    let activeTasks = 0;
    let overdueTasks = 0;
    let dueThisWeek = 0;
    let onTimeCompletions = 0;
    let totalCompletionDays = 0;
    let completedWithTime = 0;

    snapshot.docs.forEach((d) => {
      const task = d.data();
      totalTasks++;

      const isDone = task.status === 'done';
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const createdAt = task.createdAt?.toDate?.() || null;

      if (isDone) {
        tasksCompleted++;

        // Find the STATUS_CHANGED to 'done' history entry for completion time
        const doneEntry = (task.history || []).find(
          (h) => h.type === 'STATUS_CHANGED' && h.description?.includes('to done')
        );
        const completedAt = doneEntry?.createdAt?.toDate?.() || task.updatedAt?.toDate?.() || null;

        if (createdAt && completedAt) {
          const days = (completedAt - createdAt) / (1000 * 60 * 60 * 24);
          totalCompletionDays += days;
          completedWithTime++;
        }

        if (dueDate && completedAt && completedAt <= new Date(dueDate.getTime() + 86400000)) {
          onTimeCompletions++;
        }
      } else {
        // Active (todo or inProgress)
        activeTasks++;

        // Overdue: not done and past due date
        if (dueDate && dueDate < now) {
          overdueTasks++;
        }
      }

      // Due this week (regardless of status)
      if (dueDate && dueDate >= startOfWeek && dueDate <= endOfWeek) {
        dueThisWeek++;
      }
    });

    const completionRate = totalTasks > 0
      ? Math.round((tasksCompleted / totalTasks) * 100)
      : 0;

    const avgCompletionTime = completedWithTime > 0
      ? Math.round(totalCompletionDays / completedWithTime)
      : 0;

    const onTimePercent = tasksCompleted > 0
      ? Math.round((onTimeCompletions / tasksCompleted) * 100)
      : 0;

    const metricsData = {
      tasksCompleted,
      completionRate,
      avgCompletionTime,
      onTimePercent,
      activeTasks,
      overdueTasks,
      dueThisWeek,
      totalTasks,
      updatedAt: serverTimestamp(),
    };

    // Write to metrics/{userId}
    await setDoc(doc(db, 'metrics', userId), metricsData, { merge: true });

    return metricsData;
  },
};
