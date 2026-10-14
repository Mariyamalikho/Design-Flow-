# Moodboard Layout Engine

## Overview
The DesignFlow **Interactive Moodboard** is a local-first creative canvas combining responsive multi-column masonry arrangements, drag-and-drop reordering, dynamic image scaling, color palette extraction, and composite PNG exports.

---

## 1. Responsive Masonry Engine

### Column Calculation (`useMasonry`)
Rather than relying on heavy CSS column breaks (which disrupt vertical DOM ordering needed for drag-and-drop), DesignFlow uses a custom `useMasonry` hook:

```typescript
export function useMasonry(
  containerRef: React.RefObject<HTMLElement | null>,
  targetColumnWidth = 250,
  gap = 16
): number
```

1. **ResizeObserver Lifecycle**: Observes the container width directly rather than the browser window, ensuring smooth adaptation within split views and collapsible sidebars.
2. **Debounced Re-calculations**: Only triggers React state updates when the width crosses a column threshold:
   $$\text{columns} = \max\left(1, \left\lfloor \frac{\text{containerWidth} + \text{gap}}{\text{targetColumnWidth} + \text{gap}} \right\rfloor\right)$$
3. **Partitioning**: Moodboard items are partitioned evenly into columns:
   ```typescript
   const columnData = useMemo(() => {
     const cols: MoodboardItem[][] = Array.from({ length: columns }, () => []);
     items.forEach((item, index) => {
       cols[index % columns].push(item);
     });
     return cols;
   }, [items, columns]);
   ```

---

## 2. Drag & Drop Reordering

DesignFlow integrates `@hello-pangea/dnd` for smooth multi-column reordering.

### Mapping & Flat Synchronization
- **Droppable Zones**: Each masonry column acts as a standalone `Droppable` (`droppableId="0"`, `"1"`, etc.).
- **Draggables**: Every item is wrapped in a `Draggable` with an index relative to its column.
- **OnDragEnd Algorithm**:
  1. Identifies the source item in `columnData[sourceColIndex][sourceIndex]`.
  2. Finds its global position in the flat `items` collection.
  3. Re-inserts the item at the target column index position.
  4. Recalculates new sequential `order` values (`order: index`).
  5. Performs an optimistic batch update to IndexedDB via `db.moodboardItems.bulkPut(updates)`.

### Touch Device Compatibility
- Handlers include `touch-none` (`touch-action: none`) CSS rules on drag handles.
- This prevents mobile browsers from confusing touch-drag gestures with viewport scrolling.

---

## 3. Advanced Item Types

### Image Items
- **Lazy Loading with Crossfade**: Large blobs or URLs render skeleton placeholder blocks (`ImageWithSkeleton`) and fade in on load.
- **Dynamic Sizing**: Images support dynamic preset scaling:
  - `small`: 128px fixed height (`h-32`)
  - `medium`: Natural masonry aspect ratio (`h-auto`)
  - `large`: 320px heroic height (`h-80`)
- **Fullscreen Lightbox**: Includes interactive wheel zoom, panning, and copy-to-clipboard capabilities.

### Sticky Notes
- Rendered inline within the masonry flow.
- Configurable color themes (Yellow, Rose, Sky, Emerald) with automatic dark mode contrast.
- Fully draggable and reorderable alongside image cards.

---

## 4. Color Palette Integration
Images on the moodboard can be sampled directly:
1. **HTML5 Canvas Downsampling**: Pixels are quantized to 32-step buckets to identify top dominant colors while filtering transparent alphas.
2. **Harmonious Palettes**: Generated mathematically using HSL transformations (Complementary $180^\circ$, Analogous $\pm 30^\circ$, Triadic $\pm 120^\circ$).
3. **Project Persistence**: Extracted colors can be committed with one click to the persistent project color palette.

---

## 5. Composite Hi-DPI PNG Export
The entire moodboard canvas can be exported as a unified PNG:
- Leverages `html2canvas` configured with `scale: 2` (Hi-DPI / Retina output).
- Injects `crossOrigin="anonymous"` onto image elements to avoid canvas security tainting.
- Downloads directly to the client filesystem via synthetic anchor download triggers.
