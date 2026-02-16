import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { metricsService } from '../firebase/metricsService';

export const useMetrics = (userId) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Trigger a fresh calculation on mount
    metricsService.calculateAndStoreMetrics(userId).catch((err) => {
      console.error('Failed to calculate metrics:', err);
    });

    // Listen to the metrics document for real-time updates
    const unsub = onSnapshot(
      doc(db, 'metrics', userId),
      (snap) => {
        if (snap.exists()) {
          setMetrics(snap.data());
        } else {
          setMetrics(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [userId]);

  return { metrics, loading, error };
};
