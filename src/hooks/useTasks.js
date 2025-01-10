import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authService } from '../firebase/auth';

export const useTasks = (projectId, viewType = null) => {
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

    const currentUser = authService.getCurrentUser();
    
    if (viewType === 'my-tasks') {
      // For my-tasks view, we'll filter by both project and current user in assignees
      q = query(
        tasksRef,
        where('projectId', '==', projectId),
        where('assignees', 'array-contains', currentUser?.uid) // Using first team member as current user
      );
    } else {
      // For all tasks view, only filter by project
      q = query(
        tasksRef,
        where('projectId', '==', projectId)
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
            // Sort tasks by priority and due date
            tasksByStatus[task.status].push(task);
          }
        });

        // Sort tasks in each status category
        Object.keys(tasksByStatus).forEach(status => {
          tasksByStatus[status].sort((a, b) => {
            // First sort by priority
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // Then by due date if priority is the same
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA - dateB;
          });
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
  }, [projectId, project, viewType]);

  return {
    tasks,
    loading,
    error,
    currentProjectId: projectId,
    project
  };
};

export default useTasks;