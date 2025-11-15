import { useCallback, useState } from 'react';
import { Upload, File as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
}

export function PDFUpload({ onFileSelect }: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card 
        className={`max-w-2xl w-full p-12 text-center border-2 transition-colors ${
          isDragging ? 'border-primary bg-accent' : 'border-dashed'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-dropzone"
      >
        <div className="flex flex-col items-center gap-6">
          <div className={`p-6 rounded-full ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
            {isDragging ? (
              <FileIcon className="w-16 h-16 text-primary" />
            ) : (
              <Upload className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Upload PDF Document</h2>
            <p className="text-muted-foreground text-base">
              Drag and drop your PDF file here, or click to browse
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              className="hidden"
              id="pdf-file-input"
              data-testid="input-file"
            />
            <label htmlFor="pdf-file-input">
              <Button asChild size="lg" data-testid="button-browse">
                <span className="cursor-pointer">
                  Browse Files
                </span>
              </Button>
            </label>
            <p className="text-xs text-muted-foreground">
              Supported format: PDF (max 50MB)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
