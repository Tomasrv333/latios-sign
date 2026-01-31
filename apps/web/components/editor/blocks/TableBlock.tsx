import React from 'react';

interface TableData {
    rows: string[][];
    headerRows?: number; // Number of rows that are headers (from top)
    headerColor?: string; // Background color for header rows
    borderColor?: string; // Border color
    borderWidth?: number; // Border width in pixels
}

interface TableBlockProps {
    content?: string; // Stored as JSON string
    onChange: (content: string) => void;
    readOnly?: boolean;
    style?: React.CSSProperties;
}

export function parseTableData(content?: string): TableData {
    if (!content) {
        return {
            rows: [['', ''], ['', '']],
            headerRows: 0,
            headerColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: 1
        };
    }
    try {
        const parsed = JSON.parse(content);
        return {
            rows: parsed.rows || [['', ''], ['', '']],
            headerRows: parsed.headerRows ?? 0,
            headerColor: parsed.headerColor || '#f3f4f6',
            borderColor: parsed.borderColor || '#d1d5db',
            borderWidth: parsed.borderWidth ?? 1
        };
    } catch {
        return {
            rows: [['', ''], ['', '']],
            headerRows: 0,
            headerColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: 1
        };
    }
}

export function TableBlock({ content, onChange, readOnly, style }: TableBlockProps) {
    const data = parseTableData(content);
    const { rows, headerRows, headerColor, borderColor, borderWidth } = data;

    const updateTable = (updates: Partial<TableData>) => {
        onChange(JSON.stringify({ ...data, ...updates }));
    };

    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = rows.map((row, ri) =>
            ri === rowIndex
                ? row.map((cell, ci) => ci === colIndex ? value : cell)
                : [...row]
        );
        updateTable({ rows: newRows });
    };

    const isHeaderRow = (rowIndex: number) => rowIndex < (headerRows || 0);

    return (
        <div className="w-full overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table
                    className="w-full border-collapse"
                >
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="min-w-[80px] relative"
                                        style={{
                                            border: `${borderWidth}px solid ${borderColor}`,
                                            backgroundColor: isHeaderRow(rowIndex) ? headerColor : 'transparent',
                                            fontWeight: isHeaderRow(rowIndex) ? 600 : 400,
                                        }}
                                    >
                                        {readOnly ? (
                                            <div className="p-2 min-h-[1.5em] text-sm">{cell}</div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={cell}
                                                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                className="w-full p-2 border-none focus:ring-1 focus:ring-inset focus:ring-brand-500 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                                                placeholder="..."
                                                onPointerDown={(e) => e.stopPropagation()}
                                                style={{
                                                    fontWeight: isHeaderRow(rowIndex) ? 600 : 400,
                                                }}
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Export helper functions for the toolbar
export function addRow(content: string): string {
    const data = parseTableData(content);
    const cols = data.rows[0]?.length || 2;
    const newRows = [...data.rows, Array(cols).fill('')];
    return JSON.stringify({ ...data, rows: newRows });
}

export function removeRow(content: string, rowIndex?: number): string {
    const data = parseTableData(content);
    if (data.rows.length <= 1) return content;
    const idx = rowIndex ?? data.rows.length - 1;
    const newRows = data.rows.filter((_, i) => i !== idx);
    // Adjust headerRows if we removed a header
    const newHeaderRows = Math.min(data.headerRows || 0, newRows.length);
    return JSON.stringify({ ...data, rows: newRows, headerRows: newHeaderRows });
}

export function addColumn(content: string): string {
    const data = parseTableData(content);
    const newRows = data.rows.map(row => [...row, '']);
    return JSON.stringify({ ...data, rows: newRows });
}

export function removeColumn(content: string, colIndex?: number): string {
    const data = parseTableData(content);
    if (data.rows[0]?.length <= 1) return content;
    const idx = colIndex ?? (data.rows[0]?.length - 1);
    const newRows = data.rows.map(row => row.filter((_, i) => i !== idx));
    return JSON.stringify({ ...data, rows: newRows });
}

export function setHeaderRows(content: string, count: number): string {
    const data = parseTableData(content);
    return JSON.stringify({ ...data, headerRows: Math.max(0, Math.min(count, data.rows.length)) });
}

export function setHeaderColor(content: string, color: string): string {
    const data = parseTableData(content);
    return JSON.stringify({ ...data, headerColor: color });
}

export function setBorderColor(content: string, color: string): string {
    const data = parseTableData(content);
    return JSON.stringify({ ...data, borderColor: color });
}

export function setBorderWidth(content: string, width: number): string {
    const data = parseTableData(content);
    return JSON.stringify({ ...data, borderWidth: width });
}

