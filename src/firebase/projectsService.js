import {
  collection, addDoc, doc, deleteDoc, updateDoc,
  serverTimestamp, increment, query, where, getDocs
} from 'firebase/firestore';
import { db } from './config';
import { metricsService } from './metricsService';

export const projectsService = {
  createProject: async (projectData, userId) => {
    const docRef = await addDoc(collection(db, 'projects'), {
      ...projectData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userId,
      metrics: { totalTasks: 0, completedTasks: 0 },
      progress: 0,
    });
    return docRef.id;
  },

  // All metric operations now use atomic increment() — no race conditions,
  // no extra reads, and directly address the project by its Firestore doc ID.
  updateProjectMetrics: async (projectId, actionType, currentStatus = null) => {
    if (!projectId || projectId === 0 || projectId === '0') return;
    const docRef = doc(db, 'projects', projectId);

    switch (actionType) {
      case 'CREATE_TASK':
        await updateDoc(docRef, {
          'metrics.totalTasks': increment(1),
          updatedAt: serverTimestamp(),
        });
        break;

      case 'DELETE_TASK':
        await updateDoc(docRef, {
          'metrics.totalTasks': increment(-1),
          ...(currentStatus === 'done' && { 'metrics.completedTasks': increment(-1) }),
          updatedAt: serverTimestamp(),
        });
        break;

      case 'STATUS_CHANGE':
        if (currentStatus === 'done') {
          await updateDoc(docRef, {
            'metrics.completedTasks': increment(1),
            updatedAt: serverTimestamp(),
          });
        } else if (currentStatus === 'from_done') {
          await updateDoc(docRef, {
            'metrics.completedTasks': increment(-1),
            updatedAt: serverTimestamp(),
          });
        }
        break;

      default:
        console.warn('Unknown action type:', actionType);
    }
  },

  closeProject: async (projectId) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { status: 'completed', updatedAt: serverTimestamp() });
  },

  reopenProject: async (projectId) => {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, { status: 'active', updatedAt: serverTimestamp() });
  },

  deleteProject: async (projectId) => {
    // Cascade-delete all tasks belonging to this project first
    const tasksSnap = await getDocs(
      query(collection(db, 'tasks'), where('projectId', '==', projectId))
    );

    // Collect all affected assignees before deleting tasks
    const affectedUserIds = new Set();
    tasksSnap.docs.forEach((d) => {
      const assignees = d.data().assignees || [];
      assignees.forEach((uid) => affectedUserIds.add(uid));
    });

    await Promise.all(tasksSnap.docs.map((d) => deleteDoc(d.ref)));

    // Then delete the project document
    await deleteDoc(doc(db, 'projects', projectId));

    // Recalculate metrics for all affected users
    affectedUserIds.forEach((uid) => metricsService.calculateAndStoreMetrics(uid).catch(console.error));
  },
};

export default projectsService;
