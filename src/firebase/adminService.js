import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export const adminService = {
  updateUserRole: async (userId, newRole) => {
    await updateDoc(doc(db, 'users', userId), {
      role: newRole,
      ROLE: newRole,
      updatedAt: serverTimestamp(),
    });
  },

  toggleUserStatus: async (userId, newStatus) => {
    await updateDoc(doc(db, 'users', userId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  },

  removeUser: async (userId) => {
    // Only removes Firestore doc. Firebase Auth account requires Cloud Function to delete.
    await deleteDoc(doc(db, 'users', userId));
  },
};
