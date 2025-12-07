# Slate.js Quick Start Guide

## For End Users

### Basic Text Editing
1. **Create text**: Double-click anywhere on the PDF canvas
2. **Edit text**: Double-click an existing text overlay
3. **Exit editing**: Press `Escape` or click outside
4. **Move text**: Click and drag the text overlay
5. **Delete text**: Select overlay and press `Delete`

### Formatting Text
1. **Whole overlay formatting**:
   - Select the text overlay (single click)
   - Use the right sidebar to change:
     - Font family
     - Font size
     - Bold/Italic
     - Color
     - Alignment
     - Rotation

2. **Selection formatting** (NEW!):
   - Double-click to enter edit mode
   - Select specific text with mouse
   - Use "Apply Font to Selection" dropdown
   - Different fonts can now exist in the same line!

### Multi-Line Text
- Press `Enter` to create new lines
- Each line maintains its formatting
- Alignment applies to all lines

## For Developers

### Understanding the Architecture

```
pdf-editor.tsx
    ↓ (manages overlays state)
pdf-canvas.tsx
    ↓ (renders overlays)
SlateEditor component
    ↓ (Slate.js instance per overlay)
HTML output → overlay.text
    ↓ (saved to database)
export-utils.ts
    ↓ (parses HTML for PDF)
PDF output
```

### Key Components

#### 1. PDFCanvas Component
```typescript
// Main component that renders PDF and overlays
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
}: PDFCanvasProps)
```

#### 2. SlateEditor Component
```typescript
// Separate editor instance for each text overlay
function SlateEditor({
  overlay,
  editor,
  value,
  onChange,
  renderLeaf,
  renderElement,
  pageDimensions,
}: SlateEditorProps)
```

### State Management

```typescript
// One editor instance per overlay
const [slateEditors] = useState<Map<string, ReactEditor & BaseEditor>>(new Map());

// One Slate value per overlay
const [slateValues, setSlateValues] = useState<Map<string, Descendant[]>>(new Map());

// Currently editing overlay
const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
```

### HTML Conversion

#### HTML → Slate
```typescript
const value = htmlToSlate(
  overlay.text,
  overlay.fontFamily,
  overlay.fontSize,
  overlay.color
);
```

#### Slate → HTML
```typescript
const html = slateToHtml(
  value,
  overlay.fontFamily,
  overlay.fontSize,
  overlay.color
);
onUpdateOverlay(overlay.id, { text: html });
```

### Applying Formatting

```typescript
// Apply font to selection
const applyFontToSelection = useCallback((fontFamily: string) => {
  const editor = getEditorForOverlay(editingOverlayId);
  
  Transforms.setNodes(
    editor,
    { fontFamily },
    { match: Text.isText, split: true }
  );
}, [editingOverlayId]);
```

### Custom Slate Types

```typescript
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

### Rendering Leaves (Text Nodes)

```typescript
const renderLeaf = useCallback((props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;
  
  let style: React.CSSProperties = {};
  
  if (leaf.fontFamily) style.fontFamily = `"${leaf.fontFamily}", sans-serif`;
  if (leaf.fontSize) style.fontSize = `${leaf.fontSize}px`;
  if (leaf.color) style.color = leaf.color;
  if (leaf.bold) style.fontWeight = "bold";
  if (leaf.italic) style.fontStyle = "italic";

  return <span {...attributes} style={style}>{children}</span>;
}, []);
```

### Rendering Elements (Blocks)

```typescript
const renderElement = useCallback((props: RenderElementProps) => {
  const { attributes, children, element } = props;
  
  if (element.type === "paragraph") {
    return (
      <div {...attributes} style={{ textAlign: element.align || "left" }}>
        {children}
      </div>
    );
  }
  
  return <div {...attributes}>{children}</div>;
}, []);
```

## Common Tasks

### Adding a New Formatting Option

1. **Update CustomText type**:
```typescript
type CustomText = {
  // ... existing
  underline?: boolean; // NEW
};
```

2. **Update renderLeaf**:
```typescript
if (leaf.underline) {
  style.textDecoration = "underline";
}
```

3. **Update slateToHtml**:
```typescript
if (child.underline) {
  styles.push(`text-decoration: underline`);
}
```

4. **Update htmlToSlate**:
```typescript
if (el.style.textDecoration === "underline") {
  newStyles.underline = true;
}
```

5. **Update export-utils.ts** (if needed for PDF):
```typescript
// Add underline support in walk() function
```

### Debugging Tips

#### Check Slate Value
```typescript
console.log('Slate value:', slateValues.get(overlayId));
```

#### Check HTML Output
```typescript
console.log('HTML:', overlay.text);
```

#### Check Editor Selection
```typescript
const editor = getEditorForOverlay(overlayId);
console.log('Selection:', editor.selection);
```

#### Check Parsed Segments (in export)
```typescript
console.log('Segments:', segments);
```

## Testing Checklist

### Basic Functionality
- [ ] Create new text overlay
- [ ] Edit existing text overlay
- [ ] Delete text overlay
- [ ] Move text overlay
- [ ] Rotate text overlay

### Formatting
- [ ] Change font family (whole overlay)
- [ ] Change font size (whole overlay)
- [ ] Toggle bold (whole overlay)
- [ ] Toggle italic (whole overlay)
- [ ] Change color (whole overlay)
- [ ] Change alignment (whole overlay)
- [ ] Apply font to selection (partial text)

### Multi-Line
- [ ] Create multi-line text
- [ ] Format individual lines differently
- [ ] Alignment works on all lines

### Export
- [ ] Export to PDF
- [ ] Fonts render correctly
- [ ] Colors render correctly
- [ ] Sizes render correctly
- [ ] Bold/italic render correctly
- [ ] Multi-line renders correctly
- [ ] Mixed formatting renders correctly

### Edge Cases
- [ ] Empty text overlay
- [ ] Very long text
- [ ] Special characters
- [ ] Unicode (Hindi fonts)
- [ ] Multiple overlays on same page
- [ ] Overlapping overlays

## Performance Optimization

### Current Optimizations
- ✅ Lazy editor creation (only when needed)
- ✅ useCallback for event handlers
- ✅ Memoized render functions
- ✅ Font caching in export
- ✅ Efficient HTML parsing

### Future Optimizations
- Virtual scrolling for many overlays
- Debounced HTML serialization
- Web Worker for PDF export
- Incremental font loading

## Troubleshooting

### Issue: Text doesn't update
**Solution**: Check that onChange is calling onUpdateOverlay with the HTML

### Issue: Selection lost when clicking toolbar
**Solution**: This is expected - Slate maintains selection internally, but it's cleared on blur

### Issue: Font doesn't apply to selection
**Solution**: Ensure you're in edit mode (double-click) and have text selected

### Issue: Export shows wrong formatting
**Solution**: Check that inline styles are present in overlay.text HTML

### Issue: Editor doesn't focus
**Solution**: Check that ReactEditor.focus() is being called in useEffect

## Resources

- [Slate.js Documentation](https://docs.slatejs.org/)
- [Slate.js Examples](https://www.slatejs.org/examples/richtext)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- Project files:
  - `components/pdf-canvas.tsx` - Main implementation
  - `lib/export-utils.ts` - PDF export logic
  - `SLATE_MIGRATION_GUIDE.md` - Full migration guide

## Support

For issues or questions:
1. Check the console for errors
2. Review the Slate.js documentation
3. Check the implementation in `pdf-canvas.tsx`
4. Review the export logic in `export-utils.ts`

---

**Happy coding! 🚀**
