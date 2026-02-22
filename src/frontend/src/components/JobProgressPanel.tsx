import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Loader2 } from 'lucide-react';
import { useJobProgress } from '../hooks/useJobProgress';
import { useGCodeSender } from '../hooks/useGCodeSender';
import { useWebSerial } from '../hooks/useWebSerial';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface JobProgressPanelProps {
  gcode: string;
}

export function JobProgressPanel({ gcode }: JobProgressPanelProps) {
  const { status, currentLine, totalLines, percentage, estimatedTimeRemaining, error } =
    useJobProgress();
  const { startJob, pauseJob, resumeJob, stopJob } = useGCodeSender();
  const { isConnected } = useWebSerial();

  const handleStart = async () => {
    if (!isConnected) {
      toast.error('Not connected to device');
      return;
    }

    if (!gcode) {
      toast.error('No G-code to send');
      return;
    }

    try {
      await startJob(gcode);
      toast.success('Job started');
    } catch (err) {
      toast.error('Failed to start job');
    }
  };

  const handlePause = () => {
    pauseJob();
    toast.info('Job paused');
  };

  const handleResume = () => {
    resumeJob();
    toast.success('Job resumed');
  };

  const handleStop = () => {
    stopJob();
    toast.warning('Job stopped');
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Progress</CardTitle>
        <CardDescription>Monitor engraving progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Line {currentLine} / {totalLines}
            </span>
            <span>ETA: {formatTime(estimatedTimeRemaining)}</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {status === 'idle' || status === 'completed' ? (
            <Button
              onClick={handleStart}
              disabled={!isConnected || !gcode}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Job
            </Button>
          ) : status === 'running' ? (
            <>
              <Button onClick={handlePause} variant="outline" className="flex-1">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button onClick={handleStop} variant="destructive" className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          ) : status === 'paused' ? (
            <>
              <Button onClick={handleResume} className="flex-1 bg-green-600 hover:bg-green-700">
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button onClick={handleStop} variant="destructive" className="flex-1">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          ) : null}
        </div>

        {status === 'running' && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Engraving in progress...</span>
          </div>
        )}

        {status === 'completed' && (
          <div className="rounded-lg bg-green-600/10 p-3 text-center text-sm font-medium text-green-600">
            Job completed successfully!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
