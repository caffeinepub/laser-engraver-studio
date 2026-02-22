import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { useWebSerial } from '../hooks/useWebSerial';
import { toast } from 'sonner';

export function JogControlsPanel() {
  const [jogDistance, setJogDistance] = useState('1');
  const { sendCommand, isConnected } = useWebSerial();

  const handleJog = async (axis: 'X' | 'Y', direction: 1 | -1) => {
    if (!isConnected) {
      toast.error('Not connected to device');
      return;
    }

    try {
      const distance = parseFloat(jogDistance) * direction;
      const command = `G91 G0 ${axis}${distance} F1000`;
      await sendCommand(command);
      await sendCommand('G90'); // Return to absolute positioning
    } catch (err) {
      toast.error('Failed to send jog command');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jog Controls</CardTitle>
        <CardDescription>Manual X/Y axis movement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Jog Distance</label>
          <Select value={jogDistance} onValueChange={setJogDistance}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.1">0.1 mm</SelectItem>
              <SelectItem value="1">1 mm</SelectItem>
              <SelectItem value="10">10 mm</SelectItem>
              <SelectItem value="50">50 mm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-start-2">
            <Button
              onClick={() => handleJog('Y', 1)}
              disabled={!isConnected}
              variant="outline"
              size="icon"
              className="h-12 w-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
          <div className="col-start-1">
            <Button
              onClick={() => handleJog('X', -1)}
              disabled={!isConnected}
              variant="outline"
              size="icon"
              className="h-12 w-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
          <div className="col-start-2">
            <div className="flex h-12 items-center justify-center rounded-md border border-border bg-muted text-xs font-medium text-muted-foreground">
              {jogDistance} mm
            </div>
          </div>
          <div className="col-start-3">
            <Button
              onClick={() => handleJog('X', 1)}
              disabled={!isConnected}
              variant="outline"
              size="icon"
              className="h-12 w-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="col-start-2">
            <Button
              onClick={() => handleJog('Y', -1)}
              disabled={!isConnected}
              variant="outline"
              size="icon"
              className="h-12 w-full"
            >
              <ArrowDown className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
