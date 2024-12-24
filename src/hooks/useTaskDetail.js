// src/hooks/useTaskDetails.js
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTaskDetails = (taskId) => {
  const [taskDetails, setTaskDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      return;
    }

    const taskRef = doc(db, 'tasks', taskId);
    const unsubscribe = onSnapshot(
      taskRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setTaskDetails({
            id: doc.id,
            ...data,
            notes: (data.notes || [])
              .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
              .map(note => ({
                ...note,
                createdAt: note.createdAt?.toDate()
              })),
            history: (data.history || [])
              .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
              .map(event => ({
                ...event,
                createdAt: event.createdAt?.toDate()
              })),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          });
          setError(null);
        } else {
          setError('Task not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching task details:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [taskId]);

  return { taskDetails, loading, error };
};

export default useTaskDetails;