// src/hooks/useUserDetails.js
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useUserDetails = (userIds = []) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userPromises = userIds.map(async (userId) => {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              id: userDoc.id,
              initials: userData.initials || userData.name?.charAt(0) || 'U',
              avatarColor: userData.avatarColor || 'blue',
              name: userData.name,
              role: userData.role
            };
          }
          return null;
        });

        const fetchedUsers = (await Promise.all(userPromises)).filter(Boolean);
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userIds.length > 0) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [userIds.join(',')]); // Join userIds to prevent unnecessary rerenders

  return { users, loading, error };
};