import { useEffect, useRef, useState } from 'react';

const IDLE_EVENTS = [
  'mousemove', 'mousedown', 'keydown',
  'touchstart', 'touchmove', 'scroll', 'click',
] as const;

/**
 * Returns `true` when the user has been idle for `timeoutMs` milliseconds.
 * Resets automatically on any interaction.
 */
export const useIdleTimer = (timeoutMs: number = 2 * 60 * 1000) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const reset = () => {
      setIsIdle(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    IDLE_EVENTS.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // kick off the timer immediately

    return () => {
      clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach(e => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);

  return isIdle;
};
