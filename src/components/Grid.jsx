import React, { useState, useCallback, useEffect } from 'react';
import Cell from './Cell';

function Grid({ selectedCell, cellData, onCellSelect, onCellChange }) {
  const ROWS = 100;
  const COLS = 26; // A to Z

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);

  const getCellId = (row, col) => {
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  };

  const getCellCoords = (cellId) => {
    const col = cellId.match(/[A-Z]+/)[0];
    const row = parseInt(cellId.match(/\d+/)[0]) - 1;
    const colIndex = col.split('').reduce((acc, char) => 
      acc * 26 + char.charCodeAt(0) - 65, 0);
    return { row, col: colIndex };
  };

  const handleDragStart = useCallback((cellId) => {
    setIsDragging(true);
    setDragStart(cellId);
    setDragEnd(cellId);
    setSelectedRange(null);
    onCellSelect(cellId);
  }, [onCellSelect]);

  const handleDragEnter = useCallback((cellId) => {
    if (isDragging) {
      setDragEnd(cellId);
      
      // Calculate selected range
      const start = getCellCoords(dragStart);
      const end = getCellCoords(cellId);
      
      const minRow = Math.min(start.row, end.row);
      const maxRow = Math.max(start.row, end.row);
      const minCol = Math.min(start.col, end.col);
      const maxCol = Math.max(start.col, end.col);
      
      const range = [];
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          range.push(getCellId(row, col));
        }
      }
      setSelectedRange(range);
    }
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, []);

  const handleCellClick = useCallback((cellId) => {
    setSelectedRange(null);
    onCellSelect(cellId);
  }, [onCellSelect]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, handleDragEnd]);

  return (
    <div className="flex-1 overflow-auto relative">
      <div className="inline-block min-w-full">
        {/* Header Row */}
        <div className="flex sticky top-0 z-10">
          <div className="w-[40px] h-[24px] bg-gray-50 border-b border-r border-gray-300 flex items-center justify-center" />
          {Array.from({ length: COLS }).map((_, col) => (
            <div 
              key={col} 
              className="w-[120px] h-[24px] bg-gray-50 border-b border-r border-gray-300 
                       flex items-center justify-center text-sm font-medium text-gray-700"
            >
              {String.fromCharCode(65 + col)}
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex relative">
            <div 
              className="w-[40px] h-[24px] bg-gray-50 border-b border-r border-gray-300 
                       sticky left-0 flex items-center justify-center text-sm font-medium text-gray-700"
            >
              {row + 1}
            </div>
            {Array.from({ length: COLS }).map((_, col) => {
              const cellId = getCellId(row, col);
              return (
                <Cell
                  key={cellId}
                  id={cellId}
                  value={cellData[cellId]?.value || ''}
                  isSelected={selectedCell === cellId}
                  isInRange={selectedRange?.includes(cellId)}
                  onSelect={() => handleCellClick(cellId)}
                  onChange={(value) => onCellChange(cellId, value)}
                  onDragStart={() => handleDragStart(cellId)}
                  onDragEnter={() => handleDragEnter(cellId)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Grid; 