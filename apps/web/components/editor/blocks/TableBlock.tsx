// ... (imports)
import { Repeat } from 'lucide-react';

interface TableData {
    rows: string[][];
    headerRows?: number;
    headerColor?: string;
    borderColor?: string;
    borderWidth?: number;
    rowTypes?: ('header' | 'static' | 'dynamic')[]; // New: track row type
}

// ... (TableBlockProps)

export function parseTableData(content?: string): TableData {
    if (!content) {
        return {
            rows: [['', ''], ['', '']],
            headerRows: 0,
            headerColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: 1,
            rowTypes: ['static', 'static']
        };
    }
    try {
        const parsed = JSON.parse(content);
        const rows = parsed.rows || [['', ''], ['', '']];
        const headerRows = parsed.headerRows ?? 0;

        // Ensure rowTypes exist and match rows length
        let rowTypes = parsed.rowTypes;
        if (!rowTypes || !Array.isArray(rowTypes) || rowTypes.length !== rows.length) {
            rowTypes = rows.map((_: any, i: number) => i < headerRows ? 'header' : 'static');
        }

        return {
            rows,
            headerRows,
            headerColor: parsed.headerColor || '#f3f4f6',
            borderColor: parsed.borderColor || '#d1d5db',
            borderWidth: parsed.borderWidth ?? 1,
            rowTypes
        };
    } catch {
        return {
            rows: [['', ''], ['', '']],
            headerRows: 0,
            headerColor: '#f3f4f6',
            borderColor: '#d1d5db',
            borderWidth: 1,
            rowTypes: ['static', 'static']
        };
    }
}

export function TableBlock({ content, onChange, readOnly, style }: TableBlockProps) {
    const data = parseTableData(content);
    const { rows, headerRows, headerColor, borderColor, borderWidth, rowTypes } = data;

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
            <div className={`overflow-x-auto ${readOnly ? '' : 'pb-4'}`}>
                {/* Added pb-4 to allows space for absolute indicators if needed */}
                <table className="w-full border-collapse">
                    <tbody>
                        {rows.map((row, rowIndex) => {
                            const isDynamic = rowTypes?.[rowIndex] === 'dynamic';

                            return (
                                <tr key={rowIndex} className={`relative group/row ${isDynamic ? 'bg-blue-50' : ''}`}>
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
                                            {/* Dynamic Row Indicator (First Cell) - Icon Only */}
                                            {colIndex === 0 && isDynamic && (
                                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-blue-600 z-10" title="Fila Repetible">
                                                    <Repeat size={16} />
                                                </div>
                                            )}

                                            {readOnly ? (
                                                <div className="p-2 min-h-[1.5em] text-sm">{cell}</div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                    className="w-full p-2 border-none focus:ring-1 focus:ring-inset focus:ring-brand-500 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                                                    placeholder={isDynamic ? "{{variable}}" : "..."}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    style={{
                                                        fontWeight: isHeaderRow(rowIndex) ? 600 : 400,
                                                    }}
                                                />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
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
    // New row is static by default
    const newRowTypes = [...(data.rowTypes || []), 'static'];
    return JSON.stringify({ ...data, rows: newRows, rowTypes: newRowTypes });
}

export function removeRow(content: string, rowIndex?: number): string {
    const data = parseTableData(content);
    if (data.rows.length <= 1) return content;
    const idx = rowIndex ?? data.rows.length - 1;

    const newRows = data.rows.filter((_, i) => i !== idx);
    const newRowTypes = (data.rowTypes || []).filter((_, i) => i !== idx);

    // Adjust headerRows if we removed a header
    const newHeaderRows = Math.min(data.headerRows || 0, newRows.length);
    return JSON.stringify({ ...data, rows: newRows, headerRows: newHeaderRows, rowTypes: newRowTypes });
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
    const newHeaderRows = Math.max(0, Math.min(count, data.rows.length));
    // Update rowTypes to reflect new headers
    const newRowTypes = (data.rowTypes || []).map((type, i) => i < newHeaderRows ? 'header' : (type === 'header' ? 'static' : type));

    return JSON.stringify({ ...data, headerRows: newHeaderRows, rowTypes: newRowTypes });
}

export function toggleLastRowDynamic(content: string): string {
    const data = parseTableData(content);
    if (data.rows.length === 0) return content;

    const lastIndex = data.rows.length - 1;
    const currentType = data.rowTypes?.[lastIndex] || 'static';
    const newType = currentType === 'dynamic' ? 'static' : 'dynamic';

    const newRowTypes = [...(data.rowTypes || [])];
    newRowTypes[lastIndex] = newType;

    return JSON.stringify({ ...data, rowTypes: newRowTypes });
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

