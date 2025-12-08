import z from "zod";

export const DesignSchema = z.object({
    name: z.string().min(3, "Correct Design name is required").max(100, "Design name too long"),
    description: z.string().max(500, "Description too long").optional().default(""),
    catogary: z.string().min(1, "Category is required").max(500, "Category too long"), // Changed from optional to required
    tags: z.array(z.string().min(1, "Tag cannot be empty")).default([]),
    price: z.string().transform((val) => {
        const num = parseFloat(val);
        if (isNaN(num)) throw new Error("Price must be a valid number");
        return num;
    }).pipe(
        z.number().min(0, "Price cannot be negative")
    ),
    paid: z.boolean().default(false),
    placeholderImageFileName: z.string().min(4),
    pdfFileName: z.string().min(4)
});






export interface TextOverlay {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  color: string;
  page: number;
  visible: boolean;
  zIndex: number;
  fontFamilyClassName?: string;
  rotation: number; // Add rotation property (degrees)
  textAlign: "left" | "center" | "right" | "justify"; // NEW
}

export interface ShapeOverlay {
  id: string;
  type: "shape";
  shapeType: "square";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  page: number;
  visible: boolean;
  zIndex: number;
  rotation: number; // Add rotation property (degrees)
}

export type Overlay = TextOverlay | ShapeOverlay;
