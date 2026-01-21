# Drag and Drop System Documentation

## Overview
The Latios Sign Template Editor uses `@dnd-kit/core` for its drag-and-drop capabilities. The system allows users to drag tools from a sidebar (`Toolbox`) onto a document canvas (`Canvas`).

## Architecture

### 1. DndContext (`Editor.tsx`)
The `DndContext` wraps the entire editor area. It manages the state of the drag operation.
- **Sensors**: Uses `PointerSensor` (mouse/touch) and `KeyboardSensor`.
- **Collision Detection**: key configuration `collisionDetection={pointerWithin}` is used. This is critical for detecting drops on the canvas, even if the cursor is hovering over other elements (like the dashed border of the canvas or other blocks).
  - *Regression Note*: We previously used `closestCorners`, but `pointerWithin` proved more reliable for the "Paper" metaphor where the user must be strictly inside the bounds.

### 2. Draggable Items
- **ToolboxItem (`Toolbox.tsx`)**: The source of new blocks.
  - It uses `useDraggable`.
  - **Important**: It does *not* move its own DOM element during drag. Instead, it relies on `DragOverlay` to show a preview. This prevents the sidebar from looking broken during interaction.
- **DraggableBlock (`DraggableBlock.tsx`)**: Existing blocks on the canvas.
  - These are draggable to reposition them.

### 3. Droppable Zones
- **Canvas (`Canvas.tsx`)**: The main drop zone.
  - Uses `useDroppable({ id: 'canvas' })`.
  - **CRITICAL**: The `ref={setNodeRef}` MUST be attached to the inner "Paper" div. If this reference is lost, the drop system will not know where the canvas is.
  - `id="canvas-area"` is used for coordinate calculation (calculating relative X,Y from the viewport rect).

### 4. Drop Logic (`Editor.tsx` -> `handleDragEnd`)
1.  **Detection**: Checks if `event.over.id === 'canvas'`. 
    - *Enhanced Logic*: Also checks if `event.over.id` matches any existing block ID. This allows dropping "on top" of another block, which visually counts as dropping on the canvas.
2.  **Coordinate Mapping**:
    - Calculates `dropRect.left - canvasRect.left` to get relative X.
    - Uses `Math.max(0, val)` to ensure blocks stay in bounds (top/left).
3.  **Creation**:
    - If dragging from Toolbox: Creates a new block with a unique ID (using a safe alphanumeric generator).
    - If moving valid block: Updates X,Y coordinates.

## Common Issues & Fixes
- **Drop not working**: Usually means `ref={setNodeRef}` is missing from the Canvas div, or `collisionDetection` is failing.
- **Sidebar items disappearing**: Occurs if the ToolboxItem applies the `transform` style to itself instead of letting `DragOverlay` handle the visual.
- **Silent Failures**: Browser security policies might block `crypto.randomUUID()`. We use `Math.random().toString(36)` as a fallback.
