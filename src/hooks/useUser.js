import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authService } from '../firebase/auth';

// ─── Current user + Firestore profile ────────────────────────────────────────
export const useUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let firestoreUnsub = null;

    // Outer: listen to Firebase Auth state so the hook works across sign-out / sign-in
    const authUnsub = authService.onAuthStateChange((authUser) => {
      // Clean up previous Firestore listener on auth change
      if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }

      if (!authUser) {
        setUserData(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', authUser.uid);
      firestoreUnsub = onSnapshot(
        userDocRef,
        (snap) => {
          if (snap.exists()) {
            setUserData({
              id: snap.id,
              ...snap.data(),
              currentProject: snap.data().currentProject || null,
            });
          } else {
            setError('User profile not found');
          }
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    });

    return () => {
      authUnsub();
      if (firestoreUnsub) firestoreUnsub();
    };
  }, []);

  // FIXED: lowercase 'role' matches what auth.js stores at registration
  const isAdmin = userData?.role === 'Admin';

  const updateUserProfile = useCallback(async (updates) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user');
    await updateDoc(doc(db, 'users', currentUser.uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const setCurrentProject = useCallback(async (projectId) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) throw new Error('No authenticated user');
    await updateDoc(doc(db, 'users', currentUser.uid), {
      currentProject: projectId,
      updatedAt: serverTimestamp(),
    });
  }, []);

  const getCurrentProject = useCallback(() => userData?.currentProject || null, [userData]);

  return { userData, loading, error, isAdmin, updateUserProfile, setCurrentProject, getCurrentProject };
};

// ─── All users (single fetch, shared via UsersContext) ───────────────────────
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) { setLoading(false); return; }

    const unsub = onSnapshot(
      query(collection(db, 'users')),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          initials:
            d.data().initials ||
            d.data().name?.split(' ').map((n) => n[0]).join('').toUpperCase() ||
            '?',
        }));
        setUsers(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const getUserById = useCallback((id) => users.find((u) => u.id === id) || null, [users]);
  const getUsersByIds = useCallback(
    (ids) => (ids?.length ? users.filter((u) => ids.includes(u.id)) : []),
    [users]
  );

  return { users, loading, error, getUserById, getUsersByIds };
};

// ─── User metrics (reads from userData directly — no extra listener needed) ──
export const useUserMetrics = (userId) => {
  // Kept for backward compatibility; Profile now uses userData.metrics directly.
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const userDocRef = doc(db, 'users', userId);
    const unsub = onSnapshot(userDocRef, (snap) => {
      setMetrics(snap.exists() ? snap.data().metrics || null : null);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  return { metrics, loading };
};
