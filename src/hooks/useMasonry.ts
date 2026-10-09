import { useState, useEffect, RefObject } from "react";

export function useMasonry(containerRef: RefObject<HTMLElement>, itemWidth: number = 250, gap: number = 16) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const calculateColumns = (width: number) => {
      if (width === 0) return 1;
      return Math.max(1, Math.floor((width + gap) / (itemWidth + gap)));
    };

    // Initial calculation
    setColumns(calculateColumns(containerRef.current.clientWidth));

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newCols = calculateColumns(entry.contentRect.width);
        setColumns((prev) => (prev !== newCols ? newCols : prev));
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef, itemWidth, gap]);

  return columns;
}
