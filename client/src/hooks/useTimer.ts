'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseTimerOptions {
  duration: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer({ duration, onComplete, autoStart = false }: UseTimerOptions) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef(onComplete);

  callbackRef.current = onComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setIsRunning(true);
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(
    (newDuration?: number) => {
      clearTimer();
      setTimeLeft(newDuration ?? duration);
      setIsRunning(false);
    },
    [clearTimer, duration]
  );

  const restart = useCallback(
    (newDuration?: number) => {
      clearTimer();
      setTimeLeft(newDuration ?? duration);
      setIsRunning(true);
    },
    [clearTimer, duration]
  );

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          callbackRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return {
    timeLeft,
    isRunning,
    progress,
    start,
    pause,
    reset,
    restart,
  };
}
