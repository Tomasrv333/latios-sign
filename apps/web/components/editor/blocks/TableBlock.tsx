import React from 'react';

interface TableBlockProps {
    content?: string; // Stored as JSON string: { rows: string[][] }
    onChange: (content: string) => void;
    readOnly?: boolean;
}

export function TableBlock({ content, onChange, readOnly }: TableBlockProps) {
    // Parse content or default to 2x2 table
    const initialData = content ? JSON.parse(content) : { rows: [['', ''], ['', '']] };
    const rows: string[][] = initialData.rows || [['', ''], ['', '']];

    const updateTable = (newRows: string[][]) => {
        onChange(JSON.stringify({ rows: newRows }));
    };

    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newRows = [...rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        updateTable(newRows);
    };

    return (
        <div className="w-full overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, colIndex) => (
                                    <td key={colIndex} className="border border-gray-300 p-1 min-w-[100px] relative group">
                                        {readOnly ? (
                                            <div className="p-2 min-h-[1.5em]">{cell}</div>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                                    className="w-full p-2 border-none focus:ring-1 focus:ring-brand-500 bg-transparent text-sm text-gray-900 placeholder:text-gray-400"
                                                    placeholder="..."
                                                    onPointerDown={(e) => e.stopPropagation()} // Allow text selection without dragging block
                                                />
                                            </div>
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
