import { useEffect, useRef } from 'react';

/**
 * Hook that monitors for day transitions (midnight).
 * When the current date changes compared to when the app started/last checked,
 * it performs a hard refresh to ensure all tasks and states are correctly reset for the new day.
 */
export const useDayRefresh = () => {
  const currentDayRef = useRef(new Date().toDateString());

  const checkDay = () => {
    const todayString = new Date().toDateString();

    if (todayString !== currentDayRef.current) {
      console.log(`[DayWatcher] Day transition detected: ${currentDayRef.current} -> ${todayString}. Refreshing app...`);
      currentDayRef.current = todayString;
      window.location.reload();
      return true;
    }
    return false;
  };

  useEffect(() => {
    // 1. Check periodically
    const interval = setInterval(checkDay, 30000);

    // 2. Check when returning to the app (e.g. tablet screen on)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkDay();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
