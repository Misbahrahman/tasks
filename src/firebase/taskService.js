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


  addNote: async (taskId, note) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      const noteData = {
        id: Date.now().toString(),
        content: note.content,
        createdBy: note.userId,
        createdAt: serverTimestamp()
      };

      await updateDoc(taskRef, {
        notes: arrayUnion(noteData),
        // Also add to history
        history: arrayUnion({
          id: Date.now().toString(),
          type: 'note_added',
          description: `Added note: "${note.content.slice(0, 50)}${note.content.length > 50 ? '...' : ''}"`,
          createdBy: note.userId,
          createdAt: serverTimestamp()
        })
      });

      return noteData;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  },

  updateTask: async (taskId, updates, userId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      const currentTask = taskDoc.data();

      // Create history entries for changes
      const historyEntries = [];

      // Check what fields changed and create history entries
      if (updates.title !== currentTask.title) {
        historyEntries.push({
          id: Date.now().toString() + '1',
          type: 'title_updated',
          description: `Changed title from "${currentTask.title}" to "${updates.title}"`,
          createdBy: userId,
          createdAt: serverTimestamp()
        });
      }

      if (updates.priority !== currentTask.priority) {
        historyEntries.push({
          id: Date.now().toString() + '2',
          type: 'priority_updated',
          description: `Changed priority from ${currentTask.priority} to ${updates.priority}`,
          createdBy: userId,
          createdAt: serverTimestamp()
        });
      }

      if (updates.description !== currentTask.description) {
        historyEntries.push({
          id: Date.now().toString() + '3',
          type: 'description_updated',
          description: 'Updated task description',
          createdBy: userId,
          createdAt: serverTimestamp()
        });
      }

      // Update the task with new data and history entries
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp(),
        history: [
          ...(currentTask.history || []),
          ...historyEntries
        ]
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  getTaskDetails: async (taskId) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);

      if (taskDoc.exists()) {
        const data = taskDoc.data();
        return {
          id: taskDoc.id,
          ...data,
          notes: (data.notes || []).sort((a, b) => b.createdAt - a.createdAt),
          history: (data.history || []).sort((a, b) => b.createdAt - a.createdAt),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        };
      }
      throw new Error('Task not found');
    } catch (error) {
      console.error('Error getting task details:', error);
      throw error;
    }
  }

};