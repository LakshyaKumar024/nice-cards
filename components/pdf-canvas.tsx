"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Skeleton } from "@/components/ui/skeleton";
import type { Overlay, TextOverlay, ShapeOverlay } from "./pdf-editor";

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFCanvasProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateOverlay: (
    id: string,
    updates: Partial<TextOverlay> | Partial<ShapeOverlay>
  ) => void;
  onAddOverlay: (overlay: Omit<TextOverlay, "id">) => void;
  onAddShape: (x: number, y: number) => void;
  toolMode: "text" | "shape";
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
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(
    null
  );
  const [isResizing, setIsResizing] = useState(false);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Handle keyboard for editing only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && selectedOverlayId && !editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(selectedOverlayId);
      }
      if (event.key === "Escape" && editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
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
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // ORIGINAL SCALING - Fixed scale like your initial version
        const scale = 1.5; // Fixed scale as in your original code

        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        setPageDimensions({
          width: scaledViewport.width,
          height: scaledViewport.height,
        });

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error && error.message.includes("cancelled")) {
          return;
        }
        console.error("Error rendering PDF page:", error);
        setError("Failed to render PDF page");
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
  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const normalizedX = x / pageDimensions.width;
      const normalizedY = y / pageDimensions.height;

      if (toolMode === "shape") {
        onAddShape(normalizedX, normalizedY);
      } else {
        const newOverlay: Omit<TextOverlay, "id"> = {
          type: "text",
          text: "", // Start with empty text
          x: normalizedX,
          y: normalizedY,
          fontSize: 16,
          fontFamily: "Arial",
          bold: false,
          italic: false,
          color: "#000000",
          page: pageNumber,
          visible: true,
          zIndex: overlays.length,
        };

        onAddOverlay(newOverlay);
      }
    },
    [
      pageDimensions,
      pageNumber,
      overlays.length,
      isLoading,
      onAddOverlay,
      onAddShape,
      toolMode,
    ]
  );

  // Handle single click to select
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if clicking on a shape or text overlay
      const clickedOverlay = overlays.find((overlay) => {
        if (overlay.page !== pageNumber) return false;

        if (overlay.type === "shape") {
          const shapeX = overlay.x * pageDimensions.width;
          const shapeY = overlay.y * pageDimensions.height;
          const shapeW = overlay.width * pageDimensions.width;
          const shapeH = overlay.height * pageDimensions.height;
          return (
            x >= shapeX - shapeW / 2 &&
            x <= shapeX + shapeW / 2 &&
            y >= shapeY - shapeH / 2 &&
            y <= shapeY + shapeH / 2
          );
        } else {
          return (
            Math.abs(overlay.x * pageDimensions.width - x) < 50 &&
            Math.abs(overlay.y * pageDimensions.height - y) < 20
          );
        }
      });

      if (clickedOverlay) {
        onSelectOverlay(clickedOverlay.id);
        setEditingOverlayId(null);
      } else {
        onSelectOverlay(null);
        setEditingOverlayId(null);
      }
    },
    [overlays, pageNumber, pageDimensions, isLoading, onSelectOverlay]
  );

  const handleDragStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
      // Don't start drag if we're resizing
      if (isResizing) return;

      event.stopPropagation();
      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      onSelectOverlay(overlayId);
      setEditingOverlayId(null);

      const startX = event.clientX;
      const startY = event.clientY;
      const dragThreshold = 5; // pixels
      let hasMoved = false;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dragOffset = {
        x: event.clientX - centerX,
        y: event.clientY - centerY,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!canvasRef.current) return;

        const deltaX = Math.abs(moveEvent.clientX - startX);
        const deltaY = Math.abs(moveEvent.clientY - startY);

        // Only start dragging if mouse moved beyond threshold
        if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
          hasMoved = true;
          setDraggingOverlayId(overlayId);
        }

        if (!hasMoved) return;

        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();

        const newX = moveEvent.clientX - canvasRect.left - dragOffset.x;
        const newY = moveEvent.clientY - canvasRect.top - dragOffset.y;

        const normalizedX = Math.max(
          0,
          Math.min(1, newX / pageDimensions.width)
        );
        const normalizedY = Math.max(
          0,
          Math.min(1, newY / pageDimensions.height)
        );

        onUpdateOverlay(overlayId, {
          x: normalizedX,
          y: normalizedY,
        });
      };

      const handleMouseUp = () => {
        setDraggingOverlayId(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay, isResizing]
  );

  // Handle resize for shapes
  const handleResizeStart = useCallback(
    (
      event: React.MouseEvent,
      overlayId: string,
      handle: "n" | "s" | "e" | "w" | "se" | "sw" | "ne" | "nw"
    ) => {
      event.stopPropagation();
      event.preventDefault();
      setIsResizing(true);

      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay || overlay.type !== "shape") {
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

        // Side handles - only affect one dimension, keep opposite edge fixed
        if (handle === "e") {
          // East (right) - expand width to the right, left edge stays fixed
          // When dragging right handle right (deltaX positive), width increases
          newWidth = Math.max(0.01, startWidth + deltaX);
          // Keep left edge fixed: leftEdge = startXPos - startWidth/2
          // New center = leftEdge + newWidth/2 = (startXPos - startWidth/2) + (startWidth + deltaX)/2
          // = startXPos - startWidth/2 + startWidth/2 + deltaX/2 = startXPos + deltaX/2
          newX = startXPos + deltaX / 2;
        } else if (handle === "w") {
          // West (left) - expand width to the left, right edge stays fixed
          // When dragging left handle left (deltaX negative), width increases
          newWidth = Math.max(0.01, startWidth - deltaX);
          // Keep right edge fixed: rightEdge = startXPos + startWidth/2
          // New center = rightEdge - newWidth/2 = (startXPos + startWidth/2) - (startWidth - deltaX)/2
          // = startXPos + startWidth/2 - startWidth/2 + deltaX/2 = startXPos + deltaX/2
          newX = startXPos + deltaX / 2;
        } else if (handle === "s") {
          // South (bottom) - expand height downward, top edge stays fixed
          // When dragging bottom handle down (deltaY positive), height increases
          newHeight = Math.max(0.01, startHeight + deltaY);
          // Keep top edge fixed: topEdge = startYPos - startHeight/2
          // New center = topEdge + newHeight/2 = (startYPos - startHeight/2) + (startHeight + deltaY)/2
          // = startYPos - startHeight/2 + startHeight/2 + deltaY/2 = startYPos + deltaY/2
          newY = startYPos + deltaY / 2;
        } else if (handle === "n") {
          // North (top) - expand height upward, bottom edge stays fixed
          // When dragging top handle up (deltaY negative), height increases
          newHeight = Math.max(0.01, startHeight - deltaY);
          // Keep bottom edge fixed: bottomEdge = startYPos + startHeight/2
          // New center = bottomEdge - newHeight/2 = (startYPos + startHeight/2) - (startHeight - deltaY)/2
          // = startYPos + startHeight/2 - startHeight/2 + deltaY/2 = startYPos + deltaY/2
          newY = startYPos + deltaY / 2;
        }
        // Corner handles - affect both dimensions
        else if (handle === "se") {
          // Southeast (bottom-right)
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
        } else if (handle === "sw") {
          // Southwest (bottom-left)
          newWidth = Math.max(0.01, startWidth - deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
          newX = startXPos + (startWidth - newWidth) / 2;
        } else if (handle === "ne") {
          // Northeast (top-right)
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight - deltaY);
          newY = startYPos + (startHeight - newHeight) / 2;
        } else if (handle === "nw") {
          // Northwest (top-left)
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
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay]
  );

  // Handle inline text editing
  const handleTextChange = useCallback(
    (id: string, newText: string) => {
      onUpdateOverlay(id, { text: newText });
    },
    [onUpdateOverlay]
  );

  const handleTextBlur = useCallback(() => {
    setEditingOverlayId(null);
  }, []);

  // Start editing when a new text overlay is selected
  useEffect(() => {
    if (selectedOverlayId && !editingOverlayId) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (overlay && overlay.type === "text" && overlay.text === "") {
        setEditingOverlayId(selectedOverlayId);
      }
    }
  }, [selectedOverlayId, editingOverlayId, overlays]);

  const currentPageOverlays = overlays
    .filter((overlay) => overlay.page === pageNumber)
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
          className={`border-2 border-blue-500 shadow-lg cursor-crosshair ${
            isLoading ? "hidden" : "block"
          }`}
          style={{
            boxShadow:
              "0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />

        {!isLoading &&
          currentPageOverlays.map((overlay) => {
            if (overlay.type === "shape") {
              const shapeX = overlay.x * pageDimensions.width;
              const shapeY = overlay.y * pageDimensions.height;
              const shapeW = overlay.width * pageDimensions.width;
              const shapeH = overlay.height * pageDimensions.height;
              const isSelected = selectedOverlayId === overlay.id;

              const isDragging = draggingOverlayId === overlay.id;

              return (
                <div
                  key={overlay.id}
                  className={`absolute ${overlay.visible ? "" : "opacity-30"}`}
                  style={{
                    left: `${shapeX - shapeW / 2}px`,
                    top: `${shapeY - shapeH / 2}px`,
                    width: `${shapeW}px`,
                    height: `${shapeH}px`,
                    zIndex: overlay.zIndex + 10,
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
                      width: "100%",
                      height: "100%",
                      backgroundColor: overlay.color,
                      border: isSelected
                        ? "2px solid #3b82f6"
                        : "1px dashed #9ca3af",
                      cursor: "move",
                      opacity: isDragging ? 0.5 : 1,
                      transition: isDragging ? "none" : "opacity 0.2s",
                    }}
                    onMouseDown={(e) => {
                      // Don't start drag if clicking on a resize handle
                      if (
                        (e.target as HTMLElement).closest(
                          "[data-resize-handle]"
                        )
                      ) {
                        return;
                      }
                      e.stopPropagation();
                      handleDragStart(
                        e as React.MouseEvent<HTMLDivElement>,
                        overlay.id
                      );
                    }}
                  />
                  {isSelected && (
                    <>
                      {/* Resize handles */}
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border border-white cursor-nw-resize z-10"
                        style={{ left: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "nw");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border border-white cursor-ne-resize z-10"
                        style={{ right: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "ne");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border border-white cursor-sw-resize z-10"
                        style={{ left: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "sw");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border border-white cursor-se-resize z-10"
                        style={{ right: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "se");
                        }}
                      />
                      {/* Side handles */}
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border border-white cursor-n-resize z-10"
                        style={{
                          left: "50%",
                          top: "-6px",
                          transform: "translateX(-50%)",
                          width: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "n");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border border-white cursor-s-resize z-10"
                        style={{
                          left: "50%",
                          bottom: "-6px",
                          transform: "translateX(-50%)",
                          width: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "s");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border border-white cursor-e-resize z-10"
                        style={{
                          right: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "e");
                        }}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border border-white cursor-w-resize z-10"
                        style={{
                          left: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "w");
                        }}
                      />
                    </>
                  )}
                </div>
              );
            } else {
              return (
                <div
                  key={overlay.id}
                  className={`absolute cursor-move p-1 ${
                    selectedOverlayId === overlay.id
                      ? "ring-2 ring-blue-500 border border-blue-300"
                      : "border border-dashed border-gray-400 hover:border-gray-600"
                  } ${overlay.visible ? "" : "opacity-30"}`}
                  style={{
                    left: `${overlay.x * pageDimensions.width}px`,
                    top: `${overlay.y * pageDimensions.height}px`,
                    fontSize: `${overlay.fontSize}px`,
                    fontFamily: overlay.fontFamily,
                    fontWeight: overlay.bold ? "bold" : "normal",
                    fontStyle: overlay.italic ? "italic" : "normal",
                    color: overlay.color,
                    zIndex: overlay.zIndex + 10,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "auto",
                    maxWidth: `${pageDimensions.width * 0.8}px`,
                    wordBreak: "break-word",
                    backgroundColor: "transparent",
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
                        onChange={(e) =>
                          handleTextChange(overlay.id, e.target.value)
                        }
                        onBlur={handleTextBlur}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleTextBlur();
                          }
                        }}
                        className="bg-white border border-blue-400 outline-none px-2 py-1 rounded shadow-sm"
                        autoFocus
                        placeholder="Type your text..."
                        style={{
                          fontFamily: overlay.fontFamily,
                          fontSize: `${overlay.fontSize}px`,
                          fontWeight: overlay.bold ? "bold" : "normal",
                          fontStyle: overlay.italic ? "italic" : "normal",
                          color: overlay.color,
                          width: "auto",
                          minWidth: "120px",
                          // Remove text-align center from input
                          lineHeight: "1.2",
                          transform: "none", // Remove transform for editing mode
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        maxWidth: `${pageDimensions.width * 0.8}px`,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        padding: "2px 8px",
                        lineHeight: "1.2",
                        letterSpacing: "normal",
                        // Center the text properly
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        backgroundColor: "transparent",
                        border: "none",
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
