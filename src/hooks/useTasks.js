// src/hooks/useTasks.js
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTasks = (projectId, userId = null) => {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [project, setProject] = useState(null);

  // Fetch project details
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        // console.log('Fetching project with ID:', projectId);
        
        // Try to find project by numeric ID field
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef);
        const querySnapshot = await getDocs(q);
        
        let foundProject = null;
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.id && data.id.toString() === projectId.toString()) {
            foundProject = {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate()
            };
          }
        });

        if (foundProject) {
          // console.log('Found project:', foundProject);
          setProject(foundProject);
          setError(null);
        } else {
          console.error('No project found with ID:', projectId);
          setError('Project not found');
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        setError(error.message);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Fetch tasks
  useEffect(() => {
    if (!projectId || !project) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    let q;

    if (userId) {
      // Fetch user-specific tasks
      q = query(
        tasksRef,
        where('projectId', '==', projectId), // Use the Firestore document ID
        where('assignees', 'array-contains', userId)
      );
    } else {
      // Fetch all project tasks
      q = query(
        tasksRef,
        where('projectId', '==', projectId) // Use the Firestore document ID
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksByStatus = {
          todo: [],
          inProgress: [],
          done: []
        };

        snapshot.docs.forEach(doc => {
          const task = {
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          };

          if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
          }
        });

        setTasks(tasksByStatus);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [projectId, userId, project]);

  return {
    tasks,
    loading,
    error,
    currentProjectId: projectId,
    project
  };
};

export default useTasks;