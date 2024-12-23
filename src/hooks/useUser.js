// src/hooks/useUser.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, collection, query, getDocs, serverTimestamp } from 'firebase/firestore';
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
            setUserData({ 
              id: doc.id, 
              ...doc.data(),
              currentProject: doc.data().currentProject || null 
            });
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
        await updateDoc(userDoc, {
          ...updates,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        throw new Error(error.message);
      }
    };
  
    const setCurrentProject = async (projectId) => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) throw new Error('No authenticated user');
  
        const userDoc = doc(db, 'users', currentUser.uid);
        await updateDoc(userDoc, {
          currentProject: projectId,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        throw new Error('Failed to update current project: ' + error.message);
      }
    };
  
    const getCurrentProject = () => userData?.currentProject || null;
  
    return { 
      userData, 
      loading, 
      error, 
      updateUserProfile, 
      setCurrentProject,
      getCurrentProject 
    };
  };

  
// Hook for user metrics
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

// New hook for fetching all users
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          initials: doc.data().name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
        }));
        
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to get user details by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // Function to get multiple users by IDs
  const getUsersByIds = (userIds) => {
    return users.filter(user => userIds.includes(user.id));
  };

  return { users, loading, error, getUserById, getUsersByIds };
};