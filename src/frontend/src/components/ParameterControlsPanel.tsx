import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { useGCodeGeneration, type GenerationMethod } from '../hooks/useGCodeGeneration';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParameterControlsPanelProps {
  imageData: ImageData;
  onGCodeGenerated: (gcode: string) => void;
}

export function ParameterControlsPanel({ imageData, onGCodeGenerated }: ParameterControlsPanelProps) {
  const [method, setMethod] = useState<GenerationMethod>('line-scan');
  const [laserPower, setLaserPower] = useState(80);
  const [speed, setSpeed] = useState(1000);
  const [resolution, setResolution] = useState(10);

  const { gcode, generate, isGenerating, error } = useGCodeGeneration();

  const handleGenerate = async () => {
    await generate(imageData, {
      method,
      laserPower,
      speed,
      resolution,
    });
  };

  // Update parent when G-code is generated
  useEffect(() => {
    if (gcode) {
      onGCodeGenerated(gcode);
    }
  }, [gcode, onGCodeGenerated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Parameters</CardTitle>
        <CardDescription>Configure laser settings and generation method</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Generation Method</Label>
          <Select value={method} onValueChange={(v) => setMethod(v as GenerationMethod)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line-scan">Line Scan (Raster)</SelectItem>
              <SelectItem value="vector-trace">Vector Trace (Contour)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {method === 'line-scan'
              ? 'Scans image line by line, best for photos and gradients'
              : 'Traces edges and contours, best for logos and line art'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Laser Power</Label>
            <span className="text-sm font-medium text-muted-foreground">{laserPower}%</span>
          </div>
          <Slider
            value={[laserPower]}
            onValueChange={(v) => setLaserPower(v[0])}
            min={1}
            max={100}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Maximum laser power (2.5W at 100%)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Engraving Speed</Label>
            <span className="text-sm font-medium text-muted-foreground">{speed} mm/min</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={(v) => setSpeed(v[0])}
            min={100}
            max={3000}
            step={100}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher speed = faster but lighter engraving
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Resolution</Label>
            <span className="text-sm font-medium text-muted-foreground">{resolution} DPI</span>
          </div>
          <Slider
            value={[resolution]}
            onValueChange={(v) => setResolution(v[0])}
            min={5}
            max={20}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher resolution = more detail but slower
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate G-code
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
