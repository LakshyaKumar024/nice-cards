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
  Italic,
  RotateCcw,
  RotateCw,
} from "lucide-react";

interface FormattingToolbarProps {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  rotation: number; // Add rotation prop
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (family: string) => void;
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onColorChange: (color: string) => void;
  onRotationChange?: (rotation: number) => void; // Add rotation change handler
  shapeWidth?: number;
  shapeHeight?: number;
  onShapeWidthChange?: (width: number) => void;
  onShapeHeightChange?: (height: number) => void;
  textAlign?: "left" | "center" | "right" | "justify";
  onTextAlignChange?: (align: "left" | "center" | "right" | "justify") => void;
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
    "Kruti Dev 011",
    "Kruti Dev 012",
    "Kruti Dev 021",
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
    "ISFOC-TTBorder-1 Normal",
  ],
  decorative: [
    "Arenski",
    "Arial",
    "DFCalligraphicOrnament",
    "Embassy BT",
    "ITC Bookman Demi Italic",
  ],
};

export function FormattingToolbar({
  fontSize,
  fontFamily,
  bold,
  italic,
  color,
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
  textAlign,
  onTextAlignChange,
}: FormattingToolbarProps) {
  const isShapeMode = shapeWidth !== undefined && shapeHeight !== undefined;

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
    onRotationChange?.(value % 360);
  };

  const handleRotationSlider = (value: number[]) => {
    onRotationChange?.(value[0]);
  };

  return (
    <div className="p-4 space-y-4">
      {isShapeMode ? (
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
