// lib/color-utils.ts
export function normalizeHexColor(color: string): string {
  // Ensure color is in #RRGGBB format
  if (color.startsWith('#')) {
    if (color.length === 4) {
      // Convert #RGB to #RRGGBB
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    if (color.length === 7) {
      return color;
    }
  }
  // Default to black if invalid
  return '#000000';
}