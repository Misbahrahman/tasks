// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authService } from '../firebase/auth';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Listen to projects
    const projectsUnsub = onSnapshot(
      query(collection(db, 'projects')),
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        projectsData.sort((a, b) => b.createdAt - a.createdAt);
        setProjects(prev => {
          // Merge with live task counts if we already have them
          const taskCounts = {};
          prev.forEach(p => {
            if (p._liveCounts) taskCounts[p.id] = p._liveCounts;
          });
          return projectsData.map(p => ({
            ...p,
            ...(taskCounts[p.id] ? {
              _liveCounts: taskCounts[p.id],
              metrics: { ...p.metrics, ...taskCounts[p.id] },
            } : {}),
          }));
        });
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Listen to ALL tasks to compute real completedTasks / totalTasks per project
    const tasksUnsub = onSnapshot(
      query(collection(db, 'tasks')),
      (snapshot) => {
        const counts = {}; // { projectId: { totalTasks, completedTasks } }
        snapshot.docs.forEach(d => {
          const data = d.data();
          const pid = data.projectId;
          if (!pid) return;
          if (!counts[pid]) counts[pid] = { totalTasks: 0, completedTasks: 0 };
          counts[pid].totalTasks += 1;
          if (data.status === 'done') counts[pid].completedTasks += 1;
        });

        setProjects(prev =>
          prev.map(p => {
            const live = counts[p.id] || { totalTasks: 0, completedTasks: 0 };
            return {
              ...p,
              _liveCounts: live,
              metrics: { ...p.metrics, ...live },
            };
          })
        );
      },
      (err) => console.error('Error fetching task counts:', err)
    );

    return () => {
      projectsUnsub();
      tasksUnsub();
    };
  }, []);

  return { projects, loading, error };
};

export default useProjects;