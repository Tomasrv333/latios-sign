import { Modifier } from '@dnd-kit/core';
import { Coordinates } from '@dnd-kit/utilities';

// Simple snap to grid modifier (20px grid)
export const snapToGridModifier: Modifier = ({ transform }) => {
    return {
        ...transform,
        x: Math.round(transform.x / 20) * 20,
        y: Math.round(transform.y / 20) * 20,
    };
};
