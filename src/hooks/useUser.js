// src/hooks/useUser.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authService } from '../firebase/auth';

export const useUser = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userDoc = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userDoc, 
      (doc) => {
        if (doc.exists()) {
          setUserData({ id: doc.id, ...doc.data() });
        } else {
          setError('User not found');
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (updates) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user');

      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, updates);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return { userData, loading, error, updateUserProfile };
};

export const useUserMetrics = (userId) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const userDoc = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userDoc, 
      (doc) => {
        if (doc.exists() && doc.data().metrics) {
          setMetrics(doc.data().metrics);
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { metrics, loading, error };
};