// lib/custom-fonts.ts
export interface CustomFont {
  name: string;
  url: string;
  fontFamily: string;
  format: 'truetype';
}

export const customFonts: CustomFont[] = [
  {
    name: "BHARTIYA HINDI 100",
    url: "/fonts/A0047636.TTF",
    fontFamily: "BHARTIYA HINDI_100",
    format: "truetype",
  },
  {
    name: "AMS Aasmi (Legacy - typing only)",
    url: "/fonts/AMS Aasmi.ttf",
    fontFamily: "AMS Aasmi",
    format: "truetype",
  },
  {
    name: "Arenski",
    url: "/fonts/ARENSKI.TTF",
    fontFamily: "Arenski",
    format: "truetype",
  },
  {
    name: "A-SuperHindi-3 Bold",
    url: "/fonts/ASUPER_1.TTF",
    fontFamily: "A-SuperHindi-3 Bold",
    format: "truetype",
  },
  {
    name: "A-SuperHindi-8 Normal",
    url: "/fonts/asuper_8.ttf",
    fontFamily: "A-SuperHindi-8 Normal",
    format: "truetype",
  },
  {
    name: "BHARTIYA HINDI 089",
    url: "/fonts/bf089hin.ttf",
    fontFamily: "BHARTIYA HINDI_089",
    format: "truetype",
  },
  {
    name: "BHARTIYA HINDI 112",
    url: "/fonts/bf112hin.ttf",
    fontFamily: "BHARTIYA HINDI_112",
    format: "truetype",
  },
  {
    name: "BHARTIYA HINDI 142",
    url: "/fonts/bf142hin.ttf",
    fontFamily: "BHARTIYA HINDI_142",
    format: "truetype",
  },
  {
    name: "ITC Bookman Demi Italic",
    url: "/fonts/bokr76w.ttf",
    fontFamily: "ITC Bookman Demi Italic",
    format: "truetype",
  },
  {
    name: "ISFOC TTBorder 1 Normal",
    url: "/fonts/BR010NTT.TTF",
    fontFamily: "ISFOC-TTBorder-1 Normal",
    format: "truetype",
  },
  {
    name: "DF Calligraphic Ornaments LET",
    url: "/fonts/CALIGORN.TTF",
    fontFamily: "DF Calligraphic Ornaments LET",
    format: "truetype",
  },
  {
    name: "Embassy BT",
    url: "/fonts/EMBASSYN.TTF",
    fontFamily: "Embassy BT",
    format: "truetype",
  },
  {
    name: "Kruti Dev 010",
    url: "/fonts/K010.TTF",
    fontFamily: "Kruti Dev 010",
    format: "truetype",
  },
  {
    name: "Kruti Dev 012",
    url: "/fonts/K012.TTF",
    fontFamily: "Kruti Dev 012",
    format: "truetype",
  },
  {
    name: "Kruti Dev 021",
    url: "/fonts/K021.TTF",
    fontFamily: "Kruti Dev 021",
    format: "truetype",
  },
  {
    name: "Kruti Dev 011",
    url: "/fonts/K11.TTF",
    fontFamily: "Kruti Dev 011",
    format: "truetype",
  },
  {
    name: "Kruti Dev 240",
    url: "/fonts/K240.TTF",
    fontFamily: "Kruti Dev 240",
    format: "truetype",
  },
  {
    name: "Kruti Dev 500",
    url: "/fonts/K500.TTF",
    fontFamily: "Kruti Dev 500",
    format: "truetype",
  },
  {
    name: "Kruti Dev 501",
    url: "/fonts/K501.TTF",
    fontFamily: "Kruti Dev 501",
    format: "truetype",
  },
  {
    name: "Kruti Dev 502",
    url: "/fonts/K502.TTF",
    fontFamily: "Kruti Dev 502",
    format: "truetype",
  },
  {
    name: "Kruti Dev 640 (Legacy - typing only)",
    url: "/fonts/KR640.TTF",
    fontFamily: "Kruti Dev 640",
    format: "truetype",
  },
  {
    name: "Kruti Dev 680",
    url: "/fonts/KR680.TTF",
    fontFamily: "Kruti Dev 680",
    format: "truetype",
  },
  {
    name: "Kruti Dev 710",
    url: "/fonts/KR710.TTF",
    fontFamily: "Kruti Dev 710",
    format: "truetype",
  },
  {
    name: "Kruti Dev 712",
    url: "/fonts/KR712.TTF",
    fontFamily: "Kruti Dev 712",
    format: "truetype",
  },
  {
    name: "Kruti Dev 714",
    url: "/fonts/KR714.TTF",
    fontFamily: "Kruti Dev 714",
    format: "truetype",
  },
  {
    name: "Kruti Dev 732",
    url: "/fonts/KR732.TTF",
    fontFamily: "Kruti Dev 732",
    format: "truetype",
  },
  {
    name: "Martel Bold",
    url: "/fonts/Martel-Bold.ttf",
    fontFamily: "Martel Bold",
    format: "truetype",
  },
  {
    name: "Martel",
    url: "/fonts/Martel-Regular.ttf",
    fontFamily: "Martel",
    format: "truetype",
  },
  {
    name: "Monotype Corsiva Regular Italic",
    url: "/fonts/Monotype-Corsiva-Regular-Italic.ttf",
    fontFamily: "Monotype Corsiva Regular Italic",
    format: "truetype",
  },
  {
    name: "Noto Sans Devanagari (Unicode - recommended)",
    url: "/fonts/NotoSansDevanagari.ttf",
    fontFamily: "Noto Sans Devanagari Regular",
    format: "truetype",
  },
  {
    name: "Rozha One Regular",
    url: "/fonts/RozhaOne-Regular.ttf",
    fontFamily: "Rozha One Regular",
    format: "truetype",
  },
  {
    name: "Teko Bold",
    url: "/fonts/Teko-Bold.ttf",
    fontFamily: "Teko Bold",
    format: "truetype",
  },
  {
    name: "Teko Medium",
    url: "/fonts/Teko-Medium.ttf",
    fontFamily: "Teko Medium",
    format: "truetype",
  },
  {
    name: "Teko Regular",
    url: "/fonts/Teko-Regular.ttf",
    fontFamily: "Teko Regular",
    format: "truetype",
  }
];


export async function loadCustomFont(fontFamily: string): Promise<ArrayBuffer | null> {
  try {
    const font = customFonts.find(f => f.fontFamily === fontFamily);
    if (!font) {
      console.warn(`Custom font not found: ${fontFamily}`);
      return null;
    }

    const response = await fetch(font.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${font.name}. Status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

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