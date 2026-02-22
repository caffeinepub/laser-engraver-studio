import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileCode } from 'lucide-react';
import { useGCodeFileUpload } from '../hooks/useGCodeFileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GCodeFileUploadPanelProps {
  onGCodeLoad: (gcode: string) => void;
}

export function GCodeFileUploadPanel({ onGCodeLoad }: GCodeFileUploadPanelProps) {
  const { gcode, metadata, uploadFile, clearFile, isLoading, error } = useGCodeFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleClear = () => {
    clearFile();
    onGCodeLoad('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update parent when G-code changes
  if (gcode) {
    onGCodeLoad(gcode);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload G-code File</CardTitle>
        <CardDescription>Select a .gcode, .nc, or .txt file to send to the device</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!gcode ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
            <FileCode className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              Click to upload G-code file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".gcode,.nc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Select File'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{metadata?.fileName}</p>
                <p className="text-muted-foreground">
                  {metadata?.lineCount} lines • {((metadata?.fileSize || 0) / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button onClick={handleClear} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="h-[200px] rounded-lg border border-border bg-muted/20 p-4">
              <pre className="text-xs font-mono">{gcode}</pre>
            </ScrollArea>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
