import { Modifier } from '@dnd-kit/core';
import { EditorBlock } from './Canvas';

export interface Guideline {
    x?: number;
    y?: number;
    orientation: 'vertical' | 'horizontal';
    page?: number;
}

// Simple snap to grid modifier (20px grid)
export const snapToGridModifier: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: Math.round(transform.x / 20) * 20,
        y: Math.round(transform.y / 20) * 20,
    };
};

export const createSmartGuidesModifier = (
    blocks: EditorBlock[],
    onLinesChange: (lines: Guideline[]) => void
): Modifier => {
    // Keep track of last lines to avoid infinite render loops
    let lastLines: Guideline[] = [];

    return ({ transform, active, draggingNodeRect }) => {
        if (!draggingNodeRect || !active) return transform;

        // Current position (with grid snap as baseline or raw?) 
        // Let's calculate raw projected position first
        const rawX = transform.x;
        const rawY = transform.y;

        // The modifiers are applied to the DELTA (transform), not absolute coordinates.
        // We need the absolute coordinates of the dragging node to compare.
        // draggingNodeRect is the INITIAL rect.
        const currentRect = {
            left: draggingNodeRect.left + rawX,
            top: draggingNodeRect.top + rawY,
            right: draggingNodeRect.left + draggingNodeRect.width + rawX,
            bottom: draggingNodeRect.top + draggingNodeRect.height + rawY,
            width: draggingNodeRect.width,
            height: draggingNodeRect.height,
            centerX: draggingNodeRect.left + rawX + draggingNodeRect.width / 2,
            centerY: draggingNodeRect.top + rawY + draggingNodeRect.height / 2,
        };

        const THRESHOLD = 5;
        let finalX = rawX;
        let finalY = rawY;
        const newLines: Guideline[] = [];

        // 1. Grid Snap (Default/Fallback)
        // We calculate grid snap first, then override if smart guide found?
        // Or smart guide takes precedence?
        // Usually Smart Guide > Grid.
        let snappedX = Math.round(rawX / 20) * 20;
        let snappedY = Math.round(rawY / 20) * 20;

        // Check horizontal matches (modify Y)
        let foundY = false;
        // Check vertical matches (modify X)
        let foundX = false;

        // We need to compare against OTHER blocks
        // The blocks array has absolute positions (x,y) which are CSS 'left','top'.
        // We assume blocks are in the same coordinate space (Canvas).
        // DraggingNodeRect might be screen coordinates... logic needs care.
        // IF blocks are passed as x,y (relative to canvas), comparison is safest if we use relative delta.
        // BUT draggingNodeRect is client rect.
        // SIMPLIFICATION: We only know the DELTA (transform). We know the block's initial X/Y.
        // We should pass the INITIAL block state to the modifier factory or assume 'active' has data.
        // active.data.current usually has the initial x,y.

        // Let's assume we align center-to-center or edge-to-edge.
        // Since coordinate spaces are tricky in dnd-kit modifiers without context,
        // we will implement specific "Line" logic in a follow-up if this is too complex.
        // For MVP Smart Guides:
        // We assume the passed 'blocks' have x,y,w,h in standard canvas coords.
        // We need the active block's 'initial' x,y to apply delta.
        // active.data.current should have it.

        const activeBlock = active?.data?.current as Partial<EditorBlock>;
        if (!activeBlock || typeof activeBlock.x !== 'number' || typeof activeBlock.y !== 'number') {
            // Fallback to grid
            return {
                ...transform,
                x: snappedX,
                y: snappedY
            };
        }

        const initialX = activeBlock.x;
        const initialY = activeBlock.y;
        const page = activeBlock.page || 1; // Get page
        const w = activeBlock.w || 200; // Default width if unknown
        const h = activeBlock.h || 50;  // Default height

        // Candidate positions for the active block
        const candidateX = initialX + rawX;
        const candidateY = initialY + rawY;
        const candidateCenterX = candidateX + w / 2;
        const candidateCenterY = candidateY + h / 2;
        const candidateRight = candidateX + w;
        const candidateBottom = candidateY + h;

        // Iterate blocks
        for (const other of blocks) {
            if (other.id === active.id) continue;
            // Only compare blocks on same page? 
            if (other.page !== activeBlock.page) continue;

            const otherW = other.w || 200; // approximation if unknown, blocks usually have it
            const otherH = other.h || (other.type === 'figure' ? 100 : (other.type === 'image' ? 150 : 50)); // Approximation

            const otherRight = other.x + otherW;
            const otherBottom = other.y + otherH;
            const otherCenterX = other.x + otherW / 2;
            const otherCenterY = other.y + otherH / 2;

            // --- Vertical Alignment (X axis) ---
            if (!foundX) {
                // Left -> Left
                if (Math.abs(candidateX - other.x) < THRESHOLD) {
                    finalX = other.x - initialX;
                    foundX = true;
                    newLines.push({ x: other.x, orientation: 'vertical', page });
                }
                // Left -> Right
                else if (Math.abs(candidateX - otherRight) < THRESHOLD) {
                    finalX = otherRight - initialX;
                    foundX = true;
                    newLines.push({ x: otherRight, orientation: 'vertical', page });
                }
                // Right -> Left
                else if (Math.abs(candidateRight - other.x) < THRESHOLD) {
                    finalX = other.x - w - initialX;
                    foundX = true;
                    newLines.push({ x: other.x, orientation: 'vertical', page });
                }
                // Right -> Right
                else if (Math.abs(candidateRight - otherRight) < THRESHOLD) {
                    finalX = otherRight - w - initialX;
                    foundX = true;
                    newLines.push({ x: otherRight, orientation: 'vertical', page });
                }
                // Center -> Center
                else if (Math.abs(candidateCenterX - otherCenterX) < THRESHOLD) {
                    finalX = otherCenterX - w / 2 - initialX;
                    foundX = true;
                    newLines.push({ x: otherCenterX, orientation: 'vertical', page });
                }
            }

            // --- Horizontal Alignment (Y axis) ---
            if (!foundY) {
                // Top -> Top
                if (Math.abs(candidateY - other.y) < THRESHOLD) {
                    finalY = other.y - initialY;
                    foundY = true;
                    newLines.push({ y: other.y, orientation: 'horizontal', page });
                }
                // Top -> Bottom
                else if (Math.abs(candidateY - otherBottom) < THRESHOLD) {
                    finalY = otherBottom - initialY;
                    foundY = true;
                    newLines.push({ y: otherBottom, orientation: 'horizontal', page });
                }
                // Bottom -> Top
                else if (Math.abs(candidateBottom - other.y) < THRESHOLD) {
                    finalY = other.y - h - initialY;
                    foundY = true;
                    newLines.push({ y: other.y, orientation: 'horizontal', page });
                }
                // Bottom -> Bottom
                else if (Math.abs(candidateBottom - otherBottom) < THRESHOLD) {
                    finalY = otherBottom - h - initialY;
                    foundY = true;
                    newLines.push({ y: otherBottom, orientation: 'horizontal', page });
                }
                // Center -> Center
                else if (Math.abs(candidateCenterY - otherCenterY) < THRESHOLD) {
                    finalY = otherCenterY - h / 2 - initialY;
                    foundY = true;
                    newLines.push({ y: otherCenterY, orientation: 'horizontal', page });
                }
            }
        }

        // Apply grid snap if no smart snap found
        if (!foundX) finalX = snappedX;
        if (!foundY) finalY = snappedY;

        // Update lines only if changed
        // Simple check: length diff or first item diff (good enough for now)
        const hasChanged = newLines.length !== lastLines.length ||
            newLines.some((l, i) => l.x !== lastLines[i].x || l.y !== lastLines[i].y);

        if (hasChanged) {
            lastLines = newLines;
            onLinesChange(newLines);
        }

        return {
            ...transform,
            x: finalX,
            y: finalY
        };
    };
};
