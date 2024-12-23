// src/firebase/services.js
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where,
    serverTimestamp 
  } from 'firebase/firestore';
  import { auth, db } from './config';
  
  // User Services
  export const userServices = {
    getUser: async (userId) => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    },
    
    updateUserProfile: async (userId, data) => {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
    }
  };
  
  // Project Services
  export const projectServices = {
    getAllProjects: async () => {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    getUserProjects: async (userId) => {
      const q = query(
        collection(db, 'projects'),
        where('team', 'array-contains', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    createProject: async (projectData) => {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    },
  
    updateProject: async (projectId, data) => {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { 
        ...data, 
        updatedAt: serverTimestamp() 
      });
    },
  
    deleteProject: async (projectId) => {
      await deleteDoc(doc(db, 'projects', projectId));
    }
  };
  
  // Task Services
  export const taskServices = {
    getProjectTasks: async (projectId) => {
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  
    createTask: async (taskData) => {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    },
  
    updateTask: async (taskId, data) => {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { 
        ...data, 
        updatedAt: serverTimestamp() 
      });
    },
  
    deleteTask: async (taskId) => {
      await deleteDoc(doc(db, 'tasks', taskId));
    },
  
    addTaskNote: async (taskId, note) => {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const currentNotes = taskDoc.data().notes || [];
      
      await updateDoc(taskRef, {
        notes: [...currentNotes, {
          id: Date.now().toString(),
          content: note,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid
        }]
      });
    }
  };