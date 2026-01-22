"use client";

import { useEffect, useRef, useState, useCallback, ReactNode } from "react";

interface MasonryProps {
  children: ReactNode[];
  columnCount?: {
    default: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function Masonry({ 
  children, 
  columnCount = { default: 1, md: 2, lg: 3 },
  gap = 16,
  className = ""
}: MasonryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(columnCount.default);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isRTL, setIsRTL] = useState(false);
  const [positions, setPositions] = useState<Map<number, { x: number; y: number }>>(new Map());
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Detect RTL direction
  useEffect(() => {
    const checkRTL = () => {
      setIsRTL(document.documentElement.dir === "rtl");
    };
    checkRTL();
    
    // Watch for dir attribute changes
    const observer = new MutationObserver(checkRTL);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  // Determine column count based on screen size
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280 && columnCount.xl) {
        setColumns(columnCount.xl);
      } else if (width >= 1024 && columnCount.lg) {
        setColumns(columnCount.lg);
      } else if (width >= 768 && columnCount.md) {
        setColumns(columnCount.md);
      } else {
        setColumns(columnCount.default);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [columnCount]);

  // Calculate positions for all items
  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;
    setContainerWidth(width);
    
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);
    const newPositions = new Map<number, { x: number; y: number }>();

    children.forEach((_, index) => {
      const itemEl = itemRefs.current.get(index);
      if (!itemEl) return;

      // Find the shortest column
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const x = shortestColumn * (columnWidth + gap);
      const y = columnHeights[shortestColumn];

      newPositions.set(index, { x, y });

      // Update column height
      const itemHeight = itemEl.offsetHeight;
      columnHeights[shortestColumn] += itemHeight + gap;
    });

    const newHeight = Math.max(...columnHeights) - gap;
    if (newHeight > 0) {
      setContainerHeight(newHeight);
    }
    setPositions(newPositions);
  }, [children, columns, gap]);

  // Recalculate when new children are added
  useEffect(() => {
    // Calculate positions after a brief delay for new items to render
    const timer = setTimeout(calculatePositions, 10);
    return () => clearTimeout(timer);
  }, [children.length, calculatePositions]);

  // Recalculate on column count change (resize) or RTL change
  useEffect(() => {
    calculatePositions();
  }, [columns, isRTL, calculatePositions]);

  // Recalculate positions on window resize (container width may change)
  useEffect(() => {
    const handleResize = () => {
      calculatePositions();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculatePositions]);

  // Use ResizeObserver on container for layout changes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(() => {
      calculatePositions();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [calculatePositions]);

  // Use ResizeObserver for image loading and item size changes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      calculatePositions();
    });

    itemRefs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [calculatePositions, children.length]);

  const columnWidth = containerWidth > 0 
    ? (containerWidth - gap * (columns - 1)) / columns 
    : 0;

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      style={{ height: containerHeight > 0 ? containerHeight : "auto" }}
    >
      {children.map((child, index) => {
        const position = positions.get(index);
        const hasPosition = position !== undefined;
        return (
          <div
            key={index}
            ref={(el) => {
              if (el) {
                itemRefs.current.set(index, el);
              } else {
                itemRefs.current.delete(index);
              }
            }}
            className="absolute"
            style={{
              width: columnWidth > 0 ? columnWidth : "100%",
              transform: hasPosition 
                ? `translate3d(${isRTL ? -position.x : position.x}px, ${position.y}px, 0)` 
                : "translate3d(-9999px, 0, 0)",
              visibility: hasPosition ? "visible" : "hidden",
              ...(isRTL ? { right: 0 } : { left: 0 }),
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
