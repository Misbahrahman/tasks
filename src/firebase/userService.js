// src/firebase/userService.js
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const userService = {
  setCurrentProject: async (userId, projectId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        currentProject: projectId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      throw new Error('Failed to update current project: ' + error.message);
    }
  }
};