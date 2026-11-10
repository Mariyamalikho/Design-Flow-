import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type LoadingListener = (state: { active: boolean; progress: number }) => void;
const listeners = new Set<LoadingListener>();

let startTimer: ReturnType<typeof setTimeout> | null = null;
let completeTimer: ReturnType<typeof setTimeout> | null = null;

export const topLoadingBar = {
  start: () => {
    if (startTimer) clearTimeout(startTimer);
    if (completeTimer) clearTimeout(completeTimer);
    listeners.forEach((l) => l({ active: true, progress: 30 }));
    startTimer = setTimeout(() => {
      listeners.forEach((l) => l({ active: true, progress: 75 }));
    }, 100);
  },
  complete: () => {
    if (startTimer) clearTimeout(startTimer);
    if (completeTimer) clearTimeout(completeTimer);
    listeners.forEach((l) => l({ active: true, progress: 100 }));
    completeTimer = setTimeout(() => {
      listeners.forEach((l) => l({ active: false, progress: 0 }));
    }, 250);
  },
};

export function TopLoadingBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Auto-trigger on route navigation
  useEffect(() => {
    setVisible(true);
    setProgress(35);

    const timer1 = setTimeout(() => {
      setProgress(80);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 200);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 380);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  // Listen for manual triggers
  useEffect(() => {
    const handleUpdate: LoadingListener = ({ active, progress: p }) => {
      if (active) {
        setVisible(true);
        setProgress(p);
      } else {
        setVisible(false);
        setProgress(0);
      }
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-label="Navigation progress indicator"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      data-testid="top-loading-bar"
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] pointer-events-none overflow-hidden"
    >
      <div
        className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "200ms",
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
