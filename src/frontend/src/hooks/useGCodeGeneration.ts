import { useState, useCallback } from 'react';
import { generateLineScanGCode } from '../utils/gcodeGenerators/lineScanGenerator';
import { generateVectorTraceGCode } from '../utils/gcodeGenerators/vectorTraceGenerator';

export type GenerationMethod = 'line-scan' | 'vector-trace';

export interface GCodeParameters {
  method: GenerationMethod;
  laserPower: number; // 0-100%
  speed: number; // mm/min
  resolution: number; // DPI
}

export interface GCodeMetadata {
  lineCount: number;
  estimatedTime: number; // seconds
}

export interface UseGCodeGenerationReturn {
  gcode: string;
  metadata: GCodeMetadata | null;
  generate: (imageData: ImageData, params: GCodeParameters) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export function useGCodeGeneration(): UseGCodeGenerationReturn {
  const [gcode, setGCode] = useState<string>('');
  const [metadata, setMetadata] = useState<GCodeMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (imageData: ImageData, params: GCodeParameters) => {
    setIsGenerating(true);
    setError(null);

    try {
      let result: string;

      if (params.method === 'line-scan') {
        result = await generateLineScanGCode(imageData, params);
      } else {
        result = await generateVectorTraceGCode(imageData, params);
      }

      setGCode(result);

      // Calculate metadata
      const lines = result.split('\n').filter((line) => line.trim() && !line.startsWith(';'));
      const lineCount = lines.length;

      // Estimate time based on line count and speed
      // Rough estimate: assume average move distance and calculate time
      const estimatedTime = Math.ceil((lineCount * 10) / (params.speed / 60));

      setMetadata({
        lineCount,
        estimatedTime,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate G-code';
      setError(message);
      console.error('G-code generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    gcode,
    metadata,
    generate,
    isGenerating,
    error,
  };
}
