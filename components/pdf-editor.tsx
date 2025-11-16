'use client';

import { useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ChevronLeft, ChevronRight, Download, Type, Menu, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

  const handleAddOverlay = useCallback((overlay: Omit<TextOverlay, 'id'> | Omit<ShapeOverlay, 'id'>) => {
    const newOverlay: Overlay = {
      ...overlay,
      id: `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    } as Overlay;
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

  const handleUpdateOverlay = useCallback((id: string, updates: Partial<TextOverlay> | Partial<ShapeOverlay>) => {
    setOverlays((prev) =>
      prev.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      )
    );
  }, []);

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
      const sourceIdx = prev.findIndex((o) => o.id === sourceId);
      const targetIdx = prev.findIndex((o) => o.id === targetId);
      if (sourceIdx === -1 || targetIdx === -1) return prev;

      const newOverlays = [...prev];
      const [removed] = newOverlays.splice(sourceIdx, 1);
      newOverlays.splice(targetIdx, 0, removed);

      return newOverlays.map((overlay, index) => ({
        ...overlay,
        zIndex: index,
      }));
    });
  }, []);

  const handleExport = useCallback(async () => {
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
          <div className="p-4 text-center text-sm text-muted-foreground">
            Select a text overlay to edit formatting
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}