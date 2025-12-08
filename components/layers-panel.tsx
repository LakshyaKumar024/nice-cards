"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, Trash2, GripVertical, RotateCw } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Overlay } from "@/lib/types";
import { Square } from "lucide-react";

interface LayersPanelProps {
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onDeleteOverlay: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorderLayers: (sourceId: string, targetId: string) => void;
  currentPage: number;
}

interface SortableOverlayItemProps {
  overlay: Overlay;
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onDeleteOverlay: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

function extractPlainText(html: string, maxChars: number = 30): string {
  if (!html) return "Empty text";

  // Create a temporary div to parse HTML
  const div = document.createElement("div");
  div.innerHTML = html;

  // Get plain text content (strips all HTML tags)
  const plainText = div.textContent || div.innerText || "";

  // Trim whitespace and limit length
  const trimmed = plainText.trim();

  if (trimmed.length === 0) return "Empty text";
  if (trimmed.length <= maxChars) return trimmed;

  // Truncate and add ellipsis
  return trimmed.slice(0, maxChars) + "...";
}

function truncateHTMLByChars(html: string, maxChars: number = 20): string {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  let charCount = 0;
  let truncated = false;

  function processNode(node: Node): Node | null {
    if (truncated) return null;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (charCount + text.length > maxChars) {
        const remaining = maxChars - charCount;
        node.textContent = text.slice(0, remaining) + "...";
        truncated = true;
      }
      charCount += text.length;
      return node;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node.cloneNode(false) as Element;
      for (const child of Array.from(node.childNodes)) {
        const processed = processNode(child);
        if (processed) {
          element.appendChild(processed);
        }
        if (truncated) break;
      }
      return element;
    }
    return node.cloneNode(true);
  }

  const result = document.createElement("div");
  for (const child of Array.from(div.childNodes)) {
    const processed = processNode(child);
    if (processed) {
      result.appendChild(processed);
    }
    if (truncated) break;
  }

  return result.innerHTML || "Empty text";
}

function SortableOverlayItem({
  overlay,
  selectedOverlayId,
  onSelectOverlay,
  onDeleteOverlay,
  onToggleVisibility,
}: SortableOverlayItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: overlay.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
  flex items-center gap-2 p-2 rounded-lg border transition-colors
  ${
    selectedOverlayId === overlay.id
      ? "bg-blue-50 dark:bg-blue-200 border-blue-200 dark:border-blue-300"
      : "bg-white dark:bg-gray-100 border-gray-200 dark:border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-200"
  }
  ${isDragging ? "opacity-50" : ""}
`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" style={{ color: "010101" }} />
      </Button>

      <div
        className="flex-1 cursor-pointer overflow-hidden min-w-0"
        onClick={() => onSelectOverlay(overlay.id)}
      >
        {overlay.type === "shape" ? (
          <>
            <div className="flex items-center gap-2">
              <Square
                className="w-4 h-4 shrink-0"
                style={{ fill: overlay.color, color: overlay.color }}
              />
              <p className="text-sm font-medium truncate text-stone-950">
                Square Shape
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <span>
                {Math.round(overlay.x * 100)}%, {Math.round(overlay.y * 100)}%
              </span>
              <span>•</span>
              <span>
                {Math.round(overlay.width * 100)}% ×{" "}
                {Math.round(overlay.height * 100)}%
              </span>
              {overlay.rotation !== 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    <span>{overlay.rotation}°</span>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className="text-sm font-medium truncate min-w-0"
              style={{
                fontFamily: overlay.fontFamily,
                fontSize: "14px",
                fontWeight: overlay.bold ? "bold" : "normal",
                fontStyle: overlay.italic ? "italic" : "normal",
                color: overlay.color,
                lineHeight: "1.4",
              }}
              dangerouslySetInnerHTML={{
                __html:
                  overlay.type === "text"
                    ? truncateHTMLByChars(overlay.text || "", 20)
                    : "Empty text",
              }}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
              <span>
                {Math.round(overlay.x * 100)}%, {Math.round(overlay.y * 100)}%
              </span>
              {overlay.rotation !== 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <RotateCw className="w-3 h-3" />
                    <span>{overlay.rotation}°</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(overlay.id)}
          className="w-6 h-6"
        >
          {overlay.visible ? (
            <Eye className="w-4 h-4" style={{ color: "010101" }} />
          ) : (
            <EyeOff className="w-4 h-4" style={{ color: "010101" }} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteOverlay(overlay.id)}
          className="w-6 h-6 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function LayersPanel({
  overlays,
  selectedOverlayId,
  onSelectOverlay,
  onDeleteOverlay,
  onToggleVisibility,
  onReorderLayers,
  currentPage,
}: LayersPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentPageOverlays = overlays
    .filter((overlay) => overlay.page === currentPage)
    .sort((a, b) => b.zIndex - a.zIndex); // Top layer (higher zIndex) first

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const sourceId = active.id as string;
      const targetId = over?.id as string;
      onReorderLayers(sourceId, targetId);
    }
  };

  if (currentPageOverlays.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No overlays on this page
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col z-50">
      <h3 className="text-sm font-semibold mb-3">Layers</h3>
      <ScrollArea className="flex-1  max-h-5">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={currentPageOverlays.map((overlay) => overlay.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 pr-2 mb-20">
              {" "}
              {/* Added pr-2 for scrollbar space */}
              {currentPageOverlays.map((overlay) => (
                <SortableOverlayItem
                  key={overlay.id}
                  overlay={overlay}
                  selectedOverlayId={selectedOverlayId}
                  onSelectOverlay={onSelectOverlay}
                  onDeleteOverlay={onDeleteOverlay}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </ScrollArea>
    </div>
  );
}
