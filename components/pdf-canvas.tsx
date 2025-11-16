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
  onAddOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
}

export function PDFCanvas({
  pdfDocument,
  pageNumber,
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlay,
  onAddOverlay,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageScale, setPageScale] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Handle keyboard for editing only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [selectedOverlayId, editingOverlayId]);

  // Render PDF page - ORIGINAL SCALING
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

        // ORIGINAL SCALING - Fixed scale like your initial version
        const scale = 1.5; // Fixed scale as in your original code
        
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        setPageDimensions({ width: scaledViewport.width, height: scaledViewport.height });
        setPageScale(scale);

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext);
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

  // Handle double-click to add new text
  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    const normalizedX = x / pageDimensions.width;
    const normalizedY = y / pageDimensions.height;

    const newOverlay: Omit<TextOverlay, 'id'> = {
      text: '', // Start with empty text
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
    
    onAddOverlay(newOverlay);
  }, [pageDimensions, pageNumber, overlays.length, isLoading, onAddOverlay]);

  // Handle single click to select
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading) return;

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
      setEditingOverlayId(null);
    } else {
      onSelectOverlay(null);
      setEditingOverlayId(null);
    }
  }, [overlays, pageNumber, pageDimensions, isLoading, onSelectOverlay]);

  const handleDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
    event.stopPropagation();
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;

    onSelectOverlay(overlayId);
    setEditingOverlayId(null);
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dragOffset = {
      x: event.clientX - centerX,
      y: event.clientY - centerY
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();
      
      const newX = (moveEvent.clientX - canvasRect.left - dragOffset.x);
      const newY = (moveEvent.clientY - canvasRect.top - dragOffset.y);

      const normalizedX = Math.max(0, Math.min(1, newX / pageDimensions.width));
      const normalizedY = Math.max(0, Math.min(1, newY / pageDimensions.height));

      onUpdateOverlay(overlayId, {
        x: normalizedX,
        y: normalizedY
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay]);

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
      const overlay = overlays.find(o => o.id === selectedOverlayId);
      if (overlay && overlay.text === '') {
        setEditingOverlayId(selectedOverlayId);
      }
    }
  }, [selectedOverlayId, editingOverlayId, overlays]);

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
          <Skeleton className="w-[612px] h-[792px]" /> // Default A4 size
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
                ? 'ring-2 ring-blue-500 border border-blue-300' 
                : 'border border-dashed border-gray-400 hover:border-gray-600'
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
              backgroundColor: 'transparent', // No background
            }}
            onMouseDown={(e) => handleDragStart(e, overlay.id)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectOverlay(overlay.id);
            }}
          >
            {editingOverlayId === overlay.id ? (
              <div className="relative">
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
                  className="bg-white border border-blue-400 outline-none min-w-[120px] max-w-[200px] px-2 py-1 rounded shadow-sm"
                  autoFocus
                  placeholder="Type your text..."
                  style={{
                    fontFamily: overlay.fontFamily,
                    fontSize: `${overlay.fontSize}px`,
                    fontWeight: overlay.bold ? 'bold' : 'normal',
                    fontStyle: overlay.italic ? 'italic' : 'normal',
                    color: overlay.color,
                    width: 'auto',
                    minWidth: `${Math.max(overlay.text.length * (overlay.fontSize * 0.6), 120)}px`,
                  }}
                />
              </div>
            ) : (
              <div
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingOverlayId(overlay.id);
                }}
                style={{
                  display: 'inline-block',
                  maxWidth: `${pageDimensions.width * 0.8}px`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  padding: '2px 4px',
                }}
              >
                {overlay.text || (
                  <span className="text-gray-500 italic">
                    Double-click to edit
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}