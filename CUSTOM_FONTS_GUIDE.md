# Custom Fonts Guide

This guide explains how to add custom fonts to the PDF editor.

## Quick Overview

To add a custom font, you need to update **3 files**:
1. Add the font file to `public/fonts/`
2. Register it in `app/fonts.css`
3. Add it to `lib/custom-fonts.ts`
4. Add it to `components/formatting-toolbar.tsx`

---

## Step-by-Step Instructions

### Step 1: Add Font File

Place your `.ttf` or `.otf` font file in the `public/fonts/` directory.

```
public/
  fonts/
    YourFont.ttf  ← Add your font here
```

### Step 2: Register Font in CSS

Open `app/fonts.css` and add a `@font-face` declaration:

```css
@font-face {
  font-family: "Your Font Name";
  src: url("/fonts/YourFont.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

**Important Notes:**
- `font-family`: This is the name users will see in the dropdown
- `src`: Path must match your file in `public/fonts/`
- Use `format("truetype")` for `.ttf` files
- Use `format("opentype")` for `.otf` files

### Step 3: Register Font for PDF Export

Open `lib/custom-fonts.ts` and add your font to the `customFonts` array:

```typescript
export const customFonts: CustomFont[] = [
  // ... existing fonts ...
  {
    name: 'Your Font Name',
    url: '/fonts/YourFont.ttf',
    fontFamily: 'Your Font Name',
    format: 'truetype'
  }
];
```

**Important:** The `fontFamily` value must exactly match the `font-family` from Step 2.

### Step 4: Add Font to Dropdown

Open `components/formatting-toolbar.tsx` and add your font to the `customFonts` array:

```typescript
const customFonts = [
  'Noto Sans Devanagari',
  'AMS Aasmi',
  'Kruti Dev 640',
  'Your Font Name',  // ← Add here
];
```

---

## Complete Example: Adding "Roboto" Font

### 1. Download and place font
Download `Roboto-Regular.ttf` and place it in `public/fonts/`

### 2. Add to `app/fonts.css`
```css
@font-face {
  font-family: "Roboto";
  src: url("/fonts/Roboto-Regular.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

### 3. Add to `lib/custom-fonts.ts`
```typescript
export const customFonts: CustomFont[] = [
  // ... existing fonts ...
  {
    name: 'Roboto',
    url: '/fonts/Roboto-Regular.ttf',
    fontFamily: 'Roboto',
    format: 'truetype'
  }
];
```

### 4. Add to `components/formatting-toolbar.tsx`
```typescript
const customFonts = [
  'Noto Sans Devanagari',
  'AMS Aasmi',
  'Kruti Dev 640',
  'Roboto',  // ← Add here
];
```

### 5. Restart the dev server
```bash
npm run dev
```

---

## Font Formats

| Format | Extension | CSS Format Value |
|--------|-----------|------------------|
| TrueType | `.ttf` | `format("truetype")` |
| OpenType | `.otf` | `format("opentype")` |
| WOFF | `.woff` | `format("woff")` |
| WOFF2 | `.woff2` | `format("woff2")` |

**Recommendation:** Use `.ttf` files for best compatibility with pdf-lib.

---

## Special Considerations for Non-Latin Fonts

### Unicode vs Legacy Fonts

**Unicode Fonts** (Recommended):
- Support standard Unicode characters
- Work with both typing and copy-paste
- Examples: Noto Sans Devanagari, Arial Unicode MS

**Legacy Fonts** (Limited):
- Use custom character mappings
- Only work when typing with specific keyboards
- Don't work with copy-paste from web sources
- Examples: Kruti Dev, AMS Aasmi

### Hindi/Devanagari Fonts
For Hindi text that will be copied from Google Translate or other sources:
- ✅ Use: Noto Sans Devanagari, Mangal, or other Unicode fonts
- ❌ Avoid: Kruti Dev, AMS Aasmi (legacy fonts)

### Arabic Fonts
For Arabic text:
- Use Unicode Arabic fonts like Noto Sans Arabic
- Ensure the font supports right-to-left (RTL) text

### Chinese/Japanese/Korean Fonts
- Use comprehensive CJK fonts like Noto Sans CJK
- Note: These fonts are large (10-20MB), which may affect load times

---

## Troubleshooting

### Font doesn't appear in dropdown
- Check that you added it to `components/formatting-toolbar.tsx`
- Restart the dev server
- Clear browser cache

### Font shows in editor but not in exported PDF
- Check that you added it to `lib/custom-fonts.ts`
- Verify the file path is correct
- Check browser console for font loading errors

### Text shows as boxes in exported PDF
- The font may not support those characters
- For non-Latin text, use a Unicode font (see above)
- Check that the font file isn't corrupted

### Font file is too large
- Consider using WOFF2 format (smaller file size)
- Use font subsetting tools to include only needed characters
- For web fonts, consider loading from CDN

---

## Best Practices

1. **Use descriptive names**: "Roboto Bold" instead of "RobotoBold"
2. **Test with actual content**: Verify the font supports all characters you need
3. **Keep files organized**: Use consistent naming in `public/fonts/`
4. **Document special fonts**: Add comments for fonts with specific use cases
5. **Consider file size**: Large fonts (>2MB) may slow down the app

---

## Font Licensing

⚠️ **Important:** Ensure you have the right to use and distribute any fonts you add.

- **Free fonts**: Google Fonts, Font Squirrel (check license)
- **Commercial fonts**: Verify your license allows web embedding
- **Open source fonts**: Check the license (OFL, MIT, etc.)

Common free font sources:
- [Google Fonts](https://fonts.google.com/)
- [Font Squirrel](https://www.fontsquirrel.com/)
- [Adobe Fonts](https://fonts.adobe.com/) (requires subscription)

---

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify all 4 steps were completed
3. Ensure font file is valid (test in a font viewer)
4. Check that font name is consistent across all files
