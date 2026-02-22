import { useState, useCallback, useRef, useEffect } from 'react';
import { useCommandHistory } from './useCommandHistory';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface UseWebSerialReturn {
  status: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendCommand: (command: string) => Promise<void>;
  sendCommands: (commands: string[]) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  lastResponse: string | null;
}

export function useWebSerial(): UseWebSerialReturn {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter<Uint8Array> | null>(null);
  const { addCommand, addResponse } = useCommandHistory();

  // Read responses from the device
  const startReading = useCallback(async () => {
    if (!portRef.current?.readable) return;

    try {
      const reader = portRef.current.readable.getReader();
      readerRef.current = reader;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            setLastResponse(trimmed);
            addResponse(trimmed);
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'NetworkError') {
        console.error('Read error:', err);
      }
    } finally {
      readerRef.current?.releaseLock();
      readerRef.current = null;
    }
  }, [addResponse]);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);

      // Check if the page is served over HTTPS (secure context)
      if (!window.isSecureContext) {
        throw new Error(
          'Web Serial API requires HTTPS. Please access this application over HTTPS to connect to your laser engraver.'
        );
      }

      // Check if Web Serial API is supported
      if (!('serial' in navigator) || !navigator.serial) {
        throw new Error(
          'Web Serial API is not supported in this browser. Please use a Chromium-based browser like Chrome, Edge, or Opera.'
        );
      }

      // Request a port
      const port = await navigator.serial.requestPort();
      portRef.current = port;

      // Open the port with common settings for laser engravers
      await port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });

      // Get writer
      if (port.writable) {
        writerRef.current = port.writable.getWriter();
      }

      setStatus('connected');

      // Start reading responses
      startReading();
    } catch (err) {
      let message = 'Failed to connect to device';

      if (err instanceof Error) {
        // Handle specific error types with user-friendly messages
        if (err.message.includes('Web Serial API requires HTTPS')) {
          message = err.message;
        } else if (err.message.includes('not supported')) {
          message = err.message;
        } else if (err.name === 'NotAllowedError' || err.message.includes('permissions policy')) {
          message =
            'Permission denied. The Web Serial API requires HTTPS and proper permissions. Please ensure you are accessing this app over HTTPS.';
        } else if (err.name === 'NotFoundError') {
          message = 'No device selected. Please select a serial port to connect.';
        } else if (err.name === 'SecurityError') {
          message =
            'Security error: Web Serial API access is blocked. Please check your browser settings and ensure the page is served over HTTPS.';
        } else if (err.name === 'NetworkError') {
          message = 'Failed to open the serial port. The device may be in use by another application.';
        } else {
          message = err.message;
        }
      }

      setError(message);
      setStatus('error');
      console.error('Connection error:', err);
    }
  }, [startReading]);

  const disconnect = useCallback(async () => {
    try {
      // Cancel reader
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }

      // Release writer
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
      }

      // Close port
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setStatus('disconnected');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(message);
      console.error('Disconnect error:', err);
    }
  }, []);

  const sendCommand = useCallback(
    async (command: string) => {
      if (!writerRef.current || status !== 'connected') {
        throw new Error('Not connected to device');
      }

      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(command + '\n');
        await writerRef.current.write(data);
        addCommand(command);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to send command';
        setError(message);
        throw err;
      }
    },
    [status, addCommand]
  );

  const sendCommands = useCallback(
    async (commands: string[]) => {
      for (const command of commands) {
        await sendCommand(command);
        // Small delay between commands
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    },
    [sendCommand]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (portRef.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    status,
    connect,
    disconnect,
    sendCommand,
    sendCommands,
    isConnected: status === 'connected',
    error,
    lastResponse,
  };
}
