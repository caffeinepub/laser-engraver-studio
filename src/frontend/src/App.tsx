import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionPanel } from './components/ConnectionPanel';
import { ImageUploadPanel } from './components/ImageUploadPanel';
import { GCodeFileUploadPanel } from './components/GCodeFileUploadPanel';
import { ParameterControlsPanel } from './components/ParameterControlsPanel';
import { GCodePreviewPanel } from './components/GCodePreviewPanel';
import { JogControlsPanel } from './components/JogControlsPanel';
import { PositioningControlsPanel } from './components/PositioningControlsPanel';
import { JobProgressPanel } from './components/JobProgressPanel';
import { CommandHistoryPanel } from './components/CommandHistoryPanel';
import { Zap } from 'lucide-react';

function App() {
  const [generatedGCode, setGeneratedGCode] = useState<string>('');
  const [uploadedGCode, setUploadedGCode] = useState<string>('');
  const [imageData, setImageData] = useState<ImageData | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Laser Engraver Studio</h1>
                <p className="text-sm text-muted-foreground">Wizmaker Wand Mini Control</p>
              </div>
            </div>
            <ConnectionPanel />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Input & Parameters */}
          <div className="space-y-6 lg:col-span-2">
            {/* Input Section */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Input</h2>
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Image to G-code</TabsTrigger>
                  <TabsTrigger value="gcode">Upload G-code</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="space-y-4">
                  <ImageUploadPanel onImageLoad={setImageData} />
                  {imageData && (
                    <ParameterControlsPanel
                      imageData={imageData}
                      onGCodeGenerated={setGeneratedGCode}
                    />
                  )}
                </TabsContent>
                <TabsContent value="gcode">
                  <GCodeFileUploadPanel onGCodeLoad={setUploadedGCode} />
                </TabsContent>
              </Tabs>
            </section>

            {/* G-code Preview */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">G-code Preview</h2>
              <GCodePreviewPanel gcode={generatedGCode || uploadedGCode} />
            </section>

            {/* Manual Controls */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Manual Controls</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <JogControlsPanel />
                <PositioningControlsPanel />
              </div>
            </section>
          </div>

          {/* Right Column - Job Control & Monitoring */}
          <div className="space-y-6">
            {/* Job Progress */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Job Control</h2>
              <JobProgressPanel gcode={generatedGCode || uploadedGCode} />
            </section>

            {/* Command History */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold">Console</h2>
              <CommandHistoryPanel />
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} Laser Engraver Studio</p>
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
