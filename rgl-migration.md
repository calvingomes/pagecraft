yes I want to switch to rgl. I want less headache on drag and drop moving forward. draft me a detailed plan on how to         
implement this. ignore the swap logic. add it to the road map. I want my fixed resizes to work just like how it works right now 
 but I don't want the user to resize it manually nor do i wanna see that handle.                                                
                                                                                                                                
⏺ Let me read the key files before drafting the plan.                                                                           
                                                                                                                       
  Read 10 files (ctrl+o to expand)    
                                                                                                                       
⏺ Let me check two more files.                                                                                                  
                                                                                                                       
  Searched for 2 patterns, read 1 file (ctrl+o to expand)                                                                       
                                                            
⏺ Now I have everything I need. Let me write the full plan.                                                                     
                                                                                                                                
  ---                                                                                                                           
  Migration Plan: dnd-kit → react-grid-layout                                                                                   
                                                                                                                                
  ---                                                                                                                           
  How the grid configs map to RGL                                                                                               
                                                            
  Before the steps, here's the exact RGL parameter derivation so everything downstream is unambiguous.                          
                                                                                                                                
  Desktop:                                                                                                                      
  cols        = 4                                                                                                               
  width       = 875  (canvasPx)                                                                                                 
  rowHeight   = 90   (subRowPx)                             
  margin      = [25, 25]  (gapXPx, subRowGapPx)                                                                                 
  containerPadding = [0, 0]  ← removes outer edges, so colWidth = (875 - 25*3)/4 = 200px ✓
                                                                                                                                
  Mobile:                                                                                                                       
  cols        = 2                                                                                                               
  width       = 525  (canvasPx)                                                                                                 
  rowHeight   = 120  (subRowPx)                                                                                                 
  margin      = [25, 15]                                    
  containerPadding = [0, 0]  → colWidth = (525 - 25*1)/2 = 250px ✓

  Block → RGL item:                                                                                                             
  rglItem.w = spans.w                                    // unchanged
  rglItem.h = Math.max(1, Math.round(spans.h * rowScale)) // logical h → sub-rows                                               
  rglItem.x = block.layout.x                             // unchanged                                                           
  rglItem.y = Math.round(block.layout.y * rowScale)      // logical y → sub-row index                                           
                                                                                                                                
  This is the same rowScale=2 you already have — you're just making it RGL's native coordinate system. A "small" block becomes {
   w:1, h:2 }, sectionTitle becomes { w:4, h:1 }, "large" becomes { w:2, h:4 }, etc.                                            
                                                                                                                                
  ---                                                                                                                           
  Step 1 — Install / uninstall packages                     
                                                                                                                                
  npm install react-grid-layout
  npm install -D @types/react-grid-layout                                                                                       
  npm uninstall @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
                                                                                                                                
  ---
  Step 2 — Create lib/editor-engine/rgl/ conversion utilities                                                                   
                                                                                                                                
  Two small files. These are the only new source files in the migration.
                                                                                                                                
  lib/editor-engine/rgl/blockToRglItem.ts                                                                                       
                                                                                                                                
  Converts a Block to an RGL Layout item. Takes the relevant widthPreset and layout (already projected to the right viewport by 
  the caller).                                              
                                                                                                                                
  // Input:  block projected to viewport (layout = mobileLayout ?? layout, styles = mobileStyles ?? styles)
  // Output: { i, x, y, w, h } ready for react-grid-layout                                                                      
  export function blockToRglItem(block: Block, config: GridConfig): Layout {
    const { w, h } = spansForBlock(block, undefined, config);                                                                   
    const x = block.layout?.x ?? 0;                                                                                             
    const y = block.layout?.y ?? 0;                                                                                             
    return {                                                                                                                    
      i: block.id,                                                                                                              
      x,
      y: Math.round(y * config.rowScale),                                                                                       
      w,                                                    
      h: Math.max(1, Math.round(h * config.rowScale)),
      isResizable: false,  // bake it in per-item too
    };                                                                                                                          
  }
                                                                                                                                
  lib/editor-engine/rgl/rglLayoutToBlockUpdates.ts                                                                              
   
  Given a new RGL Layout array, returns only the blocks whose x or y actually changed (comparing against the pre-drag snapshot).
   Converts RGL sub-row y back to logical.                  
                                                                                                                                
  export function rglLayoutToBlockUpdates(                  
    newLayout: Layout[],
    snapshot: Record<string, { x: number; y: number }>,  // pre-drag logical positions                                          
    config: GridConfig,
  ): Array<{ id: string; x: number; y: number }> {                                                                              
    return newLayout.flatMap((item) => {                                                                                        
      const prev = snapshot[item.i];
      if (!prev) return [];                                                                                                     
      const logicalY = item.y / config.rowScale;            
      if (prev.x === item.x && prev.y === logicalY) return [];                                                                  
      return [{ id: item.i, x: item.x, y: logicalY }];                                                                          
    });
  }                                                                                                                             
                                                            
  ---
  Step 3 — Replace DesktopBlockCanvas
                                                                                                                                
  Remove everything dnd-kit: DndContext, PointerSensor, sensors, DragOverlay, DroppableCell grid, placementHighlight,
  useGridDnd, all related imports.                                                                                              
                                                            
  Replace with ReactGridLayout. Key structure:                                                                                  
                                                            
  import ReactGridLayout from "react-grid-layout";                                                                              
  import "react-grid-layout/css/styles.css";                

  // Derive layout from blocks                                                                                                  
  const layout = useMemo(() =>
    visibleBlocks.map((b) => blockToRglItem(b, DESKTOP_GRID)),                                                                  
    [visibleBlocks]                                                                                                             
  );
                                                                                                                                
  // Snapshot ref for drag start → needed to diff against on drag stop                                                          
  const snapshotRef = useRef<Record<string, { x: number; y: number }>>({});
                                                                                                                                
  const handleDragStart = () => {                           
    snapshotRef.current = Object.fromEntries(                                                                                   
      visibleBlocks.map((b) => [b.id, { x: b.layout?.x ?? 0, y: b.layout?.y ?? 0 }])
    );                                                                                                                          
  };
                                                                                                                                
  const handleLayoutChange = (newLayout: Layout[]) => {                                                                         
    // Update all blocks in local store
    for (const item of newLayout) {                                                                                             
      const logicalY = item.y / DESKTOP_GRID.rowScale;      
      applyUpdate(item.i, { layout: { x: item.x, y: logicalY } });                                                              
    }
  };                                                                                                                            
                                                            
  const handleDragStop = async (newLayout: Layout[]) => {                                                                       
    const changed = rglLayoutToBlockUpdates(newLayout, snapshotRef.current, DESKTOP_GRID);
    await Promise.all(                                                                                                          
      changed.map(({ id, x, y }) =>                         
        editor?.onUpdateBlock(id, { layout: { x, y } })                                                                         
      )                                                                                                                         
    );
  };                                                                                                                            
                                                            
  <ReactGridLayout
    layout={layout}
    cols={DESKTOP_GRID.cols}
    width={DESKTOP_GRID.canvasPx}                                                                                               
    rowHeight={DESKTOP_GRID.subRowPx}
    margin={[DESKTOP_GRID.gapXPx, DESKTOP_GRID.subRowGapPx]}                                                                    
    containerPadding={[0, 0]}                                                                                                   
    compactType="vertical"
    isResizable={false}                                                                                                         
    isDraggable={editable}                                  
    onDragStart={handleDragStart}                                                                                               
    onLayoutChange={handleLayoutChange}
    onDragStop={handleDragStop}                                                                                                 
  >                                                         
    {visibleBlocks.map((block) => (
      <div key={block.id}>
        <BlockGridItem block={block} />                                                                                         
      </div>
    ))}                                                                                                                         
  </ReactGridLayout>                                        

  The canvas height is no longer manually computed — RGL sizes itself. Remove the height style you currently set on the canvas  
  div.
                                                                                                                                
  ---                                                       
  Step 4 — Replace MobileCanvasGrid
                                                                                                                                
  Same as Step 3 but:
                                                                                                                                
  - cols={MOBILE_GRID.cols}, width={MOBILE_GRID.canvasPx}, rowHeight={MOBILE_GRID.subRowPx}, margin={[25, 15]}                  
  - Pass transformScale={scale} to RGL — this is the prop RGL provides specifically for CSS-scaled containers. It compensates
  pointer coordinates internally. Remove your custom gridOriginX calculation.                                                   
  - Update mobileLayout instead of layout in handleLayoutChange / handleDragStop
  - For mobile projection, keep the projectedBlocks useMemo that maps mobileLayout ?? layout and mobileStyles ?? styles — pass  
  projected blocks to blockToRglItem                                                                                            
  - The ResizeObserver / scale state stays as-is; pass scale to both RGL's transformScale and the outer style={{ transform:     
  \scale(${scale})` }}`                                                                                                         
                                                            
  ---                                                                                                                           
  Step 5 — Refactor SortableBlock → BlockGridItem           
                                                 
  This component becomes much simpler. Remove all dnd-kit:
                                                                                                                                
  Remove:
  - useDraggable, useDroppable imports and hook calls                                                                           
  - CSS.Transform, dndStyle                                                                                                     
  - activeDragId prop (no more overlay ghost hiding)
  - dndDisabled prop                                                                                                            
  - The combined setNodeRef callback                                                                                            
  - attributes, listeners spread                                                                                                
                                                                                                                                
  Keep:                                                     
  - BlockRenderer                                                                                                               
  - BlockHoverToolbar                                       
  - handleWidthChange — see Step 6                                                                                              
  - handleToggleWrapperBackground                           
  - isHovered state                                                                                                             
  - The outer hoverZone div and its event handlers
                                                                                                                                
  Result: BlockGridItem is just a styled content wrapper with a hover toolbar. RGL positions it; it renders content. The entire 
  component shrinks by ~40 lines.                                                                                               
                                                                                                                                
  One important addition: add a CSS class (e.g., drag-handle) to the block's visual wrapper, and pass                           
  draggableHandle=".drag-handle" to ReactGridLayout. This prevents drag from activating on interactive content inside blocks
  (text, buttons, etc.) while keeping the block's background area as the drag target.                                           
                                                            
  ---
  Step 6 — Programmatic resize (hover toolbar width change)
                                                                                                                                
  Currently computeResizeAndPushUpdates runs your custom collision logic when the user changes a block's width preset via the
  toolbar. With RGL, you no longer need this — just update the widthPreset in the store, and RGL's onLayoutChange will fire with
   the repacked layout automatically.                       
                                                                                                                                
  Replace handleWidthChange in BlockGridItem:                                                                                   
   
  const handleWidthChange = (preset: BlockWidthPreset) => {                                                                     
    if (!editor?.onUpdateBlock) return;                                                                                         
    const layoutKey = viewport === "mobile" ? "mobileLayout" : "layout";
    const stylesKey = viewport === "mobile" ? "mobileStyles" : "styles";                                                        
    editor.onUpdateBlock(block.id, {                                                                                            
      [stylesKey]: { ...block.styles, widthPreset: preset },                                                                    
    });                                                                                                                         
    // RGL sees new w/h, repacks, fires onLayoutChange → positions update automatically
  };                                                                                                                            
                                                                                                                                
  This means lib/editor-engine/layout/resize.ts can be deleted after verifying it's only called from SortableBlock.             
                                                                                                                                
  ---                                                                                                                           
  Step 7 — Update normalization                             
                                                                                                                                
  In lib/editor-engine/data/normalization.ts, the ensureBlocksHaveValidLayouts function calls compactEmptyRows at the end. You
  can remove that call — RGL will compact on first render. The rest of normalization (collision checking, findFirstFreeSpot)    
  stays because it's still needed for the initial load of freshly-added blocks.
                                                                                                                                
  ---                                                       
  Step 8 — CSS: replace dnd-kit styles with RGL placeholder
                                                                                                                                
  Remove from BlockCanvas.module.css:
  - .dropGrid, .dropGridActive                                                                                                  
  - .placementHighlight                                                                                                         
                                                                                                                                
  Add a global CSS override for the RGL placeholder (the built-in drop target highlight):                                       
                                                                                                                                
  /* In globals.css or a new rgl-overrides.css */
  .react-grid-placeholder {                                                                                                     
    background: hsl(var(--your-accent-color) / 0.25);       
    border: 2px dashed hsl(var(--your-accent-color));                                                                           
    border-radius: 12px;  /* match your block border-radius */                                                                  
    opacity: 1 !important;                                                                                                      
  }                                                                                                                             
                                                            
  RGL renders .react-grid-placeholder exactly where the block will land, with correct dimensions. No custom highlight logic     
  needed.                                                   
                                                                                                                                
  ---                                                       
  Step 9 — Delete dead code
                           
  After the above steps, these can be fully deleted:
                                                                                                                                
  ┌────────────────────────────────────────────────────┬────────────────────────────────────┐
  │                        File                        │               Reason               │                                   
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤
  │ components/builder/BlockCanvas/hooks/useGridDnd.ts │ Replaced by RGL                    │
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤
  │ lib/dndKit.ts                                      │ No more dnd-kit                    │                                   
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤                                   
  │ lib/editor-engine/layout/drag-placement.ts         │ Replaced by RGL collision          │                                   
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤                                   
  │ components/builder/BlockCanvas/DroppableCell.tsx   │ No more droppable cells            │
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤                                   
  │ lib/editor-engine/grid/compact.ts                  │ Replaced by compactType="vertical" │
  ├────────────────────────────────────────────────────┼────────────────────────────────────┤                                   
  │ lib/editor-engine/layout/resize.ts                 │ Replaced by Step 6                 │
  └────────────────────────────────────────────────────┴────────────────────────────────────┘                                   
   
  Trimmed:                                                                                                                      
  - lib/editor-engine/layout/collision.ts — keep canPlaceBlockAt and findFirstFreeSpot (still needed by normalization), delete
  resolveCollisions                                                                                                             
  - stores/editor-store.ts — reorderBlocks action is no longer used (RGL manages order via x/y, not array index)
  - types/builder.ts — remove DesktopDndSnapshot, UseDesktopGridDndArgs                                                         
                                                                                                                                
  ---                                                                                                                           
  Step 10 — Readonly mode                                                                                                       
                                                                                                                                
  Both DesktopReadonlyBlock and MobileReadonlyBlock currently render standalone positioned divs. With RGL, readonly is just the
  same canvas components with editable={false} → isDraggable={false}. The block content renders identically. The two            
  *ReadonlyBlock components become unnecessary if blocks render via BlockGridItem (which already conditionally shows the toolbar
   only when editor context is present).                                                                                        
                                                            
  ---
  What the final architecture looks like
                                                                                                                                
  BlockCanvas
  ├── DesktopBlockCanvas       ← ReactGridLayout, editable/readonly via isDraggable                                             
  │   └── BlockGridItem        ← block content + hover toolbar, no dnd-kit                                                      
  └── MobileCanvasGrid         ← ReactGridLayout + transformScale                                                               
      └── BlockGridItem                                                                                                         
                                                                                                                                
  The entire lib/editor-engine/layout/ directory shrinks from 3 files (~350 lines) to 1 file (collision.ts with ~50 lines of    
  placement helpers). useGridDnd.ts (~370 lines) disappears entirely.
                                                                                                                                
  ---                                                       
  Roadmap item
                                                                                                                                
  Block swap — When dragging a block into a position occupied by a same-size block, swap positions instead of pushing. Implement
   in RGL's onDragStop: detect if the old position of the dragged block is now occupied by a block that was originally at the   
  target position AND they share dimensions → manually swap their x,y values and call updateBlock for both.