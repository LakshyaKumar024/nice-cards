# Slate.js Migration Guide - PDF Canvas Rich Text Editor

## Overview

The `pdf-canvas.tsx` component has been successfully rewritten to use **Slate.js** as the rich text editing engine, replacing the fragile `contentEditable` implementation. This provides a robust, Canva-like text editing experience with full support for multi-font, multi-size, and multi-color text within the same line.

## What Changed

### Before (contentEditable)
- Used raw HTML `contentEditable` with manual DOM manipulation
- Relied on `<mark>` tags and `highlightRange` hacks for selection tracking
- Fragile HTML parsing with browser-generated garbage
- Manual span injection for font changes
- Selection state lost when toolbar received focus

### After (Slate.js)
- Professional rich text editor with proper document model
- Clean, predictable HTML output
- Robust selection handling that survives focus changes
- Proper text formatting with Slate transforms
- No more browser-generated HTML artifacts

## Key Features

### ✅ Maintained Compatibility
- **Zero breaking changes** to other files
- All props remain identical: `overlays`, `onUpdateOverlay`, `onSelectOverlay`, etc.
- Formatting toolbar works exactly as before
- Export utils receive clean HTML (no changes needed)
- Layers panel integration unchanged

### ✅ Enhanced Capabilities
1. **Multi-font support**: Different fonts in the same line
2. **Multi-size support**: Different font sizes in the same line
3. **Multi-color support**: Different colors in the same line
4. **Inline formatting**: Bold, italic work on selections
5. **Multi-line text**: Proper paragraph handling with line breaks
6. **Clean HTML output**: No browser garbage, only semantic HTML

### ✅ Preserved Behaviors
- Absolute positioning of overlays
- Drag-to-move functionality
- Click to select, double-click to edit
- Rotation of text boxes
- Text alignment (left/center/right/justify)
- Escape key to exit edit mode
- All keyboard shortcuts

## Technical Implementation

### Architecture

```typescript
// Slate custom types
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
};

type ParagraphElement = {
  type: "paragraph";
  align?: "left" | "center" | "right" | "justify";
  children: CustomText[];
};
```

### HTML ↔ Slate Conversion

**HTML to Slate** (`htmlToSlate`):
- Parses HTML using DOMParser
- Extracts `data-font` attributes and inline styles
- Preserves formatting (bold, italic, colors, sizes)
- Handles line breaks and block elements
- Creates proper Slate document structure

**Slate to HTML** (`slateToHtml`):
- Serializes Slate nodes to clean HTML
- Generates `<span>` tags with inline styles
- Includes `data-font` attributes for export compatibility
- Uses `<br>` for line breaks
- No browser-generated artifacts

### Editor Management

Each text overlay gets its own Slate editor instance:
```typescript
const [slateEditors] = useState<Map<string, ReactEditor & BaseEditor>>(new Map());
const [slateValues, setSlateValues] = useState<Map<string, Descendant[]>>(new Map());
```

### Font Application

The `applyFontToSelection` function now uses Slate transforms:
```typescript
Transforms.setNodes(
  editor,
  { fontFamily },
  { match: Text.isText, split: true }
);
```

This properly splits text nodes and applies formatting only to the selection.

## Usage

### For Users

**Editing text:**
1. Double-click a text overlay to enter edit mode
2. Select text with mouse or keyboard
3. Use the formatting toolbar to apply fonts, sizes, colors
4. Press Escape to exit edit mode

**Applying fonts to selections:**
1. Enter edit mode (double-click)
2. Select the text you want to format
3. Use the "Apply Font to Selection" dropdown in the toolbar
4. The font applies only to the selected text

### For Developers

**Adding new formatting options:**

```typescript
// In pdf-canvas.tsx, add to CustomText type:
type CustomText = {
  text: string;
  // ... existing properties
  underline?: boolean; // NEW
};

// Update renderLeaf to handle it:
const renderLeaf = useCallback((props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  let style: React.CSSProperties = {};
  
  if (leaf.underline) {
    style.textDecoration = "underline";
  }
  
  return <span {...attributes} style={style}>{children}</span>;
}, []);

// Add a function to apply it:
const applyUnderline = useCallback(() => {
  applyFormattingToSelection({ underline: true });
}, [applyFormattingToSelection]);
```

## PDF Export Enhancements

The `export-utils.ts` has been enhanced to properly parse inline styles from Slate-generated HTML:

### What Was Fixed:
- **Inline bold/italic**: Now parses `font-weight: bold` and `font-style: italic` from HTML
- **Per-segment font sizes**: Supports different font sizes within the same line
- **Per-segment colors**: Supports different colors within the same line
- **Mixed formatting**: Properly handles text with mixed bold/non-bold, different sizes, etc.

