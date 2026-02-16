import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, arrayUnion, getDoc, Timestamp
} from 'firebase/firestore';
import { db } from './config';
import { metricsService } from './metricsService';

// Generate a collision-safe ID for array sub-documents (history / comments)
const newId = () => doc(collection(db, '_')).id;

export const taskService = {
  createTask: async (projectId, taskData, userId) => {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      projectId,
      createdBy: userId,
      status: 'todo',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      comments: [],
      history: [{
        id: newId(),
        type: 'CREATED',
        description: 'Task created',
        createdBy: userId,
        createdAt: Timestamp.now(),
      }],
    });

    // Recalculate metrics for all assignees
    const assignees = taskData.assignees || [];
    assignees.forEach((uid) => metricsService.calculateAndStoreMetrics(uid).catch(console.error));
    if (userId && !assignees.includes(userId)) {
      metricsService.calculateAndStoreMetrics(userId).catch(console.error);
    }

    return docRef.id;
  },

  // Returns the previous status so callers can update project metrics correctly
  updateTaskStatus: async (taskId, newStatus, userId) => {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    const oldStatus = taskSnap.data()?.status;

    await updateDoc(taskRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      history: arrayUnion({
        id: newId(),
        type: 'STATUS_CHANGED',
        description: `Status changed from ${oldStatus} to ${newStatus}`,
        createdBy: userId,
        createdAt: Timestamp.now(),
      }),
    });

    // Recalculate metrics for all assignees of this task
    const assignees = taskSnap.data()?.assignees || [];
    assignees.forEach((uid) => metricsService.calculateAndStoreMetrics(uid).catch(console.error));

    return oldStatus;
  },

  updateTask: async (taskId, updates, userId) => {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    const oldData = taskSnap.data() || {};

    const changes = Object.keys(updates)
      .filter((k) => String(oldData[k]) !== String(updates[k]))
      .map((k) => `${k}: ${oldData[k]} → ${updates[k]}`);

    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      ...(changes.length > 0 && {
        history: arrayUnion({
          id: newId(),
          type: 'UPDATED',
          description: `Updated ${changes.join(', ')}`,
          createdBy: userId,
          createdAt: Timestamp.now(),
        }),
      }),
    });
  },

  addComment: async (taskId, commentData, userId) => {
    const comment = {
      id: newId(),
      ...commentData,
      createdBy: userId,
      createdAt: Timestamp.now(),
    };

    await updateDoc(doc(db, 'tasks', taskId), {
      comments: arrayUnion(comment),
      updatedAt: serverTimestamp(),
      history: arrayUnion({
        id: newId(),
        type: 'COMMENT_ADDED',
        description: 'New comment added',
        createdBy: userId,
        createdAt: Timestamp.now(),
      }),
    });

    return comment;
  },

  deleteTask: async (taskId) => {
    // Read assignees before deleting so we can recalculate their metrics
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    const assignees = taskSnap.data()?.assignees || [];

    await deleteDoc(taskRef);

    // Recalculate metrics for affected assignees
    assignees.forEach((uid) => metricsService.calculateAndStoreMetrics(uid).catch(console.error));
  },

  updateAssignees: async (taskId, newAssignees, userId) => {
    const taskRef = doc(db, 'tasks', taskId);
    const taskSnap = await getDoc(taskRef);
    const oldAssignees = taskSnap.data()?.assignees || [];

    const added = newAssignees.filter((a) => !oldAssignees.includes(a));
    const removed = oldAssignees.filter((a) => !newAssignees.includes(a));
    const parts = [];
    if (added.length) parts.push(`Added: ${added.length} assignee(s)`);
    if (removed.length) parts.push(`Removed: ${removed.length} assignee(s)`);

    await updateDoc(taskRef, {
      assignees: newAssignees,
      updatedAt: serverTimestamp(),
      history: arrayUnion({
        id: newId(),
        type: 'ASSIGNEES_UPDATED',
        description: parts.join('; '),
        createdBy: userId,
        createdAt: Timestamp.now(),
      }),
    });

    // Recalculate metrics for all affected users (old + new assignees)
    const allAffected = [...new Set([...oldAssignees, ...newAssignees])];
    allAffected.forEach((uid) => metricsService.calculateAndStoreMetrics(uid).catch(console.error));
  },
};
