// src/hooks/useProjects.js
import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { authService } from '../firebase/auth';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Remove the team filter to get all projects
    const q = query(collection(db, 'projects'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));

        // Sort projects by creation date (newest first)
        projectsData.sort((a, b) => b.createdAt - a.createdAt);
        
        setProjects(projectsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching projects:', error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { projects, loading, error };
};

export default useProjects;