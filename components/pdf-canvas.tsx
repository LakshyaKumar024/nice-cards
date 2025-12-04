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
  onApplyFontRef?: (ref: (fontFamily: string) => void) => void;
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
  onApplyFontRef,
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editableDivRef = useRef<HTMLDivElement>(null);

  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(
    null
  );
  const [isResizing, setIsResizing] = useState(false);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fontsLoaded, setFontsLoaded] = useState(false);
  // Use a persistent DOM marker to represent the user's selection so it
  // survives focus changes (toolbars, portals) which collapse native Ranges.
  const savedMarkerRef = useRef<HTMLElement | null>(null);

  // Wait for fonts to load
  useEffect(() => {
    if (typeof window !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (editingOverlayId && editableDivRef.current) {
      const el = editableDivRef.current;
      const overlay = overlays.find((o) => o.id === editingOverlayId);

      if (!overlay || overlay.type !== "text") return;

      // Reset height and width first
      el.style.height = "auto";
      el.style.width = "auto";

      // Calculate the required width based on text content
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const innerText = el.innerText || overlay.text || "";
      if (context) {
        context.font = `${overlay.bold ? "bold " : ""}${
          overlay.italic ? "italic " : ""
        }${overlay.fontSize}px ${overlay.fontFamily}`;
        const textWidth = context.measureText(innerText || "M").width;

        // Set width with some padding
        const newWidth = Math.max(50, textWidth + 10);
        el.style.width = `${newWidth}px`;
      }

      // Calculate the required height based on text content
      const lineHeight = overlay.fontSize * 1.2;
      const textLines = (el.innerText || overlay.text || "").split("\n");
      const numLines = Math.max(1, textLines.length);
      const newHeight = Math.max(
        overlay.fontSize + 4,
        numLines * lineHeight + 4
      );
      el.style.height = `${newHeight}px`;

      // Focus and place cursor at the end
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingOverlayId, overlays]);

  // Helper function to highlight a range with background color and return
  // the created marker element. Returning a DOM element lets callers keep
  // a persistent reference to the selection even after the editor loses focus.
  const highlightRange = useCallback((range: Range) => {
    // Remove previous highlights
    if (editableDivRef.current) {
      const marks = editableDivRef.current.querySelectorAll(
        "mark[data-selection]"
      );
      marks.forEach((mark) => {
        const parent = mark.parentNode;
        while (mark.firstChild) {
          parent?.insertBefore(mark.firstChild, mark);
        }
        parent?.removeChild(mark);
      });
    }

    // Create mark element for highlighting
    const mark = document.createElement("mark");
    mark.setAttribute("data-selection", "true");
    mark.style.backgroundColor = "#FFFF00";
    mark.style.opacity = "0.4";

    try {
      range.surroundContents(mark);
    } catch {
      // If surroundContents fails (range spans multiple elements), use a different approach
      const contents = range.extractContents();
      mark.appendChild(contents);
      range.insertNode(mark);
    }

    return mark;
  }, []);

  // Apply selected font to current persistent marker selection inside contentEditable
  const applyFontToSelection = useCallback(
    (fontFamily: string) => {
      console.log("=== applyFontToSelection called ===");
      console.log("fontFamily:", fontFamily);
      console.log("savedMarkerRef.current:", savedMarkerRef.current);
      console.log("editingOverlayId:", editingOverlayId);

      const marker = savedMarkerRef.current;
      if (!marker) {
        console.log("EARLY RETURN: No saved marker for selection");
        return;
      }
      try {
        // --------------------------------------------
        // STEP 1 — REMOVE ALL FONT SPANS (ancestors + inner)
        // --------------------------------------------

        // 1️⃣ remove ancestor spans above the marker
        let parent = marker.parentElement;
        while (parent && parent !== editableDivRef.current) {
          if (parent.hasAttribute("data-font")) {
            const outer = parent;
            const grand = outer.parentElement;

            // unwrap the span
            while (outer.firstChild) {
              grand?.insertBefore(outer.firstChild, outer);
            }
            grand?.removeChild(outer);
          }
          parent = parent.parentElement;
        }

        // 2️⃣ remove any spans inside the marker
        const innerSpans = marker.querySelectorAll("span[data-font]");
        innerSpans.forEach((s) => {
          const p = s.parentNode;
          while (s.firstChild) p?.insertBefore(s.firstChild, s);
          p?.removeChild(s);
        });

        // --------------------------------------------
        // STEP 2 — CREATE NEW FONT SPAN WITH INLINE STYLE
        // --------------------------------------------

        const span = document.createElement("span");

        // build CSS class name
        const className = fontFamily
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9\-]/g, "")
          .toLowerCase();

        span.setAttribute("data-font", fontFamily);
        span.setAttribute("data-font-class", className);
        span.className = className;

        // IMPORTANT: set inline font-family so font actually renders
        span.style.fontFamily = `"${fontFamily}", sans-serif`;

        // move highlighted text inside new span
        while (marker.firstChild) {
          span.appendChild(marker.firstChild);
        }

        // replace marker with this new span
        marker.parentNode?.replaceChild(span, marker);

        // clear saved marker
        savedMarkerRef.current = null;

        // remove remaining <mark> elements from DOM
        if (editableDivRef.current) {
          const marks = editableDivRef.current.querySelectorAll(
            "mark[data-selection]"
          );
          marks.forEach((m) => {
            const parent = m.parentNode;
            while (m.firstChild) parent?.insertBefore(m.firstChild, m);
            parent?.removeChild(m);
          });
        }

        // update overlay HTML
        if (editingOverlayId) {
          const html = editableDivRef.current?.innerHTML || "";
          onUpdateOverlay(editingOverlayId, { text: html });
        }
      } catch (error) {
        console.error("Error in applyFontToSelection:", error);
      }
    },
    [editingOverlayId, onUpdateOverlay]
  );

  // Pass applyFontToSelection function to parent so toolbar can call it directly
  useEffect(() => {
    console.log("Setting applyFontToSelection ref");
    if (onApplyFontRef) {
      onApplyFontRef(applyFontToSelection);
      console.log("Ref set!");
    }
  }, [applyFontToSelection, onApplyFontRef]);

  // Handle keyboard for editing only
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && selectedOverlayId && !editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(selectedOverlayId);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        // If editing, clear highlight and exit edit mode
        if (editingOverlayId) {
          if (editableDivRef.current) {
            const marks = editableDivRef.current.querySelectorAll(
              "mark[data-selection]"
            );
            marks.forEach((mark) => {
              const parent = mark.parentNode;
              while (mark.firstChild) {
                parent?.insertBefore(mark.firstChild, mark);
              }
              parent?.removeChild(mark);
            });
          }
          savedMarkerRef.current = null;
          setEditingOverlayId(null);
        }
        // Always deselect overlay on ESC (whether editing or just selected)
        onSelectOverlay(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOverlayId, editingOverlayId, onSelectOverlay]);

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
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const scale = 1.5;
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

  useEffect(() => {
    const el = editableDivRef.current;
    if (!el) return;

    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const marker = highlightRange(range);
        savedMarkerRef.current = marker;
      }
    };

    el.addEventListener("mouseup", handleSelection);
    el.addEventListener("keyup", handleSelection);

    return () => {
      el.removeEventListener("mouseup", handleSelection);
      el.removeEventListener("keyup", handleSelection);
    };
  }, [highlightRange]);

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
          text: "",
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
          rotation: 0, // Initialize with 0 rotation
          textAlign: "left",
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
      let clickedOverlay = null;

      // Check shapes first (they might be behind other overlays)
      for (const overlay of overlays) {
        if (overlay.page !== pageNumber) continue;

        if (overlay.type === "shape") {
          const shapeX = overlay.x * pageDimensions.width;
          const shapeY = overlay.y * pageDimensions.height;
          const shapeW = overlay.width * pageDimensions.width;
          const shapeH = overlay.height * pageDimensions.height;

          // Account for the translate(-50%, -50%) transform
          const adjustedShapeX = shapeX;
          const adjustedShapeY = shapeY;

          // Check if click is inside the shape bounds
          const isInside =
            x >= adjustedShapeX - shapeW / 2 &&
            x <= adjustedShapeX + shapeW / 2 &&
            y >= adjustedShapeY - shapeH / 2 &&
            y <= adjustedShapeY + shapeH / 2;

          if (isInside) {
            clickedOverlay = overlay;
            break;
          }
        } else {
          // Text overlay check
          const textX = overlay.x * pageDimensions.width;
          const textY = overlay.y * pageDimensions.height;
          const clickRadius = 30;

          // Account for the translate(-50%, 0%) transform for text
          const adjustedTextX = textX;
          const adjustedTextY = textY;

          const isNearText =
            Math.abs(adjustedTextX - x) < clickRadius &&
            Math.abs(adjustedTextY - y) < clickRadius;

          if (isNearText) {
            clickedOverlay = overlay;
            break;
          }
        }
      }

      if (clickedOverlay) {
        onSelectOverlay(clickedOverlay.id);
        // Exit edit mode if clicking on a different overlay
        if (editingOverlayId && clickedOverlay.id !== editingOverlayId) {
          // Clear highlight before exiting
          if (editableDivRef.current) {
            const marks = editableDivRef.current.querySelectorAll(
              "mark[data-selection]"
            );
            marks.forEach((mark) => {
              const parent = mark.parentNode;
              while (mark.firstChild) {
                parent?.insertBefore(mark.firstChild, mark);
              }
              parent?.removeChild(mark);
            });
          }
          savedMarkerRef.current = null;
          setEditingOverlayId(null);
        }
      } else {
        // Clicked outside any overlay - keep edit mode active (like Canva)
        // Only deselect if not currently editing
        if (!editingOverlayId) {
          onSelectOverlay(null);
        }
      }
    },
    [
      overlays,
      pageNumber,
      pageDimensions,
      isLoading,
      onSelectOverlay,
      editingOverlayId,
    ]
  );

  const handleDragStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
      // Don't start drag if we're resizing
      if (isResizing) return;

      event.stopPropagation();
      event.preventDefault(); // Add this to prevent text selection
      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      onSelectOverlay(overlayId);
      setEditingOverlayId(null);

      // Add dragging class to body
      document.body.classList.add("dragging");

      const startX = event.clientX;
      const startY = event.clientY;
      const dragThreshold = 5;
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
        // Remove dragging class from body
        document.body.classList.remove("dragging");
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

        // Resize logic based on handle
        if (handle === "e") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newX = startXPos + deltaX / 2;
        } else if (handle === "w") {
          newWidth = Math.max(0.01, startWidth - deltaX);
          newX = startXPos + deltaX / 2;
        } else if (handle === "s") {
          newHeight = Math.max(0.01, startHeight + deltaY);
          newY = startYPos + deltaY / 2;
        } else if (handle === "n") {
          newHeight = Math.max(0.01, startHeight - deltaY);
          newY = startYPos + deltaY / 2;
        } else if (handle === "se") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
        } else if (handle === "sw") {
          newWidth = Math.max(0.01, startWidth - deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
          newX = startXPos + (startWidth - newWidth) / 2;
        } else if (handle === "ne") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight - deltaY);
          newY = startYPos + (startHeight - newHeight) / 2;
        } else if (handle === "nw") {
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

  // Auto focus contentEditable and move cursor to end
  useEffect(() => {
    if (editingOverlayId && editableDivRef.current) {
      const el = editableDivRef.current;
      el.focus();

      // Move cursor to end of text
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editingOverlayId]);

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
        {isLoading && <Skeleton className="w-[612px] h-[792px]" />}

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
                    left: `${shapeX}px`,
                    top: `${shapeY}px`,
                    width: `${shapeW}px`,
                    height: `${shapeH}px`,
                    zIndex: overlay.zIndex + 10,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
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
                      opacity: isDragging ? 0.7 : 1,
                      transition: isDragging ? "none" : "all 0.2s",
                      borderRadius: "2px",
                      transformOrigin: "center center", // Ensure rotation around center
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
                      {/* Corner resize handles */}
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-nw-resize z-20 rounded-sm"
                        style={{ left: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "nw");
                        }}
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-ne-resize z-20 rounded-sm"
                        style={{ right: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "ne");
                        }}
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-sw-resize z-20 rounded-sm"
                        style={{ left: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "sw");
                        }}
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-se-resize z-20 rounded-sm"
                        style={{ right: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "se");
                        }}
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />

                      {/* Side resize handles */}
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border-2 border-white cursor-n-resize z-20 rounded-sm"
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
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border-2 border-white cursor-s-resize z-20 rounded-sm"
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
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border-2 border-white cursor-e-resize z-20 rounded-sm"
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
                        onClick={(e) => e.stopPropagation()} // ADD THIS
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border-2 border-white cursor-w-resize z-20 rounded-sm"
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
                        onClick={(e) => e.stopPropagation()} // ADD THIS
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
                  className={`absolute cursor-move select-none ${
                    // Add select-none here
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50 bg-opacity-50 rounded"
                      : "border border-dashed border-transparent hover:border-gray-400"
                  } ${overlay.visible ? "" : "opacity-30"} ${
                    isDragging ? "opacity-70" : ""
                  }`}
                  style={{
                    left: `${textX}px`,
                    top: `${textY}px`,
                    zIndex: overlay.zIndex + 10,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                    pointerEvents: "auto",
                    maxWidth: `${pageDimensions.width * 0.8}px`,
                    backgroundColor: "transparent",
                    transition: isDragging ? "none" : "all 0.2s",
                    transformOrigin: "center center",
                    // Add CSS to prevent text selection
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                  }}
                  onMouseDown={(e) => {
                    // Prevent text selection when starting drag
                    e.preventDefault();
                    handleDragStart(e, overlay.id);
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOverlay(overlay.id);
                  }}
                >
                  {editingOverlayId === overlay.id ? (
                    <div
                      className="relative"
                      onDoubleClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        ref={editableDivRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => {
                          const html = (e.target as HTMLDivElement).innerHTML;
                          handleTextChange(overlay.id, html);
                        }}
                        onMouseUp={() => {
                          // Save selection on mouse up
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
                            const range = sel.getRangeAt(0);
                            // Create a persistent marker element for the selection so
                            // it survives focus/blur when interacting with toolbar UI.
                            const marker = highlightRange(range.cloneRange());
                            savedMarkerRef.current = marker;
                          }
                        }}
                        onBlur={() => {
                          // Always refocus the editor while in editing mode
                          // This keeps it focused even when clicking toolbar or outside
                          setTimeout(() => {
                            if (editableDivRef.current && editingOverlayId) {
                              editableDivRef.current.focus();
                            }
                          }, 0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            // Clear highlight on escape and exit edit mode
                            if (editableDivRef.current) {
                              const marks =
                                editableDivRef.current.querySelectorAll(
                                  "mark[data-selection]"
                                );
                              marks.forEach((mark) => {
                                const parent = mark.parentNode;
                                while (mark.firstChild) {
                                  parent?.insertBefore(mark.firstChild, mark);
                                }
                                parent?.removeChild(mark);
                              });
                            }
                            savedMarkerRef.current = null;
                            handleTextBlur();
                            onSelectOverlay(null); // Deselect overlay to remove blue ring
                          }
                        }}
                        className="outline-none bg-transparent border-none overflow-hidden"
                        style={{
                          fontFamily: `"${overlay.fontFamily}", sans-serif`,
                          fontSize: `${overlay.fontSize}px`,
                          fontWeight: overlay.bold ? "bold" : "normal",
                          fontStyle: overlay.italic ? "italic" : "normal",
                          color: overlay.color,
                          textAlign: overlay.textAlign,
                          lineHeight: "1.2",
                          padding: "2px",
                          minWidth: "50px",
                          minHeight: `${overlay.fontSize + 4}px`,
                          width: "auto",
                          height: "auto",
                          maxWidth: `${pageDimensions.width * 0.8}px`,
                          marginTop: `${overlay.fontSize / 2}px`,
                          display: "block",
                          direction: "ltr",
                          whiteSpace: "pre-wrap",
                          overflow: "hidden",
                        }}
                        dangerouslySetInnerHTML={{ __html: overlay.text || "" }}
                      />
                    </div>
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingOverlayId(overlay.id);
                      }}
                      className={`whitespace-pre-wrap select-none ${
                        overlay.fontFamilyClassName || ""
                      }`}
                      data-font-family={overlay.fontFamily}
                      data-font-class={overlay.fontFamilyClassName}
                      style={{
                        textAlign: overlay.textAlign,
                        fontFamily: `"${overlay.fontFamily}", sans-serif`,
                        fontSize: `${overlay.fontSize}px`,
                        fontWeight: overlay.bold ? "bold" : "normal",
                        fontStyle: overlay.italic ? "italic" : "normal",
                        color: overlay.color,
                        lineHeight: "1.2",
                        padding: "2px",
                        minWidth: "1px",
                        direction: "ltr",
                        // Prevent text selection
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        MozUserSelect: "none",
                        msUserSelect: "none",
                        // Prevent text cursor
                        cursor: "move",
                      }}
                    >
                      {overlay.text ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: overlay.text }}
                        />
                      ) : (
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
