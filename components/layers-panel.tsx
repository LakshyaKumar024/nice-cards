'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Eye, EyeOff, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TextOverlay } from './pdf-editor';

interface LayersPanelProps {
  overlays: TextOverlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onDeleteOverlay: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onReorderLayers: (sourceId: string, targetId: string) => void;
  currentPage: number;
}

interface SortableOverlayItemProps {
  overlay: TextOverlay;
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string) => void;
  onDeleteOverlay: (id: string) => void;
  onToggleVisibility: (id: string) => void;
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
      className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
        selectedOverlayId === overlay.id
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="w-6 h-6 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </Button>
      
      <div 
        className="flex-1 cursor-pointer min-w-0"
        onClick={() => onSelectOverlay(overlay.id)}
      >
        <p className="text-sm font-medium truncate" style={{ 
          fontFamily: overlay.fontFamily,
          fontSize: Math.max(12, overlay.fontSize * 0.6),
          fontWeight: overlay.bold ? 'bold' : 'normal',
          fontStyle: overlay.italic ? 'italic' : 'normal',
          color: overlay.color,
        }}>
          {overlay.text || 'Empty text'}
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(overlay.x * 100)}%, {Math.round(overlay.y * 100)}%
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(overlay.id)}
          className="w-6 h-6"
        >
          {overlay.visible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
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
    .filter(overlay => overlay.page === currentPage)
    .sort((a, b) => a.zIndex - b.zIndex);

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
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3">Layers</h3>
      <ScrollArea className="h-64">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={currentPageOverlays.map(overlay => overlay.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
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