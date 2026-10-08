import { useState, useEffect } from "react";

export function useMasonry(containerWidth: number, itemWidth: number = 250, gap: number = 16) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (containerWidth === 0) return;
    const cols = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)));
    setColumns(cols);
  }, [containerWidth, itemWidth, gap]);

  return columns;
}

