import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '../Canvas';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mocks
vi.mock('@dnd-kit/core', () => ({
    useDroppable: () => ({ setNodeRef: vi.fn() }),
}));

vi.mock('../DraggableBlock', () => ({
    DraggableBlock: ({ children, block }: any) => (
        <div data-testid={`block-${block.id}`}>{children}</div>
    ),
}));

vi.mock('../blocks/SmartTextBlock', () => ({
    SmartTextBlock: ({ content }: any) => <div>{content}</div>,
}));

vi.mock('../blocks/TableBlock', () => ({
    TableBlock: () => <div>Table Block</div>
}));

vi.mock('next/dynamic', () => ({
    default: () => () => <div>PDF Background</div>
}));


describe('Canvas Component', () => {
    const defaultProps = {
        blocks: [],
        onDeleteBlock: vi.fn(),
        onUpdateBlock: vi.fn(),
        numPages: 1,
        onAddPage: vi.fn(),
    };

    it('renders correct number of pages', () => {
        const { container } = render(<Canvas {...defaultProps} numPages={3} />);
        // SinglePage renders a div with id `canvas-page-${pageNumber}`
        expect(container.querySelector('#canvas-page-1')).toBeInTheDocument();
        expect(container.querySelector('#canvas-page-2')).toBeInTheDocument();
        expect(container.querySelector('#canvas-page-3')).toBeInTheDocument();
    });

    it('renders blocks on the correct page', () => {
        const blocks = [
            { id: '1', type: 'text', page: 1, content: 'Block on Page 1', x: 0, y: 0 },
            { id: '2', type: 'text', page: 2, content: 'Block on Page 2', x: 0, y: 0 },
        ];
        // @ts-ignore
        render(<Canvas {...defaultProps} blocks={blocks} numPages={2} />);

        expect(screen.getByTestId('block-1')).toBeInTheDocument();
        expect(screen.getByTestId('block-2')).toBeInTheDocument();
    });

    it('calls onAddPage when "Agregar Nueva Página" is clicked', () => {
        render(<Canvas {...defaultProps} />);
        const button = screen.getByText('Agregar Nueva Página');
        fireEvent.click(button);
        expect(defaultProps.onAddPage).toHaveBeenCalled();
    });

    it('handles zoom in and out', () => {
        render(<Canvas {...defaultProps} />);
        const zoomInBtn = screen.getByTitle('Aumentar Zoom (+)');
        const zoomOutBtn = screen.getByTitle('Reducir Zoom (-)');
        const zoomDisplay = screen.getByText('100%');

        fireEvent.click(zoomInBtn);
        expect(screen.getByText('110%')).toBeInTheDocument();

        fireEvent.click(zoomOutBtn);
        expect(screen.getByText('100%')).toBeInTheDocument();
    });
});
