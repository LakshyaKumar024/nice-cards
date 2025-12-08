/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Type,
  Menu,
  Square,
  Globe,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PDFCanvas } from "@/components/pdf-canvas";
import { FormattingToolbar } from "@/components/formatting-toolbar";
import { LayersPanel } from "@/components/layers-panel";
import { loadPDFDocument } from "@/lib/pdf-utils";
import { exportPDFWithOverlays } from "@/lib/export-utils";
import { Overlay, ShapeOverlay, TextOverlay } from "@/lib/types";
import { toast } from "sonner";

// Configure pdfjs worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PDFEditorProps {
  pdfFName: string;
  templateId: string;
  defaultOverlays?: Overlay[];
  userId: string;
  isAdmin?: boolean;
  defaultTemplateDesign?: Overlay[];
}

// Utility to convert a font family (like "Open Sans") to a class name ("open-sans")
function fontFamilyToClassName(fontFamily: string) {
  return fontFamily.replace(/\s+/g, "-").toLowerCase();
}

export default function PDFEditor({
  pdfFName,
  templateId,
  defaultOverlays,
  userId,
  isAdmin = false,
  defaultTemplateDesign,
}: PDFEditorProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] =
    useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [overlays, setOverlays] = useState<Overlay[]>(defaultOverlays || []);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toolMode, setToolMode] = useState<"text" | "shape">("text");
  const applyFontToSelectionRef = useRef<((fontFamily: string) => void) | null>(
    null
  );

  // Undo/Redo state
  const [history, setHistory] = useState<Overlay[][]>([defaultOverlays || []]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const selectedOverlay =
    overlays?.find((o) => o.id === selectedOverlayId) || null;

  // Save to history when overlays change (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedoAction.current && overlays.length >= 0) {
      setHistory((prev) => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        // Add current state
        newHistory.push([...overlays]);
        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }
    isUndoRedoAction.current = false;
  }, [historyIndex, overlays]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setOverlays([...history[newIndex]]);
    }
  }, [historyIndex, history]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setOverlays([...history[newIndex]]);
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    // Preload custom fonts for export
    const preloadFonts = async () => {
      try {
        await Promise.all([
          // Hindi/Devanagari Fonts
          fetch("/fonts/A0047636.TTF"),
          fetch("/fonts/AMS Aasmi.ttf"),
          fetch("/fonts/ASUPER_1.TTF"),
          fetch("/fonts/asuper_8.ttf"),
          fetch("/fonts/bf089hin.ttf"),
          fetch("/fonts/bf112hin.ttf"),
          fetch("/fonts/bf142hin.ttf"),
          fetch("/fonts/BR010NTT.TTF"),
          fetch("/fonts/K010.TTF"),
          fetch("/fonts/K012.TTF"),
          fetch("/fonts/K021.TTF"),
          fetch("/fonts/K11.TTF"),
          fetch("/fonts/K240.TTF"),
          fetch("/fonts/K500.TTF"),
          fetch("/fonts/K501.TTF"),
          fetch("/fonts/K502.TTF"),
          fetch("/fonts/KR640.TTF"),
          fetch("/fonts/KR680.TTF"),
          fetch("/fonts/KR710.TTF"),
          fetch("/fonts/KR712.TTF"),
          fetch("/fonts/KR714.TTF"),
          fetch("/fonts/KR732.TTF"),
          fetch("/fonts/NotoSansDevanagari.ttf"),
          // English/Latin Fonts
          fetch("/fonts/ARENSKI.ttf"),
          fetch("/fonts/arial.ttf"),
          fetch("/fonts/bokr76w.ttf"),
          fetch("/fonts/DF Calligraphic Ornament Regular.otf"),
          fetch("/fonts/EMBASSYN.TTF"),
          fetch("/fonts/Martel-Bold.ttf"),
          fetch("/fonts/Martel-Regular.ttf"),
          fetch("/fonts/Monotype-Corsiva-Regular-Italic.ttf"),
          fetch("/fonts/RozhaOne-Regular.ttf"),
          fetch("/fonts/Teko-Bold.ttf"),
          fetch("/fonts/Teko-Medium.ttf"),
          fetch("/fonts/Teko-Regular.ttf"),
        ]);
      } catch (error) {
        console.error("Failed to preload custom fonts:", error);
      }
    };

    preloadFonts();
  }, []);

  // Load PDF from API route
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfFName) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/getPdf/${pdfFName}`);
        if (!response.ok) throw new Error("Failed to fetch PDF");

        const blob = await response.blob();
        const file = new File([blob], `${pdfFName}.pdf`, {
          type: "application/pdf",
        });

        const pdf = await loadPDFDocument(file);
        setPdfFile(file);
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setOverlays(defaultOverlays || []); // Add fallback here
        setSelectedOverlayId(null);
      } catch (error) {
        console.error("Error loading PDF:", error);
        // Also set overlays to empty array on error
        setOverlays([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfFName, templateId, defaultOverlays]);

  const handleAddOverlay = useCallback(
    (overlay: Omit<TextOverlay, "id"> | Omit<ShapeOverlay, "id">) => {
      // Add fontFamilyClassName for text overlays on creation
      let newOverlay: Overlay;
      if ((overlay as any).type === "text") {
        const textOverlay = overlay as Omit<TextOverlay, "id">;
        const fontFamily = textOverlay.fontFamily || "";

        // Map font families to their CSS class names
        const fontClassMap: { [key: string]: string } = {
          "BHARTIYA HINDI_100": "bhartiya-hindi-100",
          "AMS Aasmi": "ams-aasmi",
          Arenski: "arenski",
          Arial: "arial",
          "A-SuperHindi-3 Bold": "a-superhindi-3-bold",
          "A-SuperHindi-8 Normal": "a-superhindi-8-normal",
          "BHARTIYA HINDI_089": "bhartiya-hindi-089",
          "BHARTIYA HINDI_112": "bhartiya-hindi-112",
          "BHARTIYA HINDI_142": "bhartiya-hindi-142",
          "ITC Bookman Demi Italic": "itc-bookman-demi-italic",
          "ISFOC-TTBorder-1 Normal": "isfoc-ttborder-1-normal",
          DFCalligraphicOrnament: "df-calligraphic-ornament",
          "Embassy BT": "embassy-bt",
          "Kruti Dev 010": "kruti-dev-010",
          "Kruti Dev 012": "kruti-dev-012",
          "Kruti Dev 021": "kruti-dev-021",
          "Kruti Dev 011": "kruti-dev-011",
          "Kruti Dev 240": "kruti-dev-240",
          "Kruti Dev 500": "kruti-dev-500",
          "Kruti Dev 501": "kruti-dev-501",
          "Kruti Dev 502": "kruti-dev-502",
          "Kruti Dev 640": "kruti-dev-640",
          "Kruti Dev 680": "kruti-dev-680",
          "Kruti Dev 710": "kruti-dev-710",
          "Kruti Dev 712": "kruti-dev-712",
          "Kruti Dev 714": "kruti-dev-714",
          "Kruti Dev 732": "kruti-dev-732",
          "Martel Bold": "martel-bold",
          Martel: "martel",
          "Monotype Corsiva Regular Italic": "monotype-corsiva-regular-italic",
          "Noto Sans Devanagari Regular": "noto-sans-devanagari-regular",
          "Rozha One Regular": "rozha-one-regular",
          "Teko Bold": "teko-bold",
          "Teko Medium": "teko-medium",
          "Teko Regular": "teko-regular",
        };

        newOverlay = {
          ...textOverlay,
          id: `overlay-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          fontFamilyClassName:
            fontClassMap[fontFamily] || fontFamilyToClassName(fontFamily),
          rotation: 0, // Initialize rotation to 0
          textAlign: "left", // Initialize textAlign to left
        } as Overlay;
      } else {
        newOverlay = {
          ...overlay,
          id: `overlay-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          rotation: 0, // Initialize rotation to 0
        } as Overlay;
      }
      setOverlays((prev) => [...prev, newOverlay]);
      setSelectedOverlayId(newOverlay.id);
    },
    []
  );

  const handleAddShape = useCallback(
    (x: number, y: number) => {
      const newShape: Omit<ShapeOverlay, "id"> = {
        type: "shape",
        shapeType: "square",
        x,
        y,
        width: 0.1, // 10% of page width
        height: 0.1, // 10% of page height
        color: "#3b82f6", // blue
        page: currentPage,
        visible: true,
        zIndex: overlays.length,
        rotation: 0, // Initialize rotation to 0
      };
      handleAddOverlay(newShape);
    },
    [currentPage, overlays.length, handleAddOverlay]
  );

  // Extended: When updating fontFamily, also set fontFamilyClassName
  const handleUpdateOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay> | Partial<ShapeOverlay>) => {
      setOverlays((prev) =>
        prev.map((overlay) => {
          if (overlay.id !== id) return overlay as Overlay;

          // If text overlay and updating fontFamily, also assign className
          if (
            overlay.type === "text" &&
            Object.prototype.hasOwnProperty.call(updates, "fontFamily") &&
            typeof (updates as Partial<TextOverlay>).fontFamily === "string"
          ) {
            const fontFamily = (updates as Partial<TextOverlay>).fontFamily!;

            // Map font families to their CSS class names
            const fontClassMap: { [key: string]: string } = {
              "BHARTIYA HINDI_100": "bhartiya-hindi-100",
              "AMS Aasmi": "ams-aasmi",
              Arenski: "arenski",
              Arial: "arial",
              "A-SuperHindi-3 Bold": "a-superhindi-3-bold",
              "A-SuperHindi-8 Normal": "a-superhindi-8-normal",
              "BHARTIYA HINDI_089": "bhartiya-hindi-089",
              "BHARTIYA HINDI_112": "bhartiya-hindi-112",
              "BHARTIYA HINDI_142": "bhartiya-hindi-142",
              "ITC Bookman Demi Italic": "itc-bookman-demi-italic",
              "ISFOC-TTBorder-1 Normal": "isfoc-ttborder-1-normal",
              DFCalligraphicOrnament: "df-calligraphic-ornament",
              "Embassy BT": "embassy-bt",
              "Kruti Dev 010": "kruti-dev-010",
              "Kruti Dev 012": "kruti-dev-012",
              "Kruti Dev 021": "kruti-dev-021",
              "Kruti Dev 011": "kruti-dev-011",
              "Kruti Dev 240": "kruti-dev-240",
              "Kruti Dev 500": "kruti-dev-500",
              "Kruti Dev 501": "kruti-dev-501",
              "Kruti Dev 502": "kruti-dev-502",
              "Kruti Dev 640": "kruti-dev-640",
              "Kruti Dev 680": "kruti-dev-680",
              "Kruti Dev 710": "kruti-dev-710",
              "Kruti Dev 712": "kruti-dev-712",
              "Kruti Dev 714": "kruti-dev-714",
              "Kruti Dev 732": "kruti-dev-732",
              "Martel Bold": "martel-bold",
              Martel: "martel",
              "Monotype Corsiva Regular Italic":
                "monotype-corsiva-regular-italic",
              "Noto Sans Devanagari Regular": "noto-sans-devanagari-regular",
              "Rozha One Regular": "rozha-one-regular",
              "Teko Bold": "teko-bold",
              "Teko Medium": "teko-medium",
              "Teko Regular": "teko-regular",
            };

            return {
              ...overlay,
              ...updates,
              fontFamilyClassName:
                fontClassMap[fontFamily] || fontFamilyToClassName(fontFamily),
            } as Overlay;
          }
          return { ...overlay, ...updates } as Overlay;
        })
      );
    },
    []
  );

  const handleDeleteOverlay = useCallback(
    (id: string) => {
      setOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
      if (selectedOverlayId === id) {
        setSelectedOverlayId(null);
      }
    },
    [selectedOverlayId]
  );

  const handleToggleVisibility = useCallback((id: string) => {
    setOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, visible: !overlay.visible } : overlay
      )
    );
  }, []);

  const handleReorderLayers = useCallback(
    (sourceId: string, targetId: string) => {
      setOverlays((prev) => {
        // Get current page overlays sorted by zIndex descending (as displayed in panel)
        const currentPageOverlays = prev
          .filter((o) => o.page === currentPage)
          .sort((a, b) => b.zIndex - a.zIndex);

        const sourceDisplayIdx = currentPageOverlays.findIndex(
          (o) => o.id === sourceId
        );
        const targetDisplayIdx = currentPageOverlays.findIndex(
          (o) => o.id === targetId
        );

        if (sourceDisplayIdx === -1 || targetDisplayIdx === -1) return prev;

        // Reorder in the displayed order (top to bottom)
        const reordered = [...currentPageOverlays];
        const [removed] = reordered.splice(sourceDisplayIdx, 1);
        reordered.splice(targetDisplayIdx, 0, removed);

        // Create a map of new zIndex values (higher zIndex for items at top of display)
        const zIndexMap = new Map<string, number>();
        reordered.forEach((overlay, displayIdx) => {
          // Top of display (index 0) gets highest zIndex
          zIndexMap.set(
            overlay.id,
            currentPageOverlays.length - 1 - displayIdx
          );
        });

        // Update all overlays with new zIndex values
        return prev.map((overlay) => {
          if (overlay.page === currentPage && zIndexMap.has(overlay.id)) {
            return { ...overlay, zIndex: zIndexMap.get(overlay.id)! };
          }
          return overlay;
        });
      });
    },
    [currentPage]
  );

  const handleExport = useCallback(async () => {
    if (!pdfFile) return;

    setIsExporting(true);
    try {
      const blob = await exportPDFWithOverlays(pdfFile, overlays);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `edited-${templateId}.pdf`;
      link.click();

      URL.revokeObjectURL(url);

      const saveOverlays = await fetch(
        `/api/design/${templateId}/saveOverlays`,
        {
          method: "POST",
          body: JSON.stringify({
            userId: userId,
            overlays: JSON.stringify(overlays),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (saveOverlays.ok) {
        toast.success("Saved Current Design", {
          description: "Your edits are saved and will be preloded next time.",
        });
      } else {
        toast.info("Current Design is not saved", {
          description:
            "Your edits are'nt saved and will not be preloded next time.",
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfFile, pdfFName, overlays]);

  const handlePublishDesign = useCallback(async () => {
    if (!isAdmin) {
      toast.error("Only admins can publish designs");
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch(
        `/api/design/${templateId}/saveOverlays/admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            overlays: overlays,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to publish design");
      }

      const data = await response.json();
      toast.success("Design published successfully!");
      console.log("Published design:", data);
    } catch (error) {
      console.error("Error publishing design:", error);
      toast.error("Failed to publish design");
    } finally {
      setIsPublishing(false);
    }
  }, [isAdmin, templateId, userId, overlays]);

  const handleLoadDefaultDesign = useCallback(() => {
    if (!defaultTemplateDesign || defaultTemplateDesign.length === 0) {
      toast.error("No default design available");
      return;
    }

    setIsLoadingDefault(true);
    try {
      setOverlays(defaultTemplateDesign);
      setSelectedOverlayId(null);
      toast.success("Default design loaded!");
    } catch (error) {
      console.error("Error loading default design:", error);
      toast.error("Failed to load default design");
    } finally {
      setIsLoadingDefault(false);
    }
  }, [defaultTemplateDesign]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
    setSelectedOverlayId(null);
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
    setSelectedOverlayId(null);
  }, [numPages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!pdfDocument) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg">Failed to load PDF.</p>
        </div>
      </div>
    );
  }

  // Sidebar Content (used in both desktop and mobile)
  const sidebarContent = (
    <>
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Type className="w-5 h-5" />
          Text Formatting
        </h2>
      </div>

      <ScrollArea className="flex-1">
        {selectedOverlay ? (
          selectedOverlay.type === "text" ? (
            <FormattingToolbar
              fontSize={selectedOverlay.fontSize}
              fontFamily={selectedOverlay.fontFamily}
              bold={selectedOverlay.bold}
              italic={selectedOverlay.italic}
              color={selectedOverlay.color}
              rotation={selectedOverlay.rotation}
              textAlign={selectedOverlay.textAlign}
              onTextAlignChange={(align) =>
                handleUpdateOverlay(selectedOverlay.id, { textAlign: align })
              }
              onFontSizeChange={(size) =>
                handleUpdateOverlay(selectedOverlay.id, { fontSize: size })
              }
              onFontFamilyChange={(family) =>
                handleUpdateOverlay(selectedOverlay.id, { fontFamily: family })
              }
              onBoldToggle={() =>
                handleUpdateOverlay(selectedOverlay.id, {
                  bold: !selectedOverlay.bold,
                })
              }
              onItalicToggle={() =>
                handleUpdateOverlay(selectedOverlay.id, {
                  italic: !selectedOverlay.italic,
                })
              }
              onColorChange={(color) =>
                handleUpdateOverlay(selectedOverlay.id, { color })
              }
              onRotationChange={(rotation) =>
                handleUpdateOverlay(selectedOverlay.id, { rotation })
              }
              onApplyFontToSelection={(fontFamily) => {
                // Call the canvas function directly to apply font to selection
                console.log("onApplyFontToSelection called with:", fontFamily);
                console.log(
                  "applyFontToSelectionRef.current:",
                  applyFontToSelectionRef.current
                );
                if (applyFontToSelectionRef.current) {
                  console.log("Calling applyFontToSelection...");
                  applyFontToSelectionRef.current(fontFamily);
                } else {
                  console.log(
                    "ERROR: applyFontToSelectionRef.current is null!"
                  );
                }
              }}
            />
          ) : (
            <FormattingToolbar
              fontSize={12}
              fontFamily="Arial"
              bold={false}
              italic={false}
              color={selectedOverlay.color}
              rotation={selectedOverlay.rotation}
              onColorChange={(color) =>
                handleUpdateOverlay(selectedOverlay.id, { color })
              }
              onRotationChange={(rotation) =>
                handleUpdateOverlay(selectedOverlay.id, { rotation })
              }
              shapeWidth={selectedOverlay.width}
              shapeHeight={selectedOverlay.height}
              onShapeWidthChange={(width) =>
                handleUpdateOverlay(selectedOverlay.id, { width })
              }
              onShapeHeightChange={(height) =>
                handleUpdateOverlay(selectedOverlay.id, { height })
              }
            />
          )
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Select an overlay to edit properties
          </div>
        )}

        <Separator className="my-4" />

        <LayersPanel
          overlays={overlays}
          selectedOverlayId={selectedOverlayId}
          onSelectOverlay={setSelectedOverlayId}
          onDeleteOverlay={handleDeleteOverlay}
          onToggleVisibility={handleToggleVisibility}
          onReorderLayers={handleReorderLayers}
          currentPage={currentPage}
        />
      </ScrollArea>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 border-r bg-card flex-col">
        {sidebarContent}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="h-16 border-b bg-card px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button with Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">PDF Editor Sidebar</SheetTitle>
                <div className="flex flex-col h-full">{sidebarContent}</div>
              </SheetContent>
            </Sheet>

            <span className="text-sm font-medium text-muted-foreground font-mono truncate">
              {templateId}.pdf
            </span>
          </div>

          <TooltipProvider>
            <div className="flex items-center gap-3">
              {/* Left Section: Tools */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "text" ? "default" : "ghost"}
                      size="icon"
                      className={`h-9 w-9 ${
                        toolMode === "text" ? "shadow-sm" : ""
                      }`}
                      onClick={() => setToolMode("text")}
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Text Tool (T)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolMode === "shape" ? "default" : "ghost"}
                      size="icon"
                      className={`h-9 w-9 ${
                        toolMode === "shape" ? "shadow-sm" : ""
                      }`}
                      onClick={() => setToolMode("shape")}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Shape Tool (S)</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Center Section: Page Navigation */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Previous Page</p>
                  </TooltipContent>
                </Tooltip>

                <div className="px-3 py-1 bg-muted/50 rounded-md">
                  <span className="text-sm font-medium tabular-nums">
                    {currentPage} / {numPages}
                  </span>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleNextPage}
                      disabled={currentPage === numPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Next Page</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Right Section: Actions */}
              <div className="ml-auto flex items-center gap-2">
                {defaultTemplateDesign && defaultTemplateDesign.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleLoadDefaultDesign}
                        disabled={isLoadingDefault}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {isLoadingDefault ? "Loading..." : "Reset"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Load Default Design</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {isExporting ? "Exporting..." : "Export"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>Download PDF</p>
                  </TooltipContent>
                </Tooltip>

                {isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handlePublishDesign}
                        disabled={isPublishing}
                        size="sm"
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Globe className="w-4 h-4" />
                        {isPublishing ? "Publishing..." : "Publish"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Publish as Public Template</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </TooltipProvider>
        </div>

        {/* PDF Canvas Area - Scrollable */}
        <div className="flex-1 overflow-auto bg-muted/30 relative">
          {/* ESC Hint - Shows when editing */}
          {selectedOverlayId && (
            <div
              className="
  fixed 
  top-21 left-1/2 -translate-x-1/2 
  z-9999
  bg-primary text-primary-foreground 
  px-4 py-2 rounded-md shadow-lg text-sm font-medium 
  flex items-center gap-2 
  animate-in fade-in slide-in-from-top-2 duration-300
"
            >
              <span>Press</span>
              <kbd className="px-2 py-1 bg-primary-foreground/20 rounded text-xs font-mono">
                ESC
              </kbd>
              <span>to exit editing mode</span>
            </div>
          )}
          <div className="min-h-full p-8 flex justify-center items-start">
            <PDFCanvas
              pdfDocument={pdfDocument}
              pageNumber={currentPage}
              overlays={overlays}
              selectedOverlayId={selectedOverlayId}
              onSelectOverlay={setSelectedOverlayId}
              onUpdateOverlay={handleUpdateOverlay}
              onAddOverlay={handleAddOverlay}
              onAddShape={handleAddShape}
              toolMode={toolMode}
              onApplyFontRef={(fn) => {
                applyFontToSelectionRef.current = fn;
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
