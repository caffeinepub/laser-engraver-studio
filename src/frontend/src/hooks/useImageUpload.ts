import { useState, useCallback } from 'react';

export interface ImageMetadata {
  width: number;
  height: number;
  fileName: string;
  fileSize: number;
}

export interface UseImageUploadReturn {
  imageUrl: string | null;
  imageData: ImageData | null;
  metadata: ImageMetadata | null;
  uploadImage: (file: File) => Promise<void>;
  clearImage: () => void;
  isLoading: boolean;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        throw new Error('Only JPG and PNG images are supported');
      }

      // Create object URL for preview
      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Load image to get dimensions and pixel data
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
      });

      // Create canvas to extract image data
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      setImageData(imgData);

      setMetadata({
        width: img.width,
        height: img.height,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
      console.error('Image upload error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageData(null);
    setMetadata(null);
    setError(null);
  }, [imageUrl]);

  return {
    imageUrl,
    imageData,
    metadata,
    uploadImage,
    clearImage,
    isLoading,
    error,
  };
}
