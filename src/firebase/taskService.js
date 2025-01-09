// src/firebase/taskService.js
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  getDoc,
  Timestamp
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
        updatedAt: serverTimestamp(),
        comments: [],
        history: [{
          id: Date.now().toString(),
          type: 'CREATED',
          description: 'Task created',
          createdBy: userId,
          createdAt: Timestamp.now()
        }]
      });
      
      return docRef.id;
    } catch (error) {
      throw new Error('Failed to create task: ' + error.message);
    } 
  },

  updateTaskStatus: async (taskId, newStatus, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      const oldStatus = taskSnap.data()?.status;

      await updateDoc(taskRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        history: arrayUnion({
          id: Date.now().toString(),
          type: 'STATUS_CHANGED',
          description: `Status changed from ${oldStatus} to ${newStatus}`,
          createdBy: userId,
          createdAt: Timestamp.now()
        })
      });
    } catch (error) {
      throw new Error('Failed to update task status: ' + error.message);
    }
  },

  updateTask: async (taskId, updates, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      const oldData = taskSnap.data();

      // Create history entries for changed fields
      const changes = [];
      Object.keys(updates).forEach(field => {
        if (oldData[field] !== updates[field]) {
          changes.push(`${field}: ${oldData[field]} → ${updates[field]}`);
        }
      });

      if (changes.length > 0) {
        await updateDoc(taskRef, {
          ...updates,
          updatedAt: serverTimestamp(),
          history: arrayUnion({
            id: Date.now().toString(),
            type: 'UPDATED',
            description: `Updated ${changes.join(', ')}`,
            createdBy: userId,
            createdAt: Timestamp.now()
          })
        });
      } else {
        await updateDoc(taskRef, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      throw new Error('Failed to update task: ' + error.message);
    }
  },

  addComment: async (taskId, commentData, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Create the comment with current timestamp
      const comment = {
        id: Date.now().toString(),
        ...commentData,
        createdBy: userId,
        createdAt: Timestamp.now() // Use Timestamp.now() instead of serverTimestamp()
      };

      // Update the document with the new comment
      await updateDoc(taskRef, {
        comments: arrayUnion(comment),
        updatedAt: serverTimestamp(),
        history: arrayUnion({
          id: Date.now().toString(),
          type: 'COMMENT_ADDED',
          description: 'New comment added',
          createdBy: userId,
          createdAt: Timestamp.now()
        })
      });

      return comment;
    } catch (error) {
      throw new Error('Failed to add comment: ' + error.message);
    }
  },

  deleteTask: async (taskId, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Add deletion to history before deleting
      await updateDoc(taskRef, {
        history: arrayUnion({
          id: Date.now().toString(),
          type: 'DELETED',
          description: 'Task deleted',
          createdBy: userId,
          createdAt: Timestamp.now()
        })
      });
      
      await deleteDoc(taskRef);
    } catch (error) {
      throw new Error('Failed to delete task: ' + error.message);
    }
  },

  updateAssignees: async (taskId, newAssignees, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskSnap = await getDoc(taskRef);
      const oldAssignees = taskSnap.data()?.assignees || [];

      const added = newAssignees.filter(a => !oldAssignees.includes(a));
      const removed = oldAssignees.filter(a => !newAssignees.includes(a));

      let description = '';
      if (added.length) description += `Added assignees: ${added.join(', ')} `;
      if (removed.length) description += `Removed assignees: ${removed.join(', ')}`;

      await updateDoc(taskRef, {
        assignees: newAssignees,
        updatedAt: serverTimestamp(),
        history: arrayUnion({
          id: Date.now().toString(),
          type: 'ASSIGNEES_UPDATED',
          description: description.trim(),
          createdBy: userId,
          createdAt: Timestamp.now()
        })
      });
    } catch (error) {
      throw new Error('Failed to update assignees: ' + error.message);
    }
  }
};