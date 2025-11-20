'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Skeleton } from '@/components/ui/skeleton';
import type { Overlay, TextOverlay, ShapeOverlay } from './pdf-editor';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFCanvasProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateOverlay: (id: string, updates: Partial<TextOverlay> | Partial<ShapeOverlay>) => void;
  onAddOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  onAddShape: (x: number, y: number) => void;
  toolMode: 'text' | 'shape';
}

export function PDFCanvas({
  pdfDocument,
  pageNumber,
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onUpdateOverlay,
  onAddOverlay,
  onAddShape,
  toolMode,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
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

        const scale = 1.5;
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        setPageDimensions({ width: scaledViewport.width, height: scaledViewport.height });

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

  // Handle double-click to add new text or shape
  const handleCanvasDoubleClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    const normalizedX = x / pageDimensions.width;
    const normalizedY = y / pageDimensions.height;

    console.log('Double click at:', { x, y, normalizedX, normalizedY, toolMode });

    if (toolMode === 'shape') {
      console.log('Adding shape at:', { normalizedX, normalizedY });
      onAddShape(normalizedX, normalizedY);
    } else {
      const newOverlay: Omit<TextOverlay, 'id'> = {
        type: 'text',
        text: '',
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
        rotation: 0, // Initialize with 0 rotation
      };
      
      onAddOverlay(newOverlay);
    }
  }, [pageDimensions, pageNumber, overlays.length, isLoading, onAddOverlay, onAddShape, toolMode]);

  // Handle single click to select
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const x = (event.clientX - rect.left);
    const y = (event.clientY - rect.top);

    // Check if clicking on a shape or text overlay
    const clickedOverlay = overlays.find(overlay => {
      if (overlay.page !== pageNumber) return false;
      
      if (overlay.type === 'shape') {
        const shapeX = overlay.x * pageDimensions.width;
        const shapeY = overlay.y * pageDimensions.height;
        const shapeW = overlay.width * pageDimensions.width;
        const shapeH = overlay.height * pageDimensions.height;
        
        // Simple bounding box check (for now, without rotation)
        const isInside = x >= shapeX - shapeW/2 && x <= shapeX + shapeW/2 &&
                        y >= shapeY - shapeH/2 && y <= shapeY + shapeH/2;
        
        if (isInside) {
          console.log('Clicked on shape:', overlay.id, { shapeX, shapeY, shapeW, shapeH, x, y });
        }
        return isInside;
      } else {
        const textX = overlay.x * pageDimensions.width;
        const textY = overlay.y * pageDimensions.height;
        const clickRadius = 30;
        return Math.abs(textX - x) < clickRadius && Math.abs(textY - y) < clickRadius;
      }
    });

    if (clickedOverlay) {
      console.log('Selected overlay:', clickedOverlay.id, clickedOverlay.type);
      onSelectOverlay(clickedOverlay.id);
      setEditingOverlayId(null);
    } else {
      console.log('No overlay clicked, clearing selection');
      onSelectOverlay(null);
      setEditingOverlayId(null);
    }
  }, [overlays, pageNumber, pageDimensions, isLoading, onSelectOverlay]);

  const handleDragStart = useCallback((event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
    // Don't start drag if we're resizing
    if (isResizing) return;
    
    event.stopPropagation();
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay) return;

    onSelectOverlay(overlayId);
    setEditingOverlayId(null);
    
    const startX = event.clientX;
    const startY = event.clientY;
    const dragThreshold = 5;
    let hasMoved = false;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dragOffset = {
      x: event.clientX - centerX,
      y: event.clientY - centerY
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;

      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      
      if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
        hasMoved = true;
        setDraggingOverlayId(overlayId);
      }

      if (!hasMoved) return;

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
      setDraggingOverlayId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay, isResizing]);

  // Handle resize for shapes
  const handleResizeStart = useCallback((event: React.MouseEvent, overlayId: string, handle: 'n' | 's' | 'e' | 'w' | 'se' | 'sw' | 'ne' | 'nw') => {
    event.stopPropagation();
    event.preventDefault();
    setIsResizing(true);
    
    const overlay = overlays.find(o => o.id === overlayId);
    if (!overlay || overlay.type !== 'shape') {
      setIsResizing(false);
      return;
    }

    onSelectOverlay(overlayId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = overlay.width;
    const startHeight = overlay.height;
    const startXPos = overlay.x;
    const startYPos = overlay.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!canvasRef.current) return;

      const deltaX = (moveEvent.clientX - startX) / pageDimensions.width;
      const deltaY = (moveEvent.clientY - startY) / pageDimensions.height;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startXPos;
      let newY = startYPos;

      // Resize logic based on handle
      if (handle === 'e') {
        newWidth = Math.max(0.01, startWidth + deltaX);
        newX = startXPos + deltaX / 2;
      } else if (handle === 'w') {
        newWidth = Math.max(0.01, startWidth - deltaX);
        newX = startXPos + deltaX / 2;
      } else if (handle === 's') {
        newHeight = Math.max(0.01, startHeight + deltaY);
        newY = startYPos + deltaY / 2;
      } else if (handle === 'n') {
        newHeight = Math.max(0.01, startHeight - deltaY);
        newY = startYPos + deltaY / 2;
      } else if (handle === 'se') {
        newWidth = Math.max(0.01, startWidth + deltaX);
        newHeight = Math.max(0.01, startHeight + deltaY);
      } else if (handle === 'sw') {
        newWidth = Math.max(0.01, startWidth - deltaX);
        newHeight = Math.max(0.01, startHeight + deltaY);
        newX = startXPos + (startWidth - newWidth) / 2;
      } else if (handle === 'ne') {
        newWidth = Math.max(0.01, startWidth + deltaX);
        newHeight = Math.max(0.01, startHeight - deltaY);
        newY = startYPos + (startHeight - newHeight) / 2;
      } else if (handle === 'nw') {
        newWidth = Math.max(0.01, startWidth - deltaX);
        newHeight = Math.max(0.01, startHeight - deltaY);
        newX = startXPos + (startWidth - newWidth) / 2;
        newY = startYPos + (startHeight - newHeight) / 2;
      }

      onUpdateOverlay(overlayId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
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

  // Start editing when a new text overlay is selected
  useEffect(() => {
    if (selectedOverlayId && !editingOverlayId) {
      const overlay = overlays.find(o => o.id === selectedOverlayId);
      if (overlay && overlay.type === 'text' && overlay.text === '') {
        setEditingOverlayId(selectedOverlayId);
      }
    }
  }, [selectedOverlayId, editingOverlayId, overlays]);

  const currentPageOverlays = overlays
    .filter(overlay => overlay.page === pageNumber)
    .sort((a, b) => a.zIndex - b.zIndex);

  // Debug overlays
  useEffect(() => {
    if (pageDimensions.width > 0 && currentPageOverlays.length > 0) {
      console.log('=== CURRENT PAGE OVERLAYS ===');
      console.log('Page dimensions:', pageDimensions);
      currentPageOverlays.forEach(overlay => {
        if (overlay.type === 'shape') {
          console.log(`Shape: ${overlay.id}`);
          console.log(`  Position: (${overlay.x}, ${overlay.y})`);
          console.log(`  Size: ${overlay.width} x ${overlay.height}`);
          console.log(`  Rotation: ${overlay.rotation}°`);
          console.log(`  Color: ${overlay.color}`);
          console.log(`  Visible: ${overlay.visible}`);
        }
      });
    }
  }, [pageDimensions, currentPageOverlays]);

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
          className={`border-2 border-blue-500 shadow-lg cursor-crosshair ${
            isLoading ? 'hidden' : 'block'
          }`}
          style={{
            boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        
        {!isLoading && currentPageOverlays.map((overlay) => {
          if (overlay.type === 'shape') {
            const shapeX = overlay.x * pageDimensions.width;
            const shapeY = overlay.y * pageDimensions.height;
            const shapeW = overlay.width * pageDimensions.width;
            const shapeH = overlay.height * pageDimensions.height;
            const isSelected = selectedOverlayId === overlay.id;
            const isDragging = draggingOverlayId === overlay.id;

            console.log('Rendering shape:', {
              id: overlay.id,
              shapeX, shapeY, shapeW, shapeH,
              rotation: overlay.rotation,
              normalized: { x: overlay.x, y: overlay.y, w: overlay.width, h: overlay.height },
              pageDims: pageDimensions
            });
            
            return (
              <div
                key={overlay.id}
                className={`absolute ${overlay.visible ? '' : 'opacity-30'}`}
                style={{
                  left: `${shapeX}px`,
                  top: `${shapeY}px`,
                  width: `${shapeW}px`,
                  height: `${shapeH}px`,
                  zIndex: overlay.zIndex + 10,
                  transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`, // Add rotation
                }}
                onClick={(e) => {
                  // Don't select if we were resizing or dragging
                  if (isResizing || isDragging) {
                    e.stopPropagation();
                    return;
                  }
                  e.stopPropagation();
                  onSelectOverlay(overlay.id);
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: overlay.color,
                    border: isSelected ? '2px solid #3b82f6' : '1px dashed #9ca3af',
                    cursor: 'move',
                    opacity: isDragging ? 0.7 : 1,
                    transition: isDragging ? 'none' : 'all 0.2s',
                    borderRadius: '2px',
                    transformOrigin: 'center center', // Ensure rotation around center
                  }}
                  onMouseDown={(e) => {
                    // Don't start drag if clicking on a resize handle
                    if ((e.target as HTMLElement).closest('[data-resize-handle]')) {
                      return;
                    }
                    e.stopPropagation();
                    handleDragStart(e as React.MouseEvent<HTMLDivElement>, overlay.id);
                  }}
                />
                {isSelected && (
                  <>
                    {/* Corner resize handles */}
                    <div
                      data-resize-handle
                      className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-nw-resize z-20 rounded-sm"
                      style={{ left: '-6px', top: '-6px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'nw');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-ne-resize z-20 rounded-sm"
                      style={{ right: '-6px', top: '-6px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'ne');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-sw-resize z-20 rounded-sm"
                      style={{ left: '-6px', bottom: '-6px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'sw');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-se-resize z-20 rounded-sm"
                      style={{ right: '-6px', bottom: '-6px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'se');
                      }}
                    />
                    
                    {/* Side resize handles */}
                    <div
                      data-resize-handle
                      className="absolute h-3 bg-blue-500 border-2 border-white cursor-n-resize z-20 rounded-sm"
                      style={{ left: '50%', top: '-6px', transform: 'translateX(-50%)', width: '20px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'n');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute h-3 bg-blue-500 border-2 border-white cursor-s-resize z-20 rounded-sm"
                      style={{ left: '50%', bottom: '-6px', transform: 'translateX(-50%)', width: '20px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 's');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute w-3 bg-blue-500 border-2 border-white cursor-e-resize z-20 rounded-sm"
                      style={{ right: '-6px', top: '50%', transform: 'translateY(-50%)', height: '20px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'e');
                      }}
                    />
                    <div
                      data-resize-handle
                      className="absolute w-3 bg-blue-500 border-2 border-white cursor-w-resize z-20 rounded-sm"
                      style={{ left: '-6px', top: '50%', transform: 'translateY(-50%)', height: '20px' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleResizeStart(e, overlay.id, 'w');
                      }}
                    />
                  </>
                )}
              </div>
            );
          } else {
            // Text overlay rendering with rotation
            const textX = overlay.x * pageDimensions.width;
            const textY = overlay.y * pageDimensions.height;
            const isSelected = selectedOverlayId === overlay.id;
            const isDragging = draggingOverlayId === overlay.id;

            return (
              <div
                key={overlay.id}
                className={`absolute cursor-move p-1 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 bg-opacity-50 rounded' 
                    : 'border border-dashed border-transparent hover:border-gray-400'
                } ${overlay.visible ? '' : 'opacity-30'} ${isDragging ? 'opacity-70' : ''} ${
                  overlay.fontFamilyClassName ? overlay.fontFamilyClassName : ''
                }`}
                style={{
                  left: `${textX}px`,
                  top: `${textY}px`,
                  fontSize: `${overlay.fontSize}px`,
                  fontFamily: overlay.fontFamily,
                  fontWeight: overlay.bold ? 'bold' : 'normal',
                  fontStyle: overlay.italic ? 'italic' : 'normal',
                  color: overlay.color,
                  zIndex: overlay.zIndex + 10,
                  transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`, // Add rotation
                  pointerEvents: 'auto',
                  maxWidth: `${pageDimensions.width * 0.8}px`,
                  wordBreak: 'break-word',
                  backgroundColor: 'transparent',
                  transition: isDragging ? 'none' : 'all 0.2s',
                  transformOrigin: 'center center', // Ensure rotation around center
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
                      className={`bg-white border border-blue-400 outline-none px-2 py-1 rounded shadow-sm ${
                        overlay.fontFamilyClassName ? overlay.fontFamilyClassName : ''
                      }`}
                      autoFocus
                      placeholder="Type your text..."
                      style={{
                        fontFamily: overlay.fontFamily,
                        fontSize: `${overlay.fontSize}px`,
                        fontWeight: overlay.bold ? 'bold' : 'normal',
                        fontStyle: overlay.italic ? 'italic' : 'normal',
                        color: overlay.color,
                        width: 'auto',
                        minWidth: '120px',
                        lineHeight: '1.2',
                        transform: 'none', // Reset transform for input
                      }}
                    />
                  </div>
                ) : (
                  <div
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingOverlayId(overlay.id);
                    }}
                    className={overlay.fontFamilyClassName ? overlay.fontFamilyClassName : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      padding: '2px 8px',
                      lineHeight: '1.2',
                      letterSpacing: 'normal',
                      textAlign: 'center',
                      minHeight: `${overlay.fontSize * 1.5}px`,
                      minWidth: '60px',
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
            );
          }
        })}
      </div>
    </div>
  );
}