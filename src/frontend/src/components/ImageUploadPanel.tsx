import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../hooks/useImageUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploadPanelProps {
  onImageLoad: (imageData: ImageData | null) => void;
}

export function ImageUploadPanel({ onImageLoad }: ImageUploadPanelProps) {
  const { imageUrl, imageData, metadata, uploadImage, clearImage, isLoading, error } =
    useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const handleClear = () => {
    clearImage();
    onImageLoad(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update parent when image data changes
  if (imageData && imageData !== null) {
    onImageLoad(imageData);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>Select a JPG or PNG image to convert to G-code</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!imageUrl ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 p-8">
            <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              variant="outline"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isLoading ? 'Loading...' : 'Select Image'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img src={imageUrl} alt="Uploaded" className="h-auto w-full" />
              <Button
                onClick={handleClear}
                size="icon"
                variant="destructive"
                className="absolute right-2 top-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {metadata && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>{' '}
                  <span className="font-medium">
                    {metadata.width} × {metadata.height}px
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">File size:</span>{' '}
                  <span className="font-medium">
                    {(metadata.fileSize / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            )}
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
