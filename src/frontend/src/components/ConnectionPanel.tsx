import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plug, PlugZap, AlertCircle, ShieldAlert } from 'lucide-react';
import { useWebSerial } from '../hooks/useWebSerial';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ConnectionPanel() {
  const { status, connect, disconnect, error } = useWebSerial();

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            <PlugZap className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary">
            <Plug className="mr-1 h-3 w-3 animate-pulse" />
            Connecting...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Plug className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  const isSecureContextError = error?.includes('HTTPS') || error?.includes('secure context');
  const isBrowserCompatError = error?.includes('not supported') || error?.includes('Chromium');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {getStatusBadge()}
        {status === 'connected' ? (
          <Button onClick={disconnect} variant="outline" size="sm">
            Disconnect
          </Button>
        ) : (
          <Button onClick={connect} size="sm" disabled={status === 'connecting'}>
            Connect Device
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          {isSecureContextError ? (
            <ShieldAlert className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle className="font-semibold">
            {isSecureContextError
              ? 'HTTPS Required'
              : isBrowserCompatError
                ? 'Browser Not Supported'
                : 'Connection Error'}
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">{error}</AlertDescription>
          {isSecureContextError && (
            <AlertDescription className="mt-2 text-xs opacity-80">
              The Web Serial API requires a secure connection. Make sure you're accessing this app via HTTPS.
            </AlertDescription>
          )}
          {isBrowserCompatError && (
            <AlertDescription className="mt-2 text-xs opacity-80">
              Try using Chrome, Edge, or Opera browser for Web Serial API support.
            </AlertDescription>
          )}
        </Alert>
      )}
    </div>
  );
}
