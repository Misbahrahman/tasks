// src/firebase/projectsService.js
import { collection, addDoc, doc, deleteDoc, updateDoc, serverTimestamp, getDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export const projectsService = {
  createProject: async (projectData, userId) => {
    try {
      // Generate a numeric ID using timestamp
      const numericId = Date.now().toString();

      const projectsRef = collection(db, 'projects');
      const docRef = await addDoc(projectsRef, {
        ...projectData,
        id: numericId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
        },
        metricsDescription: "0/0 tasks",
        progress: 0
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  updateProjectMetrics: async (projectId) => {
    try {
      // Get the project document
      const projectRef = doc(db, 'projects', projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        throw new Error('Project not found');
      }

      // Get all tasks for this project
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('projectId', '==', projectId));
      const taskSnapshot = await getDocs(q);

      // Calculate metrics
      let totalTasks = taskSnapshot.size;
      let completedTasks = 0;

      taskSnapshot.forEach(doc => {
        if (doc.data().status === 'done') {
          completedTasks++;
        }
      });

      // Calculate progress
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Update project
      await updateDoc(projectRef, {
        'metrics.totalTasks': totalTasks,
        'metrics.completedTasks': completedTasks,
        progress,
        metricsDescription: `${completedTasks}/${totalTasks} tasks`,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error updating project metrics:', error);
      throw error;
    }
  },

  closeProject: async (projectId) => {
    try {
      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("id", "==", projectId)); 
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          alert("No project found with the provided ID.");
          return;
      }

      const projectRef = querySnapshot.docs[0].ref;

      await updateDoc(projectRef, {
        status: 'completed',
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error closing project:', error);
      throw error;
    }
  },

  deleteProject: async (projectId) => {
    try {

      const projectsRef = collection(db, "projects");
      const q = query(projectsRef, where("id", "==", projectId)); 
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          alert("No project found with the provided ID.");
          return;
      }

      const docRef = querySnapshot.docs[0].ref;

      await deleteDoc(docRef);

    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

export default projectsService;