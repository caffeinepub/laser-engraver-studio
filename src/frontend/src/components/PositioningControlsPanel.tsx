import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Crosshair, MapPin } from 'lucide-react';
import { useWebSerial } from '../hooks/useWebSerial';
import { toast } from 'sonner';

export function PositioningControlsPanel() {
  const { sendCommand, isConnected } = useWebSerial();

  const handleHome = async () => {
    if (!isConnected) {
      toast.error('Not connected to device');
      return;
    }

    try {
      await sendCommand('G28'); // Home all axes
      toast.success('Homing initiated');
    } catch (err) {
      toast.error('Failed to send home command');
    }
  };

  const handleSetOrigin = async () => {
    if (!isConnected) {
      toast.error('Not connected to device');
      return;
    }

    try {
      await sendCommand('G92 X0 Y0'); // Set current position as origin
      toast.success('Work origin set at current position');
    } catch (err) {
      toast.error('Failed to set origin');
    }
  };

  const handleAutoCenter = async () => {
    if (!isConnected) {
      toast.error('Not connected to device');
      return;
    }

    try {
      // Assuming work area is 130x130mm for Wizmaker Wand Mini
      const centerX = 65;
      const centerY = 65;
      await sendCommand(`G90 G0 X${centerX} Y${centerY} F1000`);
      toast.success('Moving to center position');
    } catch (err) {
      toast.error('Failed to center');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positioning</CardTitle>
        <CardDescription>Homing and origin controls</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          onClick={handleHome}
          disabled={!isConnected}
          variant="outline"
          className="w-full"
        >
          <Home className="mr-2 h-4 w-4" />
          Home All Axes
        </Button>
        <Button
          onClick={handleSetOrigin}
          disabled={!isConnected}
          variant="outline"
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Set Work Origin
        </Button>
        <Button
          onClick={handleAutoCenter}
          disabled={!isConnected}
          variant="outline"
          className="w-full"
        >
          <Crosshair className="mr-2 h-4 w-4" />
          Auto Center
        </Button>
      </CardContent>
    </Card>
  );
}