### How It Works:
The `walk()` function now extracts:
```typescript
// From inline styles
el.style.fontWeight === "bold" → isBold = true
el.style.fontStyle === "italic" → isItalic = true
el.style.fontSize → fontSize = parsed value
el.style.color → color = value

// From HTML tags
<strong>, <b> → isBold = true
<em>, <i> → isItalic = true
```

Each text segment now carries its own formatting:
```typescript
{
  text: "Hello",
  font: resolvedFont,
  fontSize: 24,
  color: "#FF0000",
  bold: true,
  italic: false
}
```

The PDF rendering uses per-segment properties instead of overlay-level defaults.

## HTML Output Format

The Slate editor generates clean, semantic HTML:

```html
<!-- Single font -->
<span style="font-family: 'Arial', sans-serif" data-font="Arial">Hello World</span>

<!-- Multi-font in same line -->
<span style="font-family: 'Arial', sans-serif" data-font="Arial">Hello </span><span style="font-family: 'Times New Roman', sans-serif" data-font="Times New Roman">World</span>

<!-- With formatting -->
<span style="font-family: 'Arial', sans-serif; font-size: 24px; color: #FF0000; font-weight: bold" data-font="Arial">Bold Red Text</span>

<!-- Multi-line -->
<span>Line 1</span><br><span>Line 2</span>
```

This format is:
- Compatible with `export-utils.ts` (PDF export)
- Compatible with `layers-panel.tsx` (preview)
- Clean and predictable (no browser artifacts)

## Dependencies Added

```json
{
  "slate": "^0.120.0",
  "slate-react": "^0.120.0",
  "slate-history": "^0.113.1"
}
```

## Testing Checklist

- [x] Text overlays render correctly
- [x] Double-click enters edit mode
- [x] Single-click selects overlay
- [x] Escape exits edit mode
- [x] Drag-to-move works
- [x] Rotation works
- [x] Font family changes work (whole overlay)
- [x] Font size changes work (whole overlay)
- [x] Bold/italic toggles work (whole overlay)
- [x] Color changes work (whole overlay)
- [x] Text alignment works
- [x] Apply font to selection works (partial text)
- [x] Multi-line text works
- [x] HTML export is clean
- [x] PDF export works correctly
- [x] No TypeScript errors
- [x] Build succeeds

## Migration Notes

### No Changes Required In:
- `components/formatting-toolbar.tsx` - Works as-is
- `components/layers-panel.tsx` - Works as-is
- `components/pdf-editor.tsx` - Works as-is
- `lib/types.ts` - Works as-is

### Files Modified:
- `components/pdf-canvas.tsx` - Complete rewrite with Slate.js
- `lib/export-utils.ts` - Enhanced to parse inline styles (font-weight, font-style, font-size, color)
- `package.json` - Added Slate dependencies

## Known Limitations

1. **Undo/Redo**: Slate has built-in undo/redo (Ctrl+Z/Ctrl+Y) but it's per-editor instance. Global undo across overlays would require additional implementation.

2. **Copy/Paste**: Slate handles copy/paste well, but formatting may be lost when pasting from external sources. This is by design to prevent HTML injection.

3. **Selection Persistence**: Selection is maintained within the editor, but lost when clicking outside. This matches Canva's behavior.

## Future Enhancements

Possible improvements for future iterations:

1. **Rich Text Toolbar**: Add a floating toolbar that appears on text selection (like Medium)
2. **Keyboard Shortcuts**: Cmd+B for bold, Cmd+I for italic, etc.
3. **Text Styles**: Predefined text styles (Heading 1, Body, etc.)
4. **Link Support**: Add hyperlinks to text
5. **List Support**: Bullet points and numbered lists
6. **Find & Replace**: Search and replace text across overlays

## Troubleshooting

**Issue**: Text doesn't update when typing
- **Solution**: Check that `onChange` is properly connected and `onUpdateOverlay` is being called

**Issue**: Font changes don't apply to selection
- **Solution**: Ensure you're in edit mode (double-click) and have text selected

**Issue**: HTML output has unexpected tags
- **Solution**: Check the `slateToHtml` function - it should only generate `<span>` and `<br>` tags

**Issue**: PDF export shows wrong fonts
- **Solution**: Verify that `data-font` attributes are present in the HTML output

## Support

For questions or issues related to the Slate.js implementation, refer to:
- [Slate.js Documentation](https://docs.slatejs.org/)
- [Slate.js Examples](https://www.slatejs.org/examples/richtext)
- This codebase: `components/pdf-canvas.tsx`

---

**Migration completed successfully on**: December 7, 2025
**Slate.js version**: 0.120.0
**Zero breaking changes**: ✅ All existing functionality preserved
