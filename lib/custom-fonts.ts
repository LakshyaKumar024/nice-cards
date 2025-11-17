// lib/custom-fonts.ts
export interface CustomFont {
    name: string;
    url: string;
    fontFamily: string;
    format: 'truetype';
  }
  
  export const customFonts: CustomFont[] = [
    {
      name: 'AMS Aasmi (Legacy - typing only)',
      url: '/fonts/AMS Aasmi.ttf',
      fontFamily: 'AMS Aasmi',
      format: 'truetype'
    },
    {
      name: 'Kruti Dev 640 (Legacy - typing only)', 
      url: '/fonts/KR640.TTF',
      fontFamily: 'Kruti Dev 640',
      format: 'truetype'
    },
    {
      name: 'Noto Sans Devanagari (Unicode - recommended)',
      url: '/fonts/NotoSansDevanagari.ttf',
      fontFamily: 'Noto Sans Devanagari',
      format: 'truetype'
    }
  ];
  
  export async function loadCustomFont(fontFamily: string): Promise<ArrayBuffer | null> {
    try {
      const font = customFonts.find(f => f.fontFamily === fontFamily);
      if (!font) {
        console.warn(`Custom font not found: ${fontFamily}`);
        return null;
      }
  
      console.log(`Loading TTF font: ${font.name} from ${font.url}`);
      const response = await fetch(font.url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch font: ${font.name}. Status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      console.log(`Successfully loaded TTF font: ${font.name}, size: ${arrayBuffer.byteLength} bytes`);
      
      return arrayBuffer;
    } catch (error) {
      console.error(`Error loading custom font ${fontFamily}:`, error);
      return null;
    }
  }
  
  // Check if font is a custom font
  export function isCustomFont(fontFamily: string): boolean {
    return customFonts.some(font => font.fontFamily === fontFamily);
  }
  
  // Get all custom font families
  export function getCustomFontFamilies(): string[] {
    return customFonts.map(font => font.fontFamily);
  }