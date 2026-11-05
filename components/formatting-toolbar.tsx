"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { normalizeHexColor } from "@/lib/color-utils";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  Lock,
  RotateCcw,
  RotateCw,
  Unlock,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";

interface FormattingToolbarProps {
  overlayType?: "text" | "shape" | "image";
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  color?: string;
  rotation?: number; // Add rotation prop
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (family: string) => void;
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onColorChange?: (color: string) => void;
  onRotationChange?: (rotation: number) => void; // Add rotation change handler
  shapeWidth?: number;
  shapeHeight?: number;
  onShapeWidthChange?: (width: number) => void;
  onShapeHeightChange?: (height: number) => void;
  imageWidth?: number;
  imageHeight?: number;
  onImageWidthChange?: (width: number) => void;
  onImageHeightChange?: (height: number) => void;
  textAlign?: "left" | "center" | "right" | "justify";
  onTextAlignChange?: (align: "left" | "center" | "right" | "justify") => void;
  onApplyFontToSelection?: (fontFamily: string) => void; // NEW: apply font to selected text
}
// Organized font groups
const fontGroups = {
  standard: [
    "Helvetica",
    "Times New Roman",
    "Courier New",
    "Verdana",
    "Georgia",
    "Palatino",
    "FlamencoD",
  ],
  unicodeHindi: [
    "Noto Sans Devanagari Regular",
    "Martel",
    "Martel Bold",
    "Rozha One Regular",
    "Teko Regular",
    "Teko Medium",
    "Teko Bold",
    "Monotype Corsiva Regular Italic",
  ],
  legacyHindi: [
    "AMS Aasmi",
    "Kruti Dev 640",
    "Kruti Dev 010",
    "Kruti Dev 012",
    "Kruti Dev 240",
    "Kruti Dev 500",
    "Kruti Dev 501",
    "Kruti Dev 502",
    "Kruti Dev 680",
    "Kruti Dev 710",
    "Kruti Dev 712",
    "Kruti Dev 714",
    "Kruti Dev 732",
    "A-SuperHindi-3 Bold",
    "A-SuperHindi-8 Normal",
    "BHARTIYA HINDI_089",
    "BHARTIYA HINDI_100",
    "BHARTIYA HINDI_112",
    "BHARTIYA HINDI_142",
    "RAJ 07",
    "RAJ 100",
    "RAJ 16",
    "RAJ 107 Bold",
    "RAJ 13",
    "RAJ 69 Normal",
    "RAJANANDA-Bold",
    "RAJ PRAKASH",
  ],
  decorative: [
    "Arenski",
    "Arial",
    "Embassy BT",
    "DFCalligraphicOrnament",
    "ITC Bookman Demi Italic",
    "ISFOC-TTBorder-1 Normal",
    "Commercial Script BT",
    "BORDER1013",
    "CEATS Wedding Symbol",
  ],
};
export function FormattingToolbar({
  overlayType,
  fontSize = 16,
  fontFamily = "Arial",
  bold = false,
  italic = false,
  color = "#000000",
  rotation = 0,
  onFontSizeChange,
  onFontFamilyChange,
  onBoldToggle,
  onItalicToggle,
  onColorChange,
  onRotationChange,
  shapeWidth,
  shapeHeight,
  onShapeWidthChange,
  onShapeHeightChange,
  imageWidth,
  imageHeight,
  onImageWidthChange,
  onImageHeightChange,
  textAlign,
  onTextAlignChange,
  onApplyFontToSelection, // NEW
}: FormattingToolbarProps) {
  const isImageMode =
    overlayType === "image" ||
    (imageWidth !== undefined && imageHeight !== undefined);
  const isShapeMode =
    !isImageMode &&
    (overlayType === "shape" ||
      (shapeWidth !== undefined && shapeHeight !== undefined));

  const [lockAspect, setLockAspect] = useState(true);

  const handleWidthChange = (newWidth: number) => {
    if (lockAspect && imageWidth && imageHeight && imageWidth > 0) {
      const ratio = imageHeight / imageWidth;
      onImageWidthChange?.(newWidth);
      onImageHeightChange?.(Number((newWidth * ratio).toFixed(4)));
    } else {
      onImageWidthChange?.(newWidth);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    if (lockAspect && imageWidth && imageHeight && imageHeight > 0) {
      const ratio = imageWidth / imageHeight;
      onImageHeightChange?.(newHeight);
      onImageWidthChange?.(Number((newHeight * ratio).toFixed(4)));
    } else {
      onImageHeightChange?.(newHeight);
    }
  };

  const handleRotateLeft = () => {
    const newRotation = (rotation - 15 + 360) % 360;
    onRotationChange?.(newRotation);
  };

  const handleRotateRight = () => {
    const newRotation = (rotation + 15) % 360;
    onRotationChange?.(newRotation);
  };

  const handleRotationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    onRotationChange?.(((value % 360) + 360) % 360);
  };

  const handleRotationSlider = (value: number[]) => {
    onRotationChange?.(value[0]);
  };

  return (
    <div className="p-4 space-y-4" data-toolbar="true">
      {isImageMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-sm">Image Options</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5 px-2"
              onClick={() => setLockAspect((prev) => !prev)}
              title={lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
            >
              {lockAspect ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-xs text-blue-600 font-medium">Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Unlocked</span>
                </>
              )}
            </Button>
          </div>

          {/* Image Size - Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-width" className="text-xs font-medium">
                Width: {Math.round((imageWidth || 0.25) * 100)}%
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={Math.round((imageWidth || 0.25) * 100)}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1) / 100;
                    handleWidthChange(val);
                  }}
                  className="w-16 h-7 text-xs text-right"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[Math.min(Math.round((imageWidth || 0.25) * 100), 200)]}
              onValueChange={([value]) => handleWidthChange(value / 100)}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Image Size - Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-height" className="text-xs font-medium">
                Height: {Math.round((imageHeight || 0.25) * 100)}%
              </Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={Math.round((imageHeight || 0.25) * 100)}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1) / 100;
                    handleHeightChange(val);
                  }}
                  className="w-16 h-7 text-xs text-right"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
            <Slider
              value={[Math.min(Math.round((imageHeight || 0.25) * 100), 200)]}
              onValueChange={([value]) => handleHeightChange(value / 100)}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Quick Resize Actions */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Quick Resize</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-7 gap-1"
                onClick={() => {
                  if (imageWidth && imageHeight) {
                    onImageWidthChange?.(Math.max(0.02, imageWidth * 0.9));
                    onImageHeightChange?.(Math.max(0.02, imageHeight * 0.9));
                  }
                }}
                title="Shrink by 10%"
              >
                <ZoomOut className="w-3 h-3" />
                -10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs h-7 gap-1"
                onClick={() => {
                  if (imageWidth && imageHeight) {
                    onImageWidthChange?.(Math.min(3.0, imageWidth * 1.1));
                    onImageHeightChange?.(Math.min(3.0, imageHeight * 1.1));
                  }
                }}
                title="Enlarge by 10%"
              >
                <ZoomIn className="w-3 h-3" />
                +10%
              </Button>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-rotation" className="text-xs font-medium">
                Rotation: {rotation}°
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
                onClick={() => onRotationChange?.(0)}
                title="Reset rotation to 0°"
              >
                Reset 0°
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateLeft}
                title="Rotate Left 15°"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Slider
                value={[rotation]}
                onValueChange={handleRotationSlider}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateRight}
                title="Rotate Right 15°"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  value={rotation}
                  onChange={handleRotationInput}
                  min={0}
                  max={360}
                  className="w-20 h-8 text-xs"
                />
                <span className="text-xs text-muted-foreground">degrees</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => onRotationChange?.((rotation + 90) % 360)}
                  title="Rotate 90° clockwise"
                >
                  +90°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => onRotationChange?.((rotation + 180) % 360)}
                  title="Flip 180°"
                >
                  180°
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : isShapeMode ? (
        <>
          {/* Shape Size - Width */}
          <div className="space-y-2">
            <Label htmlFor="shape-width">
              Width: {Math.round(shapeWidth * 100)}%
            </Label>
            <Slider
              value={[Math.min(shapeWidth * 100, 200)]}
              onValueChange={([value]) => onShapeWidthChange?.(value / 100)}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Shape Size - Height */}
          <div className="space-y-2">
            <Label htmlFor="shape-height">
              Height: {Math.round(shapeHeight * 100)}%
            </Label>
            <Slider
              value={[Math.min(shapeHeight * 100, 200)]}
              onValueChange={([value]) => onShapeHeightChange?.(value / 100)}
              min={1}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Shape Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) =>
                  onColorChange(normalizeHexColor(e.target.value))
                }
                className="w-12 h-8 p-1"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2">
            <Label htmlFor="rotation">Rotation: {rotation}°</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateLeft}
                title="Rotate Left 15°"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Slider
                value={[rotation]}
                onValueChange={handleRotationSlider}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateRight}
                title="Rotate Right 15°"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={rotation}
                onChange={handleRotationInput}
                min={0}
                max={360}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">degrees</span>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Font Family */}
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select value={fontFamily} onValueChange={onFontFamilyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Standard Fonts</SelectLabel>
                  {fontGroups.standard.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Unicode Hindi (Recommended)</SelectLabel>
                  {fontGroups.unicodeHindi.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Legacy Hindi (Typing Only)</SelectLabel>
                  {fontGroups.legacyHindi.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>

                <SelectGroup>
                  <SelectLabel>Decorative Fonts</SelectLabel>
                  {fontGroups.decorative.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Apply Font to Selected Text */}
          {onApplyFontToSelection && (
            <div className="space-y-2" onMouseDown={(e) => {
              // Prevent blur on editor when interacting with select
              e.preventDefault();
            }}>
              <Label htmlFor="apply-font">Apply Font to Selection</Label>
              <Select onValueChange={onApplyFontToSelection}>
                <SelectTrigger onMouseDown={(e) => e.preventDefault()}>
                  <SelectValue placeholder="Select font to apply" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Standard Fonts</SelectLabel>
                    {fontGroups.standard.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Unicode Hindi (Recommended)</SelectLabel>
                    {fontGroups.unicodeHindi.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Legacy Hindi (Typing Only)</SelectLabel>
                    {fontGroups.legacyHindi.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectGroup>

                  <SelectGroup>
                    <SelectLabel>Decorative Fonts</SelectLabel>
                    {fontGroups.decorative.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Font Size */}
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => onFontSizeChange?.(value)}
              min={8}
              max={72}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <Label>Alignment</Label>
            <div className="flex gap-2">
              <Button
                variant={textAlign === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => onTextAlignChange?.("left")}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>

              <Button
                variant={textAlign === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => onTextAlignChange?.("center")}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>

              <Button
                variant={textAlign === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => onTextAlignChange?.("right")}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </Button>

              <Button
                variant={textAlign === "justify" ? "default" : "outline"}
                size="sm"
                onClick={() => onTextAlignChange?.("justify")}
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Text Style */}
          <div className="space-y-2">
            <Label>Text Style</Label>
            <div className="flex gap-2">
              <Button
                variant={bold ? "default" : "outline"}
                size="sm"
                onClick={onBoldToggle}
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={italic ? "default" : "outline"}
                size="sm"
                onClick={onItalicToggle}
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Text Color</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) =>
                  onColorChange(normalizeHexColor(e.target.value))
                }
                className="w-12 h-8 p-1"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>

          {/* Rotation Controls */}
          <div className="space-y-2">
            <Label htmlFor="rotation">Rotation: {rotation}°</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateLeft}
                title="Rotate Left 15°"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Slider
                value={[rotation]}
                onValueChange={handleRotationSlider}
                min={0}
                max={360}
                step={1}
                className="flex-1"
              />

              <Button
                variant="outline"
                size="icon"
                onClick={handleRotateRight}
                title="Rotate Right 15°"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={rotation}
                onChange={handleRotationInput}
                min={0}
                max={360}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">degrees</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
