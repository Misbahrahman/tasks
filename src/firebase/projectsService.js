// src/firebase/projectsService.js
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    serverTimestamp 
  } from 'firebase/firestore';
  import { db } from './config';
  
  export const projectsService = {
    createProject: async (projectData, userId) => {
      try {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          createdBy: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: 'active',
          progress: 0,
          metrics: {
            totalTasks: 0,
            completedTasks: 0,
          }
        });
        return docRef.id;
      } catch (error) {
        throw new Error('Failed to create project: ' + error.message);
      }
    },
  
    updateProject: async (projectId, updates) => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        throw new Error('Failed to update project: ' + error.message);
      }
    },
  
    deleteProject: async (projectId) => {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
      } catch (error) {
        throw new Error('Failed to delete project: ' + error.message);
      }
    },
  
    closeProject: async (projectId) => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
          status: 'completed',
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        throw new Error('Failed to close project: ' + error.message);
      }
    },
  
    getUserProjects: async (userId) => {
      try {
        const q = query(
          collection(db, 'projects'),
          where('team', 'array-contains', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        throw new Error('Failed to fetch projects: ' + error.message);
      }
    }
  };