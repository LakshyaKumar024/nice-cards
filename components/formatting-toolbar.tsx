'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { normalizeHexColor } from '@/lib/color-utils';
import { Bold, Italic } from 'lucide-react';

interface FormattingToolbarProps {
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  onFontSizeChange?: (size: number) => void;
  onFontFamilyChange?: (family: string) => void;
  onBoldToggle?: () => void;
  onItalicToggle?: () => void;
  onColorChange: (color: string) => void;
  shapeWidth?: number;
  shapeHeight?: number;
  onShapeWidthChange?: (width: number) => void;
  onShapeHeightChange?: (height: number) => void;
}

// Custom fonts from public/fonts folder
// These fonts are defined in app/fonts.css
const customFonts = [
  // --- Unicode Recommended Fonts ---
  "Noto Sans Devanagari Regular",
  "Noto Sans Devanagari",

  // --- Legacy Hindi/Devanagari Fonts (Typing Only) ---
  "AMS Aasmi",
  "Kruti Dev 640",
  "Kruti Dev 010",
  "Kruti Dev 012",
  "Kruti Dev 021",
  "Kruti Dev 011",
  "Kruti Dev 240",
  "Kruti Dev 500",
  "Kruti Dev 501",
  "Kruti Dev 502",
  "Kruti Dev 680",
  "Kruti Dev 710",
  "Kruti Dev 712",
  "Kruti Dev 714",
  "Kruti Dev 732",

  // --- Other Hindi Fonts ---
  "A-SuperHindi-3 Bold",
  "A-SuperHindi-8 Normal",
  "BHARTIYA HINDI_112",
  "BHARTIYA HINDI_142",
  "ISFOC-TTBorder-1 Normal",

  // --- English/Latin Fonts ---
  "Arenski",
  "Arial",
  "ITC Bookman Demi Italic",
  "Embassy BT",
  "Monotype Corsiva Regular Italic",
];


const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  ...customFonts, // Add custom fonts to the list
];

export function FormattingToolbar({
  fontSize,
  fontFamily,
  bold,
  italic,
  color,
  onFontSizeChange,
  onFontFamilyChange,
  onBoldToggle,
  onItalicToggle,
  onColorChange,
  shapeWidth,
  shapeHeight,
  onShapeWidthChange,
  onShapeHeightChange,
}: FormattingToolbarProps) {
  const isShapeMode = shapeWidth !== undefined && shapeHeight !== undefined;

  return (
    <div className="p-4 space-y-4">
      {isShapeMode ? (
        <>
          {/* Shape Size - Width */}
          <div className="space-y-2">
            <Label htmlFor="shape-width">Width: {Math.round(shapeWidth * 100)}%</Label>
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
            <Label htmlFor="shape-height">Height: {Math.round(shapeHeight * 100)}%</Label>
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
                onChange={(e) => onColorChange(normalizeHexColor(e.target.value))}
                className="w-12 h-8 p-1"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
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
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
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
                onChange={(e) => onColorChange(normalizeHexColor(e.target.value))}
                className="w-12 h-8 p-1"
              />
              <span className="text-sm text-muted-foreground">{color}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}