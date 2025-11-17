# Hindi Font Setup Instructions

## Problem
The current fonts (AMS Aasmi, Kruti Dev 640) are **legacy fonts** that don't use proper Unicode. They work when typing directly with a Hindi keyboard but fail when pasting Unicode text from Google Translate.

## Solution
Add a proper Unicode Hindi font like **Noto Sans Devanagari**.

## Steps

1. Download Noto Sans Devanagari:
   - Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari
   - Click "Download family"
   - Extract the ZIP file

2. Copy the font file:
   - Find `NotoSansDevanagari-Regular.ttf` in the extracted folder
   - Copy it to: `public/fonts/NotoSansDevanagari-Regular.ttf`

3. The font is already configured in the code - just add the file!

## Alternative: Use Mangal Font (Windows Built-in)
If you're on Windows, you can use the built-in Mangal font which supports Unicode Hindi.

## Why This Happens
- **Legacy fonts** (Kruti Dev, AMS Aasmi): Map ASCII characters to Hindi glyphs
  - Typing with Hindi keyboard: Sends ASCII codes → Works ✅
  - Pasting Unicode: Sends Unicode codes → Doesn't work ❌

- **Unicode fonts** (Noto Sans Devanagari, Mangal): Use proper Unicode
  - Both typing and pasting work ✅
