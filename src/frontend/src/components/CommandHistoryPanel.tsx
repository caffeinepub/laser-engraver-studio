import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Terminal } from 'lucide-react';
import { useCommandHistory } from '../hooks/useCommandHistory';

export function CommandHistoryPanel() {
  const { entries, clear } = useCommandHistory();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Command History</CardTitle>
            <CardDescription>Sent commands and device responses</CardDescription>
          </div>
          <Button onClick={clear} variant="ghost" size="icon" disabled={entries.length === 0}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20">
            <div className="text-center">
              <Terminal className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No commands sent yet</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[300px] rounded-lg border border-border bg-muted/20 p-4">
            <div className="space-y-2 font-mono text-xs">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-2 ${
                    entry.type === 'command'
                      ? 'text-blue-400'
                      : entry.type === 'error'
                        ? 'text-red-400'
                        : 'text-green-400'
                  }`}
                >
                  <span className="text-muted-foreground">[{formatTime(entry.timestamp)}]</span>
                  <span className="font-semibold">
                    {entry.type === 'command' ? '>' : entry.type === 'error' ? '!' : '<'}
                  </span>
                  <span className="flex-1">{entry.content}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
