'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Client-side game clock.
 *
 * @param clockSeconds - The server-side clock value (seconds)
 * @param clockRunning - Whether the clock is actively running
 * @param clockStartedAt - Timestamp when the clock started (ISO string or epoch ms)
 * @param direction - 'down' for countdown (basketball), 'up' for count-up (football)
 *
 * Uses clockStartedAt to compute the current time, then ticks every second
 * while clockRunning is true. Re-syncs whenever the server pushes a new state.
 */
export function useGameClock(
  clockSeconds: number,
  clockRunning: boolean,
  clockStartedAt?: string | number,
  direction: 'down' | 'up' = 'down'
): number {
  const [display, setDisplay] = useState(clockSeconds);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync from server state whenever it changes
  useEffect(() => {
    if (!clockRunning || !clockStartedAt) {
      // Clock is paused or never started — just show server value
      setDisplay(clockSeconds);
      return;
    }

    // Calculate elapsed since the clock started on the server
    const startedAt =
      typeof clockStartedAt === 'number'
        ? clockStartedAt
        : new Date(clockStartedAt).getTime();
    const elapsedMs = Date.now() - startedAt;
    const elapsedSec = Math.floor(elapsedMs / 1000);

    if (direction === 'down') {
      setDisplay(Math.max(0, clockSeconds - elapsedSec));
    } else {
      setDisplay(clockSeconds + elapsedSec);
    }
  }, [clockSeconds, clockRunning, clockStartedAt, direction]);

  // Tick every second while the clock is running
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    if (!clockRunning) return;

    intervalRef.current = setInterval(() => {
      if (direction === 'down') {
        setDisplay((prev) => Math.max(0, prev - 1));
      } else {
        setDisplay((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [clockRunning, direction]);

  return display;
}
