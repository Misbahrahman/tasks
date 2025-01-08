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

  updateProjectMetrics : async (projectId, actionType, currentStatus = null) => {
    try {
      // Get current project metrics
      const projectsRef = collection(db, "projects");
      const projectQuery = query(projectsRef, where("id", "==", projectId));
      const querySnapshot = await getDocs(projectQuery);
  
      if (querySnapshot.empty) {
        console.error("No project found with the provided ID.");
        return;
      }
  
      const docRef = querySnapshot.docs[0].ref;
      const projectData = querySnapshot.docs[0].data();
      
      let { totalTasks = 0, completedTasks = 0 } = projectData.metrics || {};
  
      // Update metrics based on action type
      switch (actionType) {
        case 'CREATE_TASK':
          totalTasks += 1;
          break;
          
        case 'DELETE_TASK':
          totalTasks -= 1;
          // If deleting a completed task, decrease completedTasks
          if (currentStatus === 'done') {
            completedTasks = Math.max(0, completedTasks - 1);
          }
          break;
          
        case 'STATUS_CHANGE':
          if (currentStatus === 'done') {
            completedTasks += 1;
          } else if (currentStatus === 'from_done') {
            completedTasks = Math.max(0, completedTasks - 1);
          }
          break;
          
        default:
          console.warn('Unknown action type:', actionType);
          return;
      }
  
      // Calculate progress percentage
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
      // Update project document
      await updateDoc(docRef, {
        'metrics.totalTasks': totalTasks,
        'metrics.completedTasks': completedTasks,
        progress,
        metricsDescription: `${completedTasks}/${totalTasks} tasks`,
        updatedAt: serverTimestamp()
      });
  
      return { totalTasks, completedTasks, progress };
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