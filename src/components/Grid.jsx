import React, { useState, useCallback, useEffect } from 'react';
import Cell from './Cell';
import ContextMenu from './ContextMenu';
import ResizeHandle from './ResizeHandle';
import { spreadsheetFunctions } from '../utils/spreadsheetFunctions';
import DeleteDuplicatesModal from './DeleteDuplicatesModal';

function Grid({ selectedCell, cellData, onCellSelect, onCellChange, onGridChange, onRangeSelect, cellValidations = {}, onContextMenuAction }) {
  const ROWS = 100;
  const COLS = 26; // A to Z

  const [columnWidths, setColumnWidths] = useState({});
  const [rowHeights, setRowHeights] = useState({});
  const [resizing, setResizing] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextCell, setContextCell] = useState(null);
  const [showDeleteDuplicatesModal, setShowDeleteDuplicatesModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);

  const getColumnWidth = (col) => columnWidths[col] || 120;
  const getRowHeight = (row) => rowHeights[row] || 24;

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

  const getUniqueRowKey = (rowIndex, columns) => {
    return columns.map(col => {
      const cellId = getCellId(rowIndex, col.charCodeAt(0) - 65);
      return cellData[cellId]?.value || '';
    }).join('|');
  };

  const handleDeleteDuplicates = (columns) => {
    const newCellData = { ...cellData };
    const rowsInRange = new Set(selectedRange.map(cellId => 
      parseInt(cellId.match(/\d+/)[0]) - 1
    ));
    
    // Create a map of unique rows
    const uniqueRows = new Map();
    const rowsToDelete = new Set();
    
    [...rowsInRange].sort((a, b) => a - b).forEach(row => {
      const key = getUniqueRowKey(row, columns);
      if (uniqueRows.has(key)) {
        rowsToDelete.add(row);
      } else {
        uniqueRows.set(key, row);
      }
    });
    
    // Delete duplicate rows
    [...rowsToDelete].sort((a, b) => b - a).forEach(row => {
      for (let currentRow = row; currentRow < ROWS - 1; currentRow++) {
        for (let col = 0; col < COLS; col++) {
          const currentCellId = getCellId(currentRow, col);
          const nextCellId = getCellId(currentRow + 1, col);
          
          if (cellData[nextCellId]) {
            newCellData[currentCellId] = { ...cellData[nextCellId] };
          } else {
            delete newCellData[currentCellId];
          }
        }
      }
    });
    
    onGridChange(newCellData);
    setShowDeleteDuplicatesModal(false);
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
      onRangeSelect(range);
    }
  }, [isDragging, dragStart, onRangeSelect]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, []);

  const handleCellClick = useCallback((cellId) => {
    setSelectedRange(null);
    onCellSelect(cellId);
  }, [onCellSelect]);

  const handleContextMenu = useCallback((e, cellId) => {
    e.preventDefault();
    setContextMenu({ x: e.pageX, y: e.pageY });
    setContextCell(cellId);
    onCellSelect(cellId);
  }, [onCellSelect]);

  const handleContextAction = useCallback((action) => {
    if (!contextCell) return;
    
    const { row, col } = getCellCoords(contextCell);
    const newCellData = { ...cellData };
    
    switch (action) {
      case 'dataValidation':
        // Forward the action to parent component
        onContextMenuAction(action);
        break;

      case 'insertRowBelow': {
        // First preserve the selected row's data
        const selectedRowData = {};
        for (let currentCol = 0; currentCol < COLS; currentCol++) {
          const selectedCellId = getCellId(row, currentCol);
          if (cellData[selectedCellId]) {
            selectedRowData[selectedCellId] = { ...cellData[selectedCellId] };
          }
        }

        // Start from the bottom and move each row down by one
        for (let currentRow = ROWS - 1; currentRow > row; currentRow--) {
          for (let currentCol = 0; currentCol < COLS; currentCol++) {
            const currentCellId = getCellId(currentRow - 1, currentCol);
            const newCellId = getCellId(currentRow, currentCol);
            if (cellData[currentCellId]) {
              newCellData[newCellId] = { ...cellData[currentCellId] };
              delete newCellData[currentCellId];
            } else {
              delete newCellData[newCellId];
            }
          }
        }

        // Restore the selected row's data
        Object.entries(selectedRowData).forEach(([cellId, data]) => {
          newCellData[cellId] = data;
        });

        // Ensure the new row is empty
        for (let currentCol = 0; currentCol < COLS; currentCol++) {
          const newCellId = getCellId(row + 1, currentCol);
          delete newCellData[newCellId];
        }
        break;
      }
      
      case 'insertColumnRight': {
        // First preserve the selected column's data
        const selectedColData = {};
        for (let currentRow = 0; currentRow < ROWS; currentRow++) {
          const selectedCellId = getCellId(currentRow, col);
          if (cellData[selectedCellId]) {
            selectedColData[selectedCellId] = { ...cellData[selectedCellId] };
          }
        }

        // Start from the rightmost column and move each column right by one
        for (let currentCol = COLS - 1; currentCol > col; currentCol--) {
          for (let currentRow = 0; currentRow < ROWS; currentRow++) {
            const currentCellId = getCellId(currentRow, currentCol - 1);
            const newCellId = getCellId(currentRow, currentCol);
            if (cellData[currentCellId]) {
              newCellData[newCellId] = { ...cellData[currentCellId] };
              delete newCellData[currentCellId];
            } else {
              delete newCellData[newCellId];
            }
          }
        }

        // Restore the selected column's data
        Object.entries(selectedColData).forEach(([cellId, data]) => {
          newCellData[cellId] = data;
        });

        // Ensure the new column is empty
        for (let currentRow = 0; currentRow < ROWS; currentRow++) {
          const newCellId = getCellId(currentRow, col + 1);
          delete newCellData[newCellId];
        }
        break;
      }

      case 'deleteRow': {
        // Move all rows below up by one
        for (let currentRow = row; currentRow < ROWS - 1; currentRow++) {
          for (let currentCol = 0; currentCol < COLS; currentCol++) {
            const nextRowCellId = getCellId(currentRow + 1, currentCol);
            const currentCellId = getCellId(currentRow, currentCol);
            
            if (cellData[nextRowCellId]) {
              newCellData[currentCellId] = { ...cellData[nextRowCellId] };
            } else {
              delete newCellData[currentCellId];
            }
          }
        }
        
        // Clear the last row
        for (let currentCol = 0; currentCol < COLS; currentCol++) {
          const lastRowCellId = getCellId(ROWS - 1, currentCol);
          delete newCellData[lastRowCellId];
        }
        
        // If the selected cell was in the deleted row, update selection
        if (selectedCell && getCellCoords(selectedCell).row === row) {
          onCellSelect(null);
        }
        break;
      }
      
      case 'deleteColumn': {
        // Move all columns to the right left by one
        for (let currentCol = col; currentCol < COLS - 1; currentCol++) {
          for (let currentRow = 0; currentRow < ROWS; currentRow++) {
            const nextColCellId = getCellId(currentRow, currentCol + 1);
            const currentCellId = getCellId(currentRow, currentCol);
            
            if (cellData[nextColCellId]) {
              newCellData[currentCellId] = { ...cellData[nextColCellId] };
            } else {
              delete newCellData[currentCellId];
            }
          }
        }
        
        // Clear the last column
        for (let currentRow = 0; currentRow < ROWS; currentRow++) {
          const lastColCellId = getCellId(currentRow, COLS - 1);
          delete newCellData[lastColCellId];
        }
        
        // If the selected cell was in the deleted column, update selection
        if (selectedCell && getCellCoords(selectedCell).col === col) {
          onCellSelect(null);
        }
        break;
      }

      case 'deleteDuplicates': {
        const uniqueColumns = [...new Set(selectedRange.map(cellId => 
          cellId.match(/[A-Z]+/)[0]
        ))].sort();
        setSelectedColumns(uniqueColumns);
        setShowDeleteDuplicatesModal(true);
        setContextMenu(null);
        break;
      }
    }
    
    if (action !== 'dataValidation' && action !== 'deleteDuplicates') {
      onGridChange(newCellData);
    }
  }, [contextCell, cellData, onGridChange, onContextMenuAction]);

  const handleResizeStart = useCallback((type, index, e) => {
    e.preventDefault();
    const startPos = type === 'column' ? e.clientX : e.clientY;
    const startSize = type === 'column' ? 
      getColumnWidth(index) : getRowHeight(index);
    
    setResizing({ type, index, startPos, startSize });
  }, []);

  const handleResize = useCallback((e) => {
    if (!resizing) return;
    
    const { type, index, startPos, startSize } = resizing;
    const currentPos = type === 'column' ? e.clientX : e.clientY;
    const diff = currentPos - startPos;
    
    if (type === 'column') {
      setColumnWidths(prev => ({
        ...prev,
        [index]: Math.max(50, startSize + diff)
      }));
    } else {
      setRowHeights(prev => ({
        ...prev,
        [index]: Math.max(20, startSize + diff)
      }));
    }
  }, [resizing]);

  const handleResizeEnd = useCallback(() => {
    setResizing(null);
  }, []);

  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing, handleResize, handleResizeEnd]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, handleDragEnd]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
      setContextCell(null);
    };
    
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Helper to evaluate formula
  const evaluateFormula = useCallback((formula) => {
    try {
      // Match both patterns: FUNCTION(START,END) and FUNCTION(CELL)
      const match = formula.match(/^=(\w+)\(([A-Z]+\d+)(?:,([A-Z]+\d+))?\)$/);
      if (!match) return formula;

      const [_, functionName, startCell, endCell] = match;
      const fn = spreadsheetFunctions[functionName];

      if (!fn) return '#ERROR!';
      
      // Get result from function
      let result;
      // Text functions only need one cell reference
      if (['TRIM', 'UPPER', 'LOWER', 'PROPER'].includes(functionName)) {
        result = fn(startCell, null, cellData, evaluateFormula);
      } else {
        // Math functions need both cell references
        if (!endCell) return '#ERROR!';
        result = fn(startCell, endCell, cellData, evaluateFormula);
      }
      
      // Convert result to string to ensure consistent handling
      return result !== undefined ? result.toString() : '#ERROR!';
      
    } catch (error) {
      return '#ERROR!';
    }
  }, [cellData]);

  return (
    <div className="flex-1 overflow-auto relative">
      <div className="inline-block min-w-full">
        {/* Header Row */}
        <div className="flex sticky top-0 z-10">
          <div className="w-[40px] h-[24px] bg-gray-50 border-b border-r border-gray-300 
                       flex items-center justify-center relative" />
          {Array.from({ length: COLS }).map((_, col) => (
            <div 
              key={col} 
              className="bg-gray-50 border-b border-r border-gray-300 
                       flex items-center justify-center text-sm font-medium text-gray-700
                       relative"
              style={{ 
                width: `${getColumnWidth(col)}px`,
                height: '24px'
              }}
            >
              {String.fromCharCode(65 + col)}
              <ResizeHandle
                type="column"
                onMouseDown={(e) => handleResizeStart('column', col, e)}
              />
            </div>
          ))}
        </div>

        {/* Grid Rows */}
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="flex relative">
            <div 
              className="bg-gray-50 border-b border-r border-gray-300 
                       sticky left-0 flex items-center justify-center 
                       text-sm font-medium text-gray-700 relative"
              style={{ 
                width: '40px',
                height: `${getRowHeight(row)}px`
              }}
            >
              {row + 1}
              <ResizeHandle
                type="row"
                onMouseDown={(e) => handleResizeStart('row', row, e)}
              />
            </div>
            {Array.from({ length: COLS }).map((_, col) => {
              const cellId = getCellId(row, col);
              const rawValue = cellData[cellId]?.value || '';
              const displayValue = rawValue.startsWith('=') ? 
                evaluateFormula(rawValue) : 
                rawValue;
              
              return (
                <Cell
                  key={cellId}
                  id={cellId}
                  value={rawValue}
                  displayValue={displayValue}
                  format={cellData[cellId]?.format}
                  isSelected={selectedCell === cellId}
                  isInRange={selectedRange?.includes(cellId)}
                  onSelect={() => handleCellClick(cellId)}
                  onChange={(value) => onCellChange(cellId, value)}
                  onDragStart={() => handleDragStart(cellId)}
                  onDragEnter={() => handleDragEnter(cellId)}
                  onContextMenu={(e) => handleContextMenu(e, cellId)}
                  width={getColumnWidth(col)}
                  height={getRowHeight(row)}
                  dataType={cellValidations[cellId] || 'text'}
                />
              );
            })}
          </div>
        ))}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => {
            setContextMenu(null);
            setContextCell(null);
          }}
          onAction={handleContextAction}
          hasSelection={true}
        />
      )}
      {showDeleteDuplicatesModal && (
        <DeleteDuplicatesModal
          columns={selectedColumns}
          cellData={cellData}
          onConfirm={handleDeleteDuplicates}
          onClose={() => setShowDeleteDuplicatesModal(false)}
        />
      )}
    </div>
  );
}

export default Grid; 