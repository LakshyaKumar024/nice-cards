"use client";

import React, { useRef, useState, useEffect } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SVGViewerProps {
  svgContent: string;
  title?: string;
}

export function SVGViewer({ svgContent}: SVGViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const centerSVG = () => {
    if (!svgContainerRef.current || !containerRef.current) return;

    const svgElement = svgContainerRef.current.querySelector('svg');
    if (!svgElement) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Get SVG dimensions from the SVG element itself
    const svgWidth = svgElement.width.baseVal.value || svgElement.viewBox.baseVal.width;
    const svgHeight = svgElement.height.baseVal.value || svgElement.viewBox.baseVal.height;

    // If SVG has no explicit dimensions, use getBBox
    let actualSvgWidth = svgWidth;
    let actualSvgHeight = svgHeight;
    
    if (!svgWidth || !svgHeight) {
      const bbox = svgElement.getBBox();
      actualSvgWidth = bbox.width;
      actualSvgHeight = bbox.height;
    }

    // Calculate center position
    const centerX = (containerRect.width - actualSvgWidth * scale) / 2;
    const centerY = (containerRect.height - actualSvgHeight * scale) / 2;

    setPanX(centerX);
    setPanY(centerY);
  };

  // Center SVG on initial load and when content changes
  useEffect(() => {
    centerSVG();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svgContent]);


  // 🖱️ Drag to pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
    e.preventDefault();
  };

  const handleMouseUp = () => setIsDragging(false);

  // 🔍 Zoom controls
  const handleZoom = (dir: "in" | "out") => {
    const step = 0.2;
    const newScale = dir === "in" ? scale + step : Math.max(0.1, scale - step);
    setScale(newScale);
  };

  const handleReset = () => {
    setScale(1);
    centerSVG();
  };

  // Re-center when scale changes
  useEffect(() => {
    centerSVG();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 rounded-lg bg-card p-2 border border-border">
        <Button variant="outline" size="sm" onClick={() => handleZoom("in")} title="Zoom In" className="gap-2">
          <ZoomIn className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={() => handleZoom("out")} title="Zoom Out" className="gap-2">
          <ZoomOut className="h-4 w-4" />
        </Button>

        <div className="border-r border-border h-6" />

        <Button variant="outline" size="sm" onClick={handleReset} title="Reset View" className="text-xs bg-transparent">
          Reset
        </Button>

        <div className="flex-1" />

        <div className="text-xs text-muted-foreground">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* SVG Display Area */}
      <div
        ref={containerRef}
        className="relative border border-border dark:bg-slate-950 rounded-lg overflow-hidden cursor-move bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: "100%",
          height: "500px",
          maxHeight: "70vh",
        }}
      >
        <div
          ref={svgContainerRef}
          className="bg-white svg-fonts-loaded"
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            background:"white",
            transform: `translate(${panX}px, ${panY}px) scale(${scale})`,
            transformOrigin: "0 0",
            transition: isDragging ? "none" : "transform 0.1s ease-out",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>
    </div>
  );
}