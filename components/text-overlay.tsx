import { useRef, useEffect, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TextOverlay } from '@shared/schema';

interface TextOverlayComponentProps {
  overlay: TextOverlay;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextOverlay>) => void;
  onDelete: () => void;
  scale: number;
}

export function TextOverlayComponent({
  overlay,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  scale,
}: TextOverlayComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - overlay.x,
      y: e.clientY - overlay.y,
    });
  }, [isEditing, onSelect, overlay.x, overlay.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onUpdate({ x: Math.max(0, newX), y: Math.max(0, newY) });
  }, [isDragging, dragStart, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (contentRef.current) {
      const newText = contentRef.current.textContent || '';
      if (newText !== overlay.text) {
        onUpdate({ text: newText });
      }
    }
  }, [overlay.text, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (contentRef.current) {
        contentRef.current.textContent = overlay.text;
      }
    }
    e.stopPropagation();
  }, [overlay.text]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  }, [onDelete]);

  return (
    <div
      className={`absolute cursor-move select-none group ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${isDragging ? 'opacity-70' : ''}`}
      style={{
        left: `${overlay.x}px`,
        top: `${overlay.y}px`,
        zIndex: overlay.zIndex,
        minWidth: overlay.width ? `${overlay.width}px` : '100px',
        minHeight: overlay.height ? `${overlay.height}px` : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      data-testid={`overlay-${overlay.id}`}
    >
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`px-2 py-1 whitespace-pre-wrap break-words outline-none ${
          isEditing ? 'bg-white/90 shadow-lg' : ''
        } ${!overlay.text && !isEditing ? 'min-h-[1.5em]' : ''}`}
        style={{
          fontSize: `${overlay.fontSize}px`,
          fontFamily: overlay.fontFamily,
          fontWeight: overlay.bold ? 'bold' : 'normal',
          fontStyle: overlay.italic ? 'italic' : 'normal',
          color: overlay.color,
        }}
        data-placeholder={!overlay.text && !isEditing ? "Double-click to edit" : undefined}
        data-testid={`text-${overlay.id}`}
      >
        {overlay.text}
      </div>
      
      {isSelected && !isEditing && (
        <Button
          size="icon"
          variant="destructive"
          className="absolute -top-3 -right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDeleteClick}
          data-testid={`button-delete-${overlay.id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
