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
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onColorChange: (color: string) => void;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
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
}: FormattingToolbarProps) {
  return (
    <div className="p-4 space-y-4">
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
          onValueChange={([value]) => onFontSizeChange(value)}
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
    </div>
  );
}