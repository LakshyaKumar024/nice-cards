"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Skeleton } from "@/components/ui/skeleton";
import type { Overlay, TextOverlay, ShapeOverlay } from "@/lib/types";
import {
  createEditor,
  Descendant,
  Editor,
  Transforms,
  Text,
  BaseEditor,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  RenderLeafProps,
  RenderElementProps,
} from "slate-react";
import { withHistory } from "slate-history";

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

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

type CustomElement = ParagraphElement;

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface PDFCanvasProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  overlays: Overlay[];
  selectedOverlayId: string | null;
  onSelectOverlay: (id: string | null) => void;
  onUpdateOverlay: (
    id: string,
    updates: Partial<TextOverlay> | Partial<ShapeOverlay>
  ) => void;
  onAddOverlay: (overlay: Omit<TextOverlay, "id">) => void;
  onAddShape: (x: number, y: number) => void;
  toolMode: "text" | "shape";
  onApplyFontRef?: (ref: (fontFamily: string) => void) => void;
}

// Helper: Convert HTML to Slate value
function htmlToSlate(
  html: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultFont: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultSize: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultColor: string
): Descendant[] {
  if (!html || html.trim() === "") {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const paragraphs: ParagraphElement[] = [];

  function extractTextNodes(
    node: ChildNode | HTMLElement,
    currentStyles: Partial<CustomText> = {}
  ): CustomText[] {
    const texts: CustomText[] = [];

    const children = "childNodes" in node ? Array.from(node.childNodes) : [];

    for (const child of children) {
      if (child.nodeType === 3) {
        // Text node
        const text = child.textContent || "";
        if (text) {
          texts.push({ text, ...currentStyles });
        }
      } else if (child.nodeType === 1) {
        // Element node
        const el = child as HTMLElement;
        const newStyles = { ...currentStyles };

        // Extract font from data-font attribute or inline style
        const dataFont = el.getAttribute("data-font");
        if (dataFont) newStyles.fontFamily = dataFont;

        const inlineFont = el.style.fontFamily;
        if (inlineFont && !newStyles.fontFamily) {
          newStyles.fontFamily = inlineFont
            .replace(/['"]/g, "")
            .split(",")[0]
            .trim();
        }

        // Extract other styles
        if (el.style.fontSize) {
          newStyles.fontSize = parseInt(el.style.fontSize);
        }
        if (el.style.color) {
          newStyles.color = el.style.color;
        }
        if (
          el.tagName === "STRONG" ||
          el.tagName === "B" ||
          el.style.fontWeight === "bold"
        ) {
          newStyles.bold = true;
        }
        if (
          el.tagName === "EM" ||
          el.tagName === "I" ||
          el.style.fontStyle === "italic"
        ) {
          newStyles.italic = true;
        }

        // Handle BR and block elements
        if (el.tagName === "BR") {
          texts.push({ text: "\n", ...currentStyles });
        } else if (["DIV", "P"].includes(el.tagName)) {
          const childTexts = extractTextNodes(el, newStyles);
          texts.push(...childTexts);
          if (child.nextSibling) {
            texts.push({ text: "\n", ...currentStyles });
          }
        } else {
          texts.push(...extractTextNodes(el, newStyles));
        }
      }
    }

    return texts;
  }

  const bodyTexts = extractTextNodes(doc.body);

  // Split by newlines to create paragraphs
  let currentParagraph: CustomText[] = [];

  for (const textNode of bodyTexts) {
    if (textNode.text.includes("\n")) {
      const parts = textNode.text.split("\n");
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          currentParagraph.push({ ...textNode, text: parts[i] });
        }
        if (i < parts.length - 1) {
          if (currentParagraph.length > 0) {
            paragraphs.push({ type: "paragraph", children: currentParagraph });
            currentParagraph = [];
          } else {
            paragraphs.push({ type: "paragraph", children: [{ text: "" }] });
          }
        }
      }
    } else {
      currentParagraph.push(textNode);
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push({ type: "paragraph", children: currentParagraph });
  }

  return paragraphs.length > 0
    ? paragraphs
    : [{ type: "paragraph", children: [{ text: "" }] }];
}

// Helper: Convert Slate value to clean HTML
function slateToHtml(
  value: Descendant[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultFont: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultSize: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultColor: string
): string {
  const lines: string[] = [];

  for (const node of value) {
    if (SlateElement.isElement(node) && node.type === "paragraph") {
      const textParts: string[] = [];

      for (const child of node.children) {
        if (Text.isText(child)) {
          let text = child.text || "";

          // Build span with inline styles
          const styles: string[] = [];
          const attrs: string[] = [];

          if (child.fontFamily) {
            styles.push(`font-family: '${child.fontFamily}', sans-serif`);
            attrs.push(`data-font="${child.fontFamily}"`);
          }
          if (child.fontSize) {
            styles.push(`font-size: ${child.fontSize}px`);
          }
          if (child.color) {
            styles.push(`color: ${child.color}`);
          }
          if (child.bold) {
            styles.push(`font-weight: bold`);
          }
          if (child.italic) {
            styles.push(`font-style: italic`);
          }

          if (styles.length > 0 || attrs.length > 0) {
            const styleAttr =
              styles.length > 0 ? ` style="${styles.join("; ")}"` : "";
            const dataAttrs = attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
            text = `<span${styleAttr}${dataAttrs}>${text}</span>`;
          }

          textParts.push(text);
        }
      }

      lines.push(textParts.join(""));
    }
  }

  return lines.join("<br>");
}

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
}: PDFCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [draggingOverlayId, setDraggingOverlayId] = useState<string | null>(
    null
  );
  const [isResizing, setIsResizing] = useState(false);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Slate editor instances - one per text overlay
  const [slateEditors] = useState<Map<string, ReactEditor & BaseEditor>>(
    new Map()
  );
  const [slateValues, setSlateValues] = useState<Map<string, Descendant[]>>(
    new Map()
  );

  // Create or get Slate editor for an overlay
  const getEditorForOverlay = useCallback(
    (overlayId: string) => {
      if (!slateEditors.has(overlayId)) {
        const editor = withHistory(withReact(createEditor()));
        slateEditors.set(overlayId, editor);
      }
      return slateEditors.get(overlayId)!;
    },
    [slateEditors]
  );

  const prevOverlaysRef = useRef<Overlay[]>([]);

  useEffect(() => {
    const textOverlays = overlays.filter(
      (o) => o.type === "text"
    ) as TextOverlay[];

    // Check if overlays actually changed
    const prevTextOverlays = prevOverlaysRef.current.filter(
      (o) => o.type === "text"
    ) as TextOverlay[];

    const hasChanged =
      textOverlays.length !== prevTextOverlays.length ||
      textOverlays.some((overlay, index) => {
        if (index >= prevTextOverlays.length) return true;
        const prevOverlay = prevTextOverlays[index];
        return (
          overlay.id !== prevOverlay.id ||
          overlay.text !== prevOverlay.text ||
          overlay.fontFamily !== prevOverlay.fontFamily ||
          overlay.fontSize !== prevOverlay.fontSize ||
          overlay.color !== prevOverlay.color ||
          overlay.textAlign !== prevOverlay.textAlign
        );
      });

    if (hasChanged) {
      const newSlateValues = new Map<string, Descendant[]>();

      for (const overlay of textOverlays) {
        const initialValue = htmlToSlate(
          overlay.text,
          overlay.fontFamily,
          overlay.fontSize,
          overlay.color
        );

        const valueWithAlign = initialValue.map((node) => {
          if (SlateElement.isElement(node) && node.type === "paragraph") {
            return { ...node, align: overlay.textAlign };
          }
          return node;
        });

        newSlateValues.set(overlay.id, valueWithAlign);
      }

      setSlateValues(newSlateValues);
      prevOverlaysRef.current = [...overlays]; // Update ref
    }
  }, [overlays]);

  // Update alignment when overlay textAlign changes
  useEffect(() => {
    if (editingOverlayId) {
      const overlay = overlays.find(
        (o) => o.id === editingOverlayId && o.type === "text"
      ) as TextOverlay | undefined;
      if (overlay) {
        const editor = getEditorForOverlay(editingOverlayId);
        const currentValue = slateValues.get(editingOverlayId);

        if (currentValue) {
          // Update all paragraphs with the new alignment
          const updatedValue = currentValue.map((node) => {
            if (SlateElement.isElement(node) && node.type === "paragraph") {
              return { ...node, align: overlay.textAlign };
            }
            return node;
          });

          // Only update if alignment actually changed
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const needsUpdate = currentValue.some((node, idx) => {
            if (SlateElement.isElement(node) && node.type === "paragraph") {
              return node.align !== overlay.textAlign;
            }
            return false;
          });

          if (needsUpdate) {
            editor.children = updatedValue;
            editor.onChange();
            setSlateValues((prev) =>
              new Map(prev).set(editingOverlayId, updatedValue)
            );
          }
        }
      }
    }
  }, [editingOverlayId, overlays, slateValues, getEditorForOverlay]);

  // Track last overlay properties to detect changes
  const lastOverlayPropsRef = useRef<
    Map<
      string,
      {
        fontSize: number;
        fontFamily: string;
        color: string;
        bold: boolean;
        italic: boolean;
      }
    >
  >(new Map());

  // Regenerate HTML when overlay-level properties change (for non-editing display)
  useEffect(() => {
    const textOverlays = overlays.filter(
      (o) => o.type === "text"
    ) as TextOverlay[];

    for (const overlay of textOverlays) {
      const currentValue = slateValues.get(overlay.id);
      if (currentValue && overlay.id !== editingOverlayId) {
        const lastProps = lastOverlayPropsRef.current.get(overlay.id);
        const currentProps = {
          fontSize: overlay.fontSize,
          fontFamily: overlay.fontFamily,
          color: overlay.color,
          bold: overlay.bold,
          italic: overlay.italic,
        };

        // Check if properties changed
        const propsChanged =
          !lastProps ||
          lastProps.fontSize !== currentProps.fontSize ||
          lastProps.fontFamily !== currentProps.fontFamily ||
          lastProps.color !== currentProps.color ||
          lastProps.bold !== currentProps.bold ||
          lastProps.italic !== currentProps.italic;

        if (propsChanged) {
          // Regenerate HTML with current overlay properties
          const newHtml = slateToHtml(
            currentValue,
            overlay.fontFamily,
            overlay.fontSize,
            overlay.color
          );

          // Update the overlay
          onUpdateOverlay(overlay.id, { text: newHtml });

          // Save current props
          lastOverlayPropsRef.current.set(overlay.id, currentProps);
        }
      }
    }
  }, [overlays, slateValues, editingOverlayId, onUpdateOverlay]);

  // Apply formatting to selection in Slate editor
  const applyFormattingToSelection = useCallback(
    (format: Partial<CustomText>) => {
      if (!editingOverlayId) {
        return;
      }

      const editor = getEditorForOverlay(editingOverlayId);

      if (editor.selection) {
        // Apply formatting to selected text
        Transforms.setNodes(editor, format, {
          match: Text.isText,
          split: true,
        });
      } else {
        // No selection - apply to entire overlay
        Transforms.setNodes(editor, format, { at: [], match: Text.isText });
      }
    },
    [editingOverlayId, getEditorForOverlay]
  );

  // Apply font to selection in Slate editor (for toolbar compatibility)
  const applyFontToSelection = useCallback(
    (fontFamily: string) => {
      applyFormattingToSelection({ fontFamily });
    },
    [applyFormattingToSelection]
  );

  // Pass applyFontToSelection to parent
  useEffect(() => {
    if (onApplyFontRef) {
      onApplyFontRef(applyFontToSelection);
    }
  }, [applyFontToSelection, onApplyFontRef]);

  // Handle keyboard for editing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && selectedOverlayId && !editingOverlayId) {
        event.preventDefault();
        setEditingOverlayId(selectedOverlayId);
      }
      if (event.key === "Escape") {
        event.preventDefault();
        if (editingOverlayId) {
          setEditingOverlayId(null);
        }
        onSelectOverlay(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedOverlayId, editingOverlayId, onSelectOverlay]);

  // Render PDF page
  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current || !pdfDocument) return;

      setIsLoading(true);
      setError(null);

      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Could not get canvas context");
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const scale = 1.5;
        const scaledViewport = page.getViewport({ scale });
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        setPageDimensions({
          width: scaledViewport.width,
          height: scaledViewport.height,
        });

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        renderTaskRef.current = page.render(renderContext);
        await renderTaskRef.current.promise;
        renderTaskRef.current = null;

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error && error.message.includes("cancelled")) {
          return;
        }
        console.error("Error rendering PDF page:", error);
        setError("Failed to render PDF page");
        setIsLoading(false);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDocument, pageNumber]);

  // Handle double-click to add new text or shape
  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const normalizedX = x / pageDimensions.width;
      const normalizedY = y / pageDimensions.height;

      if (toolMode === "shape") {
        onAddShape(normalizedX, normalizedY);
      } else {
        const newOverlay: Omit<TextOverlay, "id"> = {
          type: "text",
          text: "",
          x: normalizedX,
          y: normalizedY,
          fontSize: 16,
          fontFamily: "Arial",
          bold: false,
          italic: false,
          color: "#000000",
          page: pageNumber,
          visible: true,
          zIndex: overlays.length,
          rotation: 0,
          textAlign: "left",
        };

        onAddOverlay(newOverlay);
      }
    },
    [
      pageDimensions,
      pageNumber,
      overlays.length,
      isLoading,
      onAddOverlay,
      onAddShape,
      toolMode,
    ]
  );

  // Handle single click to select
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let clickedOverlay = null;

      for (const overlay of overlays) {
        if (overlay.page !== pageNumber) continue;

        if (overlay.type === "shape") {
          const shapeX = overlay.x * pageDimensions.width;
          const shapeY = overlay.y * pageDimensions.height;
          const shapeW = overlay.width * pageDimensions.width;
          const shapeH = overlay.height * pageDimensions.height;

          const adjustedShapeX = shapeX;
          const adjustedShapeY = shapeY;

          const isInside =
            x >= adjustedShapeX - shapeW / 2 &&
            x <= adjustedShapeX + shapeW / 2 &&
            y >= adjustedShapeY - shapeH / 2 &&
            y <= adjustedShapeY + shapeH / 2;

          if (isInside) {
            clickedOverlay = overlay;
            break;
          }
        } else {
          const textX = overlay.x * pageDimensions.width;
          const textY = overlay.y * pageDimensions.height;
          const clickRadius = 30;

          const adjustedTextX = textX;
          const adjustedTextY = textY;

          const isNearText =
            Math.abs(adjustedTextX - x) < clickRadius &&
            Math.abs(adjustedTextY - y) < clickRadius;

          if (isNearText) {
            clickedOverlay = overlay;
            break;
          }
        }
      }

      if (clickedOverlay) {
        onSelectOverlay(clickedOverlay.id);
        if (editingOverlayId && clickedOverlay.id !== editingOverlayId) {
          setEditingOverlayId(null);
        }
      } else {
        if (!editingOverlayId) {
          onSelectOverlay(null);
        }
      }
    },
    [
      overlays,
      pageNumber,
      pageDimensions,
      isLoading,
      onSelectOverlay,
      editingOverlayId,
    ]
  );

  const handleDragStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, overlayId: string) => {
      if (isResizing) return;

      event.stopPropagation();
      event.preventDefault();
      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay) return;

      onSelectOverlay(overlayId);
      setEditingOverlayId(null);

      document.body.classList.add("dragging");

      const startX = event.clientX;
      const startY = event.clientY;
      const dragThreshold = 5;
      let hasMoved = false;

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dragOffset = {
        x: event.clientX - centerX,
        y: event.clientY - centerY,
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!canvasRef.current) return;

        const deltaX = Math.abs(moveEvent.clientX - startX);
        const deltaY = Math.abs(moveEvent.clientY - startY);

        if (!hasMoved && (deltaX > dragThreshold || deltaY > dragThreshold)) {
          hasMoved = true;
          setDraggingOverlayId(overlayId);
        }

        if (!hasMoved) return;

        const canvas = canvasRef.current;
        const canvasRect = canvas.getBoundingClientRect();

        const newX = moveEvent.clientX - canvasRect.left - dragOffset.x;
        const newY = moveEvent.clientY - canvasRect.top - dragOffset.y;

        const normalizedX = Math.max(
          0,
          Math.min(1, newX / pageDimensions.width)
        );
        const normalizedY = Math.max(
          0,
          Math.min(1, newY / pageDimensions.height)
        );

        onUpdateOverlay(overlayId, {
          x: normalizedX,
          y: normalizedY,
        });
      };

      const handleMouseUp = () => {
        document.body.classList.remove("dragging");
        setDraggingOverlayId(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay, isResizing]
  );

  // Handle resize for shapes
  const handleResizeStart = useCallback(
    (
      event: React.MouseEvent,
      overlayId: string,
      handle: "n" | "s" | "e" | "w" | "se" | "sw" | "ne" | "nw"
    ) => {
      event.stopPropagation();
      event.preventDefault();
      setIsResizing(true);

      const overlay = overlays.find((o) => o.id === overlayId);
      if (!overlay || overlay.type !== "shape") {
        setIsResizing(false);
        return;
      }

      onSelectOverlay(overlayId);

      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = overlay.width;
      const startHeight = overlay.height;
      const startXPos = overlay.x;
      const startYPos = overlay.y;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!canvasRef.current) return;

        const deltaX = (moveEvent.clientX - startX) / pageDimensions.width;
        const deltaY = (moveEvent.clientY - startY) / pageDimensions.height;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newX = startXPos;
        let newY = startYPos;

        if (handle === "e") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newX = startXPos + deltaX / 2;
        } else if (handle === "w") {
          newWidth = Math.max(0.01, startWidth - deltaX);
          newX = startXPos + deltaX / 2;
        } else if (handle === "s") {
          newHeight = Math.max(0.01, startHeight + deltaY);
          newY = startYPos + deltaY / 2;
        } else if (handle === "n") {
          newHeight = Math.max(0.01, startHeight - deltaY);
          newY = startYPos + deltaY / 2;
        } else if (handle === "se") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
        } else if (handle === "sw") {
          newWidth = Math.max(0.01, startWidth - deltaX);
          newHeight = Math.max(0.01, startHeight + deltaY);
          newX = startXPos + (startWidth - newWidth) / 2;
        } else if (handle === "ne") {
          newWidth = Math.max(0.01, startWidth + deltaX);
          newHeight = Math.max(0.01, startHeight - deltaY);
          newY = startYPos + (startHeight - newHeight) / 2;
        } else if (handle === "nw") {
          newWidth = Math.max(0.01, startWidth - deltaX);
          newHeight = Math.max(0.01, startHeight - deltaY);
          newX = startXPos + (startWidth - newWidth) / 2;
          newY = startYPos + (startHeight - newHeight) / 2;
        }

        onUpdateOverlay(overlayId, {
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [overlays, pageDimensions, onSelectOverlay, onUpdateOverlay]
  );

  // Start editing when a new text overlay is selected
  useEffect(() => {
    if (selectedOverlayId && !editingOverlayId) {
      const overlay = overlays.find((o) => o.id === selectedOverlayId);
      if (overlay && overlay.type === "text" && overlay.text === "") {
        setEditingOverlayId(selectedOverlayId);
      }
    }
  }, [selectedOverlayId, editingOverlayId, overlays]);

  // Slate render functions
  const renderLeaf = useCallback(
    (props: RenderLeafProps): React.ReactElement => {
      const { attributes, children, leaf } = props;

      // eslint-disable-next-line prefer-const
      let style: React.CSSProperties = {};

      if (leaf.fontFamily) {
        style.fontFamily = `"${leaf.fontFamily}", sans-serif`;
      }
      if (leaf.fontSize) {
        style.fontSize = `${leaf.fontSize}px`;
      }
      if (leaf.color) {
        style.color = leaf.color;
      }
      if (leaf.bold) {
        style.fontWeight = "bold";
      }
      if (leaf.italic) {
        style.fontStyle = "italic";
      }

      return (
        <span {...attributes} style={style}>
          {children}
        </span>
      );
    },
    []
  );

  const renderElement = useCallback(
    (props: RenderElementProps): React.ReactElement => {
      const { attributes, children, element } = props;

      if (element.type === "paragraph") {
        return (
          <div {...attributes} style={{ textAlign: element.align || "left" }}>
            {children}
          </div>
        );
      }

      return <div {...attributes}>{children}</div>;
    },
    []
  );

  const currentPageOverlays = overlays
    .filter((overlay) => overlay.page === pageNumber)
    .sort((a, b) => a.zIndex - b.zIndex);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex justify-center">
      <div className="relative">
        {isLoading && <Skeleton className="w-[612px] h-[792px]" />}

        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onDoubleClick={handleCanvasDoubleClick}
          className={`border-2 border-blue-500 shadow-lg cursor-crosshair ${
            isLoading ? "hidden" : "block"
          }`}
          style={{
            boxShadow:
              "0 0 0 2px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />

        {!isLoading &&
          currentPageOverlays.map((overlay) => {
            if (overlay.type === "shape") {
              const shapeX = overlay.x * pageDimensions.width;
              const shapeY = overlay.y * pageDimensions.height;
              const shapeW = overlay.width * pageDimensions.width;
              const shapeH = overlay.height * pageDimensions.height;
              const isSelected = selectedOverlayId === overlay.id;
              const isDragging = draggingOverlayId === overlay.id;

              return (
                <div
                  key={overlay.id}
                  className={`absolute ${overlay.visible ? "" : "opacity-30"}`}
                  style={{
                    left: `${shapeX}px`,
                    top: `${shapeY}px`,
                    width: `${shapeW}px`,
                    height: `${shapeH}px`,
                    zIndex: overlay.zIndex + 10,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                  }}
                  onClick={(e) => {
                    if (isResizing || isDragging) {
                      e.stopPropagation();
                      return;
                    }
                    e.stopPropagation();
                    onSelectOverlay(overlay.id);
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: overlay.color,
                      border: isSelected
                        ? "2px solid #3b82f6"
                        : "1px dashed #9ca3af",
                      cursor: "move",
                      opacity: isDragging ? 0.7 : 1,
                      transition: isDragging ? "none" : "all 0.2s",
                      borderRadius: "2px",
                      transformOrigin: "center center",
                    }}
                    onMouseDown={(e) => {
                      if (
                        (e.target as HTMLElement).closest(
                          "[data-resize-handle]"
                        )
                      ) {
                        return;
                      }
                      e.stopPropagation();
                      handleDragStart(
                        e as React.MouseEvent<HTMLDivElement>,
                        overlay.id
                      );
                    }}
                  />
                  {isSelected && (
                    <>
                      {/* Corner resize handles */}
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-nw-resize z-20 rounded-sm"
                        style={{ left: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "nw");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-ne-resize z-20 rounded-sm"
                        style={{ right: "-6px", top: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "ne");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-sw-resize z-20 rounded-sm"
                        style={{ left: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "sw");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 h-3 bg-blue-500 border-2 border-white cursor-se-resize z-20 rounded-sm"
                        style={{ right: "-6px", bottom: "-6px" }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "se");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Side resize handles */}
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border-2 border-white cursor-n-resize z-20 rounded-sm"
                        style={{
                          left: "50%",
                          top: "-6px",
                          transform: "translateX(-50%)",
                          width: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "n");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute h-3 bg-blue-500 border-2 border-white cursor-s-resize z-20 rounded-sm"
                        style={{
                          left: "50%",
                          bottom: "-6px",
                          transform: "translateX(-50%)",
                          width: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "s");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border-2 border-white cursor-e-resize z-20 rounded-sm"
                        style={{
                          right: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "e");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        data-resize-handle
                        className="absolute w-3 bg-blue-500 border-2 border-white cursor-w-resize z-20 rounded-sm"
                        style={{
                          left: "-6px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "20px",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleResizeStart(e, overlay.id, "w");
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </>
                  )}
                </div>
              );
            } else {
              // Text overlay rendering with Slate
              const textX = overlay.x * pageDimensions.width;
              const textY = overlay.y * pageDimensions.height;
              const isSelected = selectedOverlayId === overlay.id;
              const isDragging = draggingOverlayId === overlay.id;
              const isEditing = editingOverlayId === overlay.id;

              return (
                <div
                  key={overlay.id}
                  className={`absolute cursor-move select-none ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50 bg-opacity-50 rounded"
                      : "border border-dashed border-transparent hover:border-gray-400"
                  } ${overlay.visible ? "" : "opacity-30"} ${
                    isDragging ? "opacity-70" : ""
                  }`}
                  style={{
                    left: `${textX}px`,
                    top: `${textY}px`,
                    zIndex: overlay.zIndex + 10,
                    transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg)`,
                    pointerEvents: "auto",
                    maxWidth: `${pageDimensions.width * 0.8}px`,
                    backgroundColor: "transparent",
                    transition: isDragging ? "none" : "all 0.2s",
                    transformOrigin: "center center",
                    userSelect: isEditing ? "text" : "none",
                    WebkitUserSelect: isEditing ? "text" : "none",
                  }}
                  onMouseDown={(e) => {
                    if (!isEditing) {
                      e.preventDefault();
                      handleDragStart(e, overlay.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isEditing) {
                      onSelectOverlay(overlay.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingOverlayId(overlay.id);
                  }}
                >
                  {isEditing ? (
                    <SlateEditor
                      overlay={overlay}
                      editor={getEditorForOverlay(overlay.id)}
                      value={
                        slateValues.get(overlay.id) || [
                          { type: "paragraph", children: [{ text: "" }] },
                        ]
                      }
                      onChange={(newValue) => {
                        setSlateValues((prev) =>
                          new Map(prev).set(overlay.id, newValue)
                        );
                        const html = slateToHtml(
                          newValue,
                          overlay.fontFamily,
                          overlay.fontSize,
                          overlay.color
                        );
                        onUpdateOverlay(overlay.id, { text: html });
                      }}
                      renderLeaf={renderLeaf}
                      renderElement={renderElement}
                      pageDimensions={pageDimensions}
                    />
                  ) : (
                    <div
                      className="select-none"
                      style={{
                        textAlign: overlay.textAlign,
                        lineHeight: "1.2",
                        padding: "2px",
                        minWidth: "1px",
                        direction: "ltr",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                        cursor: "move",
                        whiteSpace: "pre",
                        fontSize: `${overlay.fontSize}px`,
                        fontFamily: `"${overlay.fontFamily}", sans-serif`,
                        fontWeight: overlay.bold ? "bold" : "normal",
                        fontStyle: overlay.italic ? "italic" : "normal",
                        color: overlay.color,
                      }}
                    >
                      {overlay.text ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: overlay.text }}
                        />
                      ) : (
                        <span
                          className="text-gray-500 italic"
                          style={{
                            fontFamily: `"${overlay.fontFamily}", sans-serif`,
                            fontSize: `${overlay.fontSize}px`,
                            fontWeight: overlay.bold ? "bold" : "normal",
                            fontStyle: overlay.italic ? "italic" : "normal",
                            color: overlay.color,
                          }}
                        >
                          Double-click to edit
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          })}
      </div>
    </div>
  );
}

// Separate Slate Editor Component
interface SlateEditorProps {
  overlay: TextOverlay;
  editor: ReactEditor & BaseEditor;
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  renderLeaf: (props: RenderLeafProps) => React.ReactElement;
  renderElement: (props: RenderElementProps) => React.ReactElement;
  pageDimensions: { width: number; height: number };
}

function SlateEditor({
  overlay,
  editor,
  value,
  onChange,
  renderLeaf,
  renderElement,
  pageDimensions,
}: SlateEditorProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync editor content when value changes externally
  useEffect(() => {
    const isAstChange = editor.operations.some(
      (op) => op.type !== "set_selection"
    );
    if (!isAstChange) {
      // Reset editor content
      // eslint-disable-next-line react-hooks/immutability
      editor.children = value;
      editor.onChange();
    }
  }, [value, editor]);

  // Auto-focus on mount
  useEffect(() => {
    if (!isFocused) {
      setTimeout(() => {
        try {
          ReactEditor.focus(editor);
          // Move cursor to end
          Transforms.select(editor, Editor.end(editor, []));
          setIsFocused(true);
        } catch (e) {
          // Ignore focus errors
          console.log(e);
        }
      }, 0);
    }
  }, [editor, isFocused]);

  return (
    <div
      ref={editableRef}
      className="relative editingOverlay"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <Editable
          renderLeaf={renderLeaf}
          renderElement={renderElement}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              ReactEditor.blur(editor);
            }
          }}
          style={{
            fontFamily: `"${overlay.fontFamily}", sans-serif`,
            fontSize: `${overlay.fontSize}px`,
            fontWeight: overlay.bold ? "bold" : "normal",
            fontStyle: overlay.italic ? "italic" : "normal",
            color: overlay.color,
            textAlign: overlay.textAlign,
            lineHeight: "1.2",
            padding: "2px",
            minWidth: "50px",
            minHeight: `${overlay.fontSize + 4}px`,
            width: "auto",
            height: "auto",
            maxWidth: `${pageDimensions.width * 0.8}px`,
            marginTop: `${overlay.fontSize / 2}px`,
            display: "block",
            direction: "ltr",
            whiteSpace: "pre",
            overflowX: "auto",
            overflowY: "hidden",
            outline: "none",
            backgroundColor: "transparent",
            border: "none",
          }}
        />
      </Slate>
    </div>
  );
}
