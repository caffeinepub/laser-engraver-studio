import { create } from 'zustand';

export type JobStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

interface JobProgressState {
  status: JobStatus;
  currentLine: number;
  totalLines: number;
  startTime: number | null;
  pausedTime: number;
  error: string | null;
  
  start: (totalLines: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  updateProgress: (currentLine: number) => void;
  setError: (error: string) => void;
  reset: () => void;
  
  // Computed values
  percentage: number;
  estimatedTimeRemaining: number | null;
  elapsedTime: number;
}

export const useJobProgress = create<JobProgressState>((set, get) => ({
  status: 'idle',
  currentLine: 0,
  totalLines: 0,
  startTime: null,
  pausedTime: 0,
  error: null,
  percentage: 0,
  estimatedTimeRemaining: null,
  elapsedTime: 0,

  start: (totalLines: number) =>
    set({
      status: 'running',
      currentLine: 0,
      totalLines,
      startTime: Date.now(),
      pausedTime: 0,
      error: null,
    }),

  pause: () =>
    set((state) => ({
      status: 'paused',
      pausedTime: state.pausedTime + (Date.now() - (state.startTime || Date.now())),
    })),

  resume: () =>
    set({
      status: 'running',
      startTime: Date.now(),
    }),

  stop: () =>
    set({
      status: 'idle',
      currentLine: 0,
      totalLines: 0,
      startTime: null,
      pausedTime: 0,
      error: null,
    }),

  updateProgress: (currentLine: number) =>
    set((state) => {
      const percentage = state.totalLines > 0 ? (currentLine / state.totalLines) * 100 : 0;
      
      let estimatedTimeRemaining: number | null = null;
      let elapsedTime = 0;

      if (state.startTime && currentLine > 0) {
        elapsedTime = (Date.now() - state.startTime + state.pausedTime) / 1000;
        const timePerLine = elapsedTime / currentLine;
        const remainingLines = state.totalLines - currentLine;
        estimatedTimeRemaining = Math.ceil(timePerLine * remainingLines);
      }

      const newStatus = currentLine >= state.totalLines ? 'completed' : state.status;

      return {
        currentLine,
        percentage,
        estimatedTimeRemaining,
        elapsedTime,
        status: newStatus,
      };
    }),

  setError: (error: string) =>
    set({
      status: 'error',
      error,
    }),

  reset: () =>
    set({
      status: 'idle',
      currentLine: 0,
      totalLines: 0,
      startTime: null,
      pausedTime: 0,
      error: null,
      percentage: 0,
      estimatedTimeRemaining: null,
      elapsedTime: 0,
    }),
}));
