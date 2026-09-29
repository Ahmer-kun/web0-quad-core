import { useState, useEffect, useCallback } from 'react';

export interface EasterEgg {
  id: string;
  name: string;
  description: string;
  category: 'car' | 'bike' | 'biology' | 'behavior';
}

const STORAGE_KEY_VISITED = 'sys_diag_prior_visit';
const STORAGE_KEY_SECRETS = 'sys_diag_discovered_secrets';

export function useInteractionTracking() {
  const [clickCount, setClickCount] = useState<number>(0);
  const [discoveredSecrets, setDiscoveredSecrets] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SECRETS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [hasVisitedBefore, setHasVisitedBefore] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY_VISITED));
    } catch {
      return false;
    }
  });

  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [rapidClickWarning, setRapidClickWarning] = useState<boolean>(false);
  const [lastObservation, setLastObservation] = useState<string>('System initializing. Please do not panic.');

  // Mark visited
  useEffect(() => {
    try {
      if (!hasVisitedBefore) {
        localStorage.setItem(STORAGE_KEY_VISITED, 'true');
      }
    } catch {
      // localStorage fallback
    }
  }, [hasVisitedBefore]);

  // Save discovered secrets
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SECRETS, JSON.stringify(discoveredSecrets));
    } catch {
      // localStorage fallback
    }
  }, [discoveredSecrets]);

  // Global click tracker & rapid clicking monitor
  useEffect(() => {
    let clickTimestamps: number[] = [];
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsIdle(true);
      }, 8000); // 8 seconds of inactivity triggers idle observation
    };

    const handleGlobalClick = () => {
      setClickCount((prev) => prev + 1);
      resetIdle();

      const now = Date.now();
      clickTimestamps.push(now);
      // Keep only clicks within last 1.8 seconds
      clickTimestamps = clickTimestamps.filter((t) => now - t < 1800);

      if (clickTimestamps.length >= 6) {
        setRapidClickWarning(true);
        setLastObservation('Repeated behavior detected. Please regain composure.');
      } else {
        setRapidClickWarning(false);
      }
    };

    const handlePointerMove = () => {
      resetIdle();
    };

    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('keydown', resetIdle);

    resetIdle();

    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('keydown', resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);

  const discoverSecret = useCallback((secretId: string, customMessage?: string) => {
    setDiscoveredSecrets((prev) => {
      if (prev.includes(secretId)) return prev;
      return [...prev, secretId];
    });
    if (customMessage) {
      setLastObservation(customMessage);
    }
  }, []);

  const logObservation = useCallback((msg: string) => {
    setLastObservation(msg);
  }, []);

  return {
    clickCount,
    discoveredSecrets,
    hasVisitedBefore,
    isIdle,
    rapidClickWarning,
    lastObservation,
    discoverSecret,
    logObservation,
  };
}
