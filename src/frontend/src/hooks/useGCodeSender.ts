import { useCallback, useRef } from 'react';
import { useWebSerial } from './useWebSerial';
import { useJobProgress } from './useJobProgress';

export interface UseGCodeSenderReturn {
  startJob: (gcode: string) => Promise<void>;
  pauseJob: () => void;
  resumeJob: () => void;
  stopJob: () => void;
  isSending: boolean;
}

export function useGCodeSender(): UseGCodeSenderReturn {
  const { sendCommand, isConnected } = useWebSerial();
  const { start, pause, resume, stop, updateProgress, setError, status } = useJobProgress();
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  const startJob = useCallback(
    async (gcode: string) => {
      if (!isConnected) {
        setError('Not connected to device');
        return;
      }

      // Parse G-code lines
      const lines = gcode
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith(';'));

      if (lines.length === 0) {
        setError('No valid G-code commands found');
        return;
      }

      // Reset state
      isPausedRef.current = false;
      isCancelledRef.current = false;
      start(lines.length);

      try {
        for (let i = 0; i < lines.length; i++) {
          // Check if cancelled
          if (isCancelledRef.current) {
            break;
          }

          // Wait while paused
          while (isPausedRef.current && !isCancelledRef.current) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          // Send command
          await sendCommand(lines[i]);
          updateProgress(i + 1);

          // Small delay between commands
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send G-code';
        setError(message);
      }
    },
    [isConnected, sendCommand, start, updateProgress, setError]
  );

  const pauseJob = useCallback(() => {
    if (status === 'running') {
      isPausedRef.current = true;
      pause();
    }
  }, [status, pause]);

  const resumeJob = useCallback(() => {
    if (status === 'paused') {
      isPausedRef.current = false;
      resume();
    }
  }, [status, resume]);

  const stopJob = useCallback(() => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    stop();
  }, [stop]);

  return {
    startJob,
    pauseJob,
    resumeJob,
    stopJob,
    isSending: status === 'running' || status === 'paused',
  };
}
