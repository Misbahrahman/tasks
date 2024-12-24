// src/firebase/taskService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp, 
  arrayUnion
} from 'firebase/firestore';
import { db } from './config';

export const taskService = {
  createTask: async (projectId, taskData, userId) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...taskData,
        projectId,
        createdBy: userId,
        status: 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create task: ' + error.message);
    } 
  },

  updateTaskStatus: async (taskId, newStatus) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update task status: ' + error.message);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update task: ' + error.message);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      throw new Error('Failed to delete task: ' + error.message);
    }
  },

  addComment: async (taskId, comment, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          content: comment,
          createdBy: userId,
          createdAt: serverTimestamp()
        }),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to add comment: ' + error.message);
    }
  }
  
};