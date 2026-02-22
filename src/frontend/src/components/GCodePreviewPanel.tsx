import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileCode, Clock } from 'lucide-react';
import { useMemo } from 'react';

interface GCodePreviewPanelProps {
  gcode: string;
}

export function GCodePreviewPanel({ gcode }: GCodePreviewPanelProps) {
  const metadata = useMemo(() => {
    if (!gcode) return null;

    const lines = gcode.split('\n').filter((line) => line.trim() && !line.startsWith(';'));
    const lineCount = lines.length;

    // Rough time estimate based on line count
    const estimatedMinutes = Math.ceil(lineCount / 100);

    return {
      lineCount,
      estimatedMinutes,
    };
  }, [gcode]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>G-code Preview</CardTitle>
            <CardDescription>Generated commands ready to send</CardDescription>
          </div>
          {metadata && (
            <div className="flex gap-2">
              <Badge variant="secondary">
                <FileCode className="mr-1 h-3 w-3" />
                {metadata.lineCount} lines
              </Badge>
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                ~{metadata.estimatedMinutes} min
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {gcode ? (
          <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/20 p-4">
            <pre className="text-xs font-mono leading-relaxed">{gcode}</pre>
          </ScrollArea>
        ) : (
          <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">
              No G-code generated yet. Upload an image or G-code file to begin.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
