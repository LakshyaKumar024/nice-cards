'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Skeleton } from '@/components/ui/skeleton';
import type { TextOverlay } from './pdf-editor';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFCanvasProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  overlays: TextOverlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteOverlay: (id: string) => void;
  onAddOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
}

export function PDFCanvas({
  pdfDocument,
  pageNumber,
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlay,
  onDeleteOverlay,
  onAddOverlay,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [newOverlayId, setNewOverlayId] = useState<string | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Handle keyboard delete and enter to edit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedOverlayId) {
        event.preventDefault();
        onDeleteOverlay(selectedOverlayId);
      }
      if (event.key === 'Enter' && selectedOverlayId && !editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(selectedOverlayId);
      }
      if (event.key === 'Escape' && editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOverlayId, editingOverlayId, onDeleteOverlay]);

  // Render PDF page
  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current || !pdfDocument) return;

      setIsLoading(true);
      setError(null);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get canvas context');
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const containerWidth = containerRef.current?.clientWidth || 800;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min((containerWidth - 64) / viewport.width, 1.5);
        
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        setPageDimensions({ width: scaledViewport.width, height: scaledViewport.height });
        setPageScale(scale);

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext as any);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;
        
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error && error.message.includes('cancelled')) {
          return;
        }
        console.error('Error rendering PDF page:', error);
        setError('Failed to render PDF page');
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDocument, pageNumber]);

  // Handle double-click to add new text (original behavior)
  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    const normalizedX = x / pageDimensions.width;
    const normalizedY = y / pageDimensions.height;

    // Create new overlay on double-click
    const newOverlay: Omit<TextOverlay, 'id'> = {
      text: 'New Text',
      x: normalizedX,
      y: normalizedY,
      fontSize: 16,
      fontFamily: 'Arial',
      bold: false,
      italic: false,
      color: '#000000',
      page: pageNumber,
      visible: true,
      zIndex: overlays.length,
    };
    
    // Add the overlay and get the generated ID
    onAddOverlay(newOverlay);
    
    // We'll set the editing state when the overlay is actually created in the parent
  }, [pageDimensions, pageNumber, overlays.length, isLoading, onAddOverlay]);

  // Handle single click to select
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading || isDragging) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    const clickedOverlay = overlays.find(overlay => 
      overlay.page === pageNumber &&
      Math.abs(overlay.x * pageDimensions.width - x) < 50 &&
      Math.abs(overlay.y * pageDimensions.height - y) < 20
    );

    if (clickedOverlay) {
      onSelectOverlay(clickedOverlay.id);
      setEditingOverlayId(null); // Stop editing when selecting another overlay
    } else {
      onSelectOverlay(null);
      setEditingOverlayId(null); // Stop editing when clicking empty space
    }
  }, [overlays, pageNumber, pageDimensions, isLoading, isDragging, onSelectOverlay]);

  const handleDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
    event.stopPropagation();
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;

    setIsDragging(true);
    onSelectOverlay(overlayId);
    setEditingOverlayId(null); // Stop editing when dragging
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragOffset({
      x: event.clientX - centerX,
      y: event.clientY - centerY
    });
  }, [overlays, onSelectOverlay]);

  const handleDrag = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !selectedOverlayId || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left - dragOffset.x);
    const y = (event.clientY - rect.top - dragOffset.y);

    const normalizedX = Math.max(0, Math.min(1, x / pageDimensions.width));
    const normalizedY = Math.max(0, Math.min(1, y / pageDimensions.height));

    onUpdateOverlay(selectedOverlayId, {
      x: normalizedX,
      y: normalizedY
    });
  }, [isDragging, selectedOverlayId, dragOffset, pageDimensions, onUpdateOverlay]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Handle inline text editing
  const handleTextChange = useCallback((id: string, newText: string) => {
    onUpdateOverlay(id, { text: newText });
  }, [onUpdateOverlay]);

  const handleTextBlur = useCallback(() => {
    setEditingOverlayId(null);
  }, []);

  // Start editing when a new overlay is selected
  useEffect(() => {
    if (selectedOverlayId && !editingOverlayId) {
      // Check if this is a newly created overlay (starts with "overlay-" and was just selected)
      const overlay = overlays.find(o => o.id === selectedOverlayId);
      if (overlay && overlay.text === 'New Text') {
        setEditingOverlayId(selectedOverlayId);
      }
    }
  }, [selectedOverlayId, editingOverlayId, overlays]);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (event: MouseEvent) => {
        handleDrag(event as unknown as React.MouseEvent);
      };

      const handleMouseUp = () => {
        handleDragEnd();
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  const currentPageOverlays = overlays
    .filter(overlay => overlay.page === pageNumber)
    .sort((a, b) => a.zIndex - b.zIndex);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center">
      <div className="relative">
        {isLoading && (
          <Skeleton className="w-[612px] h-[792px]" />
        )}
        
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          className={`border border-gray-300 shadow-lg cursor-crosshair ${
            isLoading ? 'hidden' : 'block'
          }`}
        />
        
        {!isLoading && currentPageOverlays.map((overlay) => (
          <div
            key={overlay.id}
            className={`absolute cursor-move p-1 ${
              selectedOverlayId === overlay.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 bg-opacity-50' 
                : 'hover:ring-1 hover:ring-gray-400'
            } ${overlay.visible ? '' : 'opacity-30'}`}
            style={{
              left: `${overlay.x * pageDimensions.width}px`,
              top: `${overlay.y * pageDimensions.height}px`,
              fontSize: `${overlay.fontSize}px`,
              fontFamily: overlay.fontFamily,
              fontWeight: overlay.bold ? 'bold' : 'normal',
              fontStyle: overlay.italic ? 'italic' : 'normal',
              color: overlay.color,
              zIndex: overlay.zIndex + 10,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'auto',
              maxWidth: `${pageDimensions.width * 0.8}px`,
              wordBreak: 'break-word',
            }}
            onMouseDown={(e) => handleDragStart(e, overlay.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOverlay(overlay.id);
            }}
          >
            {editingOverlayId === overlay.id ? (
              <input
                type="text"
                value={overlay.text}
                onChange={(e) => handleTextChange(overlay.id, e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextBlur();
                  }
                }}
                className="bg-transparent border-none outline-none min-w-[60px]"
                autoFocus
                style={{
                  fontFamily: overlay.fontFamily,
                  fontSize: `${overlay.fontSize}px`,
                  fontWeight: overlay.bold ? 'bold' : 'normal',
                  fontStyle: overlay.italic ? 'italic' : 'normal',
                  color: overlay.color,
                }}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingOverlayId(overlay.id);
                }}
              >
                {overlay.text}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}