import { useState, useCallback } from 'react';

export interface GCodeFileMetadata {
  fileName: string;
  lineCount: number;
  fileSize: number;
}

export interface UseGCodeFileUploadReturn {
  gcode: string;
  metadata: GCodeFileMetadata | null;
  uploadFile: (file: File) => Promise<void>;
  clearFile: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useGCodeFileUpload(): UseGCodeFileUploadReturn {
  const [gcode, setGCode] = useState<string>('');
  const [metadata, setMetadata] = useState<GCodeFileMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file extension
      const validExtensions = ['.gcode', '.nc', '.txt'];
      const hasValidExtension = validExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidExtension) {
        throw new Error('Only .gcode, .nc, and .txt files are supported');
      }

      // Read file content
      const content = await file.text();
      setGCode(content);

      // Calculate metadata
      const lines = content.split('\n').filter((line) => line.trim() && !line.startsWith(';'));

      setMetadata({
        fileName: file.name,
        lineCount: lines.length,
        fileSize: file.size,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      setError(message);
      console.error('File upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setGCode('');
    setMetadata(null);
    setError(null);
  }, []);

  return {
    gcode,
    metadata,
    uploadFile,
    clearFile,
    isLoading,
    error,
  };
}
