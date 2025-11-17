/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Download, Type, Menu, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { PDFCanvas } from '@/components/pdf-canvas';
import { FormattingToolbar } from '@/components/formatting-toolbar';
import { LayersPanel } from '@/components/layers-panel';
import { loadPDFDocument } from '@/lib/pdf-utils';
import { exportPDFWithOverlays } from '@/lib/export-utils';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface TextOverlay {
  id: string;
  type: 'text';
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
}

export interface ShapeOverlay {
  id: string;
  type: 'shape';
  shapeType: 'square';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  page: number;
  visible: boolean;
  zIndex: number;
}

export type Overlay = TextOverlay | ShapeOverlay;

interface PDFEditorProps {
  pdfId: string;
}

// Utility to convert a font family (like "Open Sans") to a class name ("open-sans")
function fontFamilyToClassName(fontFamily: string) {
  return fontFamily.replace(/\s+/g, '-').toLowerCase();
}

export default function PDFEditor({ pdfId }: PDFEditorProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toolMode, setToolMode] = useState<'text' | 'shape'>('text');

  const selectedOverlay = overlays.find((o) => o.id === selectedOverlayId);

  useEffect(() => {
    // Preload custom fonts for export
    const preloadFonts = async () => {
      try {
        console.log('Preloading custom fonts for export...');
        await Promise.all([
          fetch('/fonts/AMS Aasmi.ttf'),
          fetch('/fonts/KR640.TTF')
        ]);
        console.log('✅ Custom fonts preloaded successfully');
      } catch (error) {
        console.warn('Failed to preload custom fonts:', error);
      }
    };
  
    preloadFonts();
  }, []);
  

  // Load PDF from API route
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/getPdf/${pdfId}`);
        if (!response.ok) throw new Error('Failed to fetch PDF');
        
        const blob = await response.blob();
        const file = new File([blob], `${pdfId}.pdf`, { type: 'application/pdf' });
        
        const pdf = await loadPDFDocument(file);
        setPdfFile(file);
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setOverlays([]);
        setSelectedOverlayId(null);
      } catch (error) {
        console.error('Error loading PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfId]);


  const debugExportPositions = () => {
    if (!pdfDocument) return;
    
    const currentPageOverlays = overlays.filter(o => o.page === currentPage);
    
    console.log('=== EXPORT POSITION DEBUG ===');
    console.log('Current Page:', currentPage);
    console.log('Overlays on this page:');
    
    currentPageOverlays.forEach(overlay => {
      if (overlay.type === 'text') {
        console.log(`Text: "${overlay.text}"`);
        console.log(`  Normalized: (${overlay.x.toFixed(3)}, ${overlay.y.toFixed(3)})`);
        console.log(`  Font Size: ${overlay.fontSize}px`);
        console.log(`  Font Family: ${overlay.fontFamily}`);
      } else {
        console.log(`Shape at (${overlay.x.toFixed(3)}, ${overlay.y.toFixed(3)})`);
        console.log(`  Size: ${(overlay.width * 100).toFixed(1)}% x ${(overlay.height * 100).toFixed(1)}%`);
      }
    });
  };
  

  const handleAddOverlay = useCallback((overlay: Omit<TextOverlay, 'id'> | Omit<ShapeOverlay, 'id'>) => {
    // Add fontFamilyClassName for text overlays on creation
    let newOverlay: Overlay;
    if ((overlay as any).type === 'text') {
      const textOverlay = overlay as Omit<TextOverlay, 'id'>;
      const fontFamily = textOverlay.fontFamily || '';
      
      // Map font families to their CSS class names
      const fontClassMap: { [key: string]: string } = {
        'AMS Aasmi': 'ams-aasmi',
        'Kruti Dev 640': 'kruti-dev-640'
      };
      
      newOverlay = {
        ...textOverlay,
        id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        fontFamilyClassName: fontClassMap[fontFamily] || fontFamilyToClassName(fontFamily),
      } as Overlay;
    } else {
      newOverlay = {
        ...overlay,
        id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      } as Overlay;
    }
    setOverlays((prev) => [...prev, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
  }, []);
  

  const handleAddShape = useCallback((x: number, y: number) => {
    const newShape: Omit<ShapeOverlay, 'id'> = {
      type: 'shape',
      shapeType: 'square',
      x,
      y,
      width: 0.1, // 10% of page width
      height: 0.1, // 10% of page height
      color: '#3b82f6', // blue
      page: currentPage,
      visible: true,
      zIndex: overlays.length,
    };
    handleAddOverlay(newShape);
  }, [currentPage, overlays.length, handleAddOverlay]);

  // Extended: When updating fontFamily, also set fontFamilyClassName
  const handleUpdateOverlay = useCallback(
    (id: string, updates: Partial<TextOverlay> | Partial<ShapeOverlay>) => {
      setOverlays((prev) =>
        prev.map((overlay) => {
          if (overlay.id !== id) return overlay as Overlay;
          
          // If text overlay and updating fontFamily, also assign className
          if (
            overlay.type === 'text' &&
            Object.prototype.hasOwnProperty.call(updates, 'fontFamily') &&
            typeof (updates as Partial<TextOverlay>).fontFamily === 'string'
          ) {
            const fontFamily = (updates as Partial<TextOverlay>).fontFamily!;
            
            // Map font families to their CSS class names
            const fontClassMap: { [key: string]: string } = {
              'AMS Aasmi': 'ams-aasmi',
              'Kruti Dev 640': 'kruti-dev-640'
            };
            
            return {
              ...overlay,
              ...updates,
              fontFamilyClassName: fontClassMap[fontFamily] || fontFamilyToClassName(fontFamily),
            } as Overlay;
          }
          return { ...overlay, ...updates } as Overlay;
        })
      );
    },
    []
  );
  

  const handleDeleteOverlay = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((overlay) => overlay.id !== id));
    if (selectedOverlayId === id) {
      setSelectedOverlayId(null);
    }
  }, [selectedOverlayId]);

  const handleToggleVisibility = useCallback((id: string) => {
    setOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, visible: !overlay.visible } : overlay
      )
    );
  }, []);

  const handleReorderLayers = useCallback((sourceId: string, targetId: string) => {
    setOverlays((prev) => {
      // Get current page overlays sorted by zIndex descending (as displayed in panel)
      const currentPageOverlays = prev
        .filter(o => o.page === currentPage)
        .sort((a, b) => b.zIndex - a.zIndex);
      
      const sourceDisplayIdx = currentPageOverlays.findIndex((o) => o.id === sourceId);
      const targetDisplayIdx = currentPageOverlays.findIndex((o) => o.id === targetId);
      
      if (sourceDisplayIdx === -1 || targetDisplayIdx === -1) return prev;

      // Reorder in the displayed order (top to bottom)
      const reordered = [...currentPageOverlays];
      const [removed] = reordered.splice(sourceDisplayIdx, 1);
      reordered.splice(targetDisplayIdx, 0, removed);

      // Create a map of new zIndex values (higher zIndex for items at top of display)
      const zIndexMap = new Map<string, number>();
      reordered.forEach((overlay, displayIdx) => {
        // Top of display (index 0) gets highest zIndex
        zIndexMap.set(overlay.id, currentPageOverlays.length - 1 - displayIdx);
      });

      // Update all overlays with new zIndex values
      return prev.map((overlay) => {
        if (overlay.page === currentPage && zIndexMap.has(overlay.id)) {
          return { ...overlay, zIndex: zIndexMap.get(overlay.id)! };
        }
        return overlay;
      });
    });
  }, [currentPage]);

  const handleExport = useCallback(async () => {
    debugExportPositions();
    if (!pdfFile) return;

    setIsExporting(true);
    try {
      const blob = await exportPDFWithOverlays(pdfFile, overlays);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited-${pdfId}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  }, [pdfFile, pdfId, overlays]);

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
          selectedOverlay.type === 'text' ? (
            <FormattingToolbar
              fontSize={selectedOverlay.fontSize}
              fontFamily={selectedOverlay.fontFamily}
              bold={selectedOverlay.bold}
              italic={selectedOverlay.italic}
              color={selectedOverlay.color}
              onFontSizeChange={(size) => handleUpdateOverlay(selectedOverlay.id, { fontSize: size })}
              onFontFamilyChange={(family) => handleUpdateOverlay(selectedOverlay.id, { fontFamily: family })}
              onBoldToggle={() => handleUpdateOverlay(selectedOverlay.id, { bold: !selectedOverlay.bold })}
              onItalicToggle={() => handleUpdateOverlay(selectedOverlay.id, { italic: !selectedOverlay.italic })}
              onColorChange={(color) => handleUpdateOverlay(selectedOverlay.id, { color })}
            />
          ) : (
            <FormattingToolbar
              fontSize={12}
              fontFamily="Arial"
              bold={false}
              italic={false}
              color={selectedOverlay.color}
              onColorChange={(color) => handleUpdateOverlay(selectedOverlay.id, { color })}
              shapeWidth={selectedOverlay.width}
              shapeHeight={selectedOverlay.height}
              onShapeWidthChange={(width) => handleUpdateOverlay(selectedOverlay.id, { width })}
              onShapeHeightChange={(height) => handleUpdateOverlay(selectedOverlay.id, { height })}
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
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">PDF Editor Sidebar</SheetTitle>
                <div className="flex flex-col h-full">
                  {sidebarContent}
                </div>
              </SheetContent>
            </Sheet>
            
            <span className="text-sm font-medium text-muted-foreground font-mono truncate">
              {pdfId}.pdf
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                Page {currentPage} of {numPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={currentPage === numPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-2">
              <Button
                variant={toolMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToolMode('text')}
                title="Text Tool"
              >
                <Type className="w-4 h-4 mr-2" />
                Text
              </Button>
              <Button
                variant={toolMode === 'shape' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setToolMode('shape')}
                title="Square Shape Tool"
              >
                <Square className="w-4 h-4 mr-2" />
                Square
              </Button>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* PDF Canvas Area - Scrollable */}
        <div className="flex-1 overflow-auto bg-muted/30">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}