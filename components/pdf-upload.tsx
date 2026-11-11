"use client";

import { useCallback, useState } from "react";
import { Upload, File as FileIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

interface PDFUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
  processingMessage?: string;
  selectedFileName?: string | null;
}

export function PDFUpload({
  onFileSelect,
  isProcessing = false,
  processingMessage = "Processing your PDF...",
  selectedFileName = null,
}: PDFUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSelect = useCallback(
    (file: File | undefined) => {
      if (!file || isProcessing) return;

      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");

      if (!isPdf) {
        toast.error("Please select a valid PDF file.");
        return;
      }

      if (file.size === 0) {
        toast.error("The selected PDF file is empty.");
        return;
      }

      if (file.size > MAX_PDF_SIZE_BYTES) {
        toast.error(
          `PDF size must be less than 50MB (file is ${(
            file.size /
            (1024 * 1024)
          ).toFixed(1)}MB).`
        );
        return;
      }

      onFileSelect(file);
    },
    [isProcessing, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isProcessing) {
        setIsDragging(true);
      }
    },
    [isProcessing]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSelect(files[0]);
      }
    },
    [validateAndSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSelect(files[0]);
      }
      // Reset input so re-uploading the same file works if needed
      e.target.value = "";
    },
    [validateAndSelect]
  );

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4 sm:p-8">
      <Card
        className={`max-w-2xl w-full p-8 sm:p-12 text-center border-2 transition-colors ${
          isDragging ? "border-primary bg-accent" : "border-dashed"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="upload-dropzone"
      >
        <div className="flex flex-col items-center gap-6">
          <div
            className={`p-6 rounded-full ${
              isDragging || isProcessing ? "bg-primary/10" : "bg-muted"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            ) : isDragging ? (
              <FileIcon className="w-16 h-16 text-primary" />
            ) : (
              <Upload className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-semibold">
              {isProcessing ? "Processing PDF..." : "Upload PDF to Edit"}
            </h1>
            <p className="text-muted-foreground text-base">
              {isProcessing
                ? processingMessage
                : "Drag and drop your PDF file here, or click to browse"}
            </p>
            {isProcessing && selectedFileName && (
              <p className="text-sm font-medium text-foreground truncate max-w-md mx-auto">
                {selectedFileName}
              </p>
            )}
          </div>

          {!isProcessing && (
            <div className="flex flex-col items-center gap-3">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="pdf-file-input"
                data-testid="input-file"
              />
              <label htmlFor="pdf-file-input">
                <Button asChild size="lg" data-testid="button-browse">
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
              <p className="text-xs text-muted-foreground">
                Supported format: PDF (max 50MB)
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
