import React, { useState, useCallback } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import FindReplaceModal from './FindReplaceModal';
import Cell from './Cell';
import ContextMenu from './ContextMenu';
import DataValidationModal from './DataValidationModal';
import * as XLSX from 'xlsx';

function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellData, setCellData] = useState({});
  const [formulaValue, setFormulaValue] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [showDataValidationModal, setShowDataValidationModal] = useState(false);
  const [cellValidations, setCellValidations] = useState({});

  const handleCellSelect = (cellId) => {
    setSelectedCell(cellId);
    setFormulaValue(cellData[cellId]?.value || '');
  };

  const handleFormatChange = (format) => {
    if (selectedCell) {
      setCellData(prev => ({
        ...prev,
        [selectedCell]: {
          ...prev[selectedCell],
          format: {
            ...(prev[selectedCell]?.format || {}),
            ...format
          }
        }
      }));
    }
  };

  const handleFormulaChange = (value) => {
    setFormulaValue(value);
    if (selectedCell) {
      setCellData(prev => ({
        ...prev,
        [selectedCell]: {
          ...prev[selectedCell],
          value,
          formula: value.startsWith('=') ? value : '',
          format: prev[selectedCell]?.format || {}
        }
      }));
    }
  };

  const handleGridChange = (newCellData) => {
    setCellData(newCellData);
  };

  const handleCellChange = (cellId, value) => {
    setCellData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value,
        format: prev[cellId]?.format || {}
      }
    }));
    if (cellId === selectedCell) {
      setFormulaValue(value);
    }
  };

  const handleReplace = (cellId, findText, replaceText, matchCase) => {
    const cellValue = cellData[cellId]?.value || '';
    let newValue = cellValue;
    
    if (matchCase) {
      newValue = cellValue.replaceAll(findText, replaceText);
    } else {
      const regex = new RegExp(findText, 'gi');
      newValue = cellValue.replace(regex, replaceText);
    }
    
    if (newValue !== cellValue) {
      handleCellChange(cellId, newValue);
    }
  };

  const handleContextMenu = (e, cellId) => {
    e.preventDefault();
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      cellId
    });
  };

  const handleContextMenuAction = useCallback((action) => {
    if (action === 'dataValidation') {
      setShowDataValidationModal(true);
    }
  }, []);

  const handleDataValidationApply = (dataType) => {
    const cellsToValidate = selectedRange ? [...selectedRange] : selectedCell ? [selectedCell] : [];
    
    if (cellsToValidate.length > 0) {
      const newValidations = { ...cellValidations };
      
      cellsToValidate.forEach(cellId => {
        if (cellId) {
          newValidations[cellId] = dataType;
        }
      });
      
      setCellValidations(newValidations);
    }
    
    setShowDataValidationModal(false);
  };

  const handleSave = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert cell data to array format for xlsx
    const sheetData = [];
    let maxRow = 0;
    let maxCol = 0;
    
    // Find the dimensions of the sheet
    Object.keys(cellData).forEach(cellId => {
      const [col, row] = cellId.match(/([A-Z]+)(\d+)/).slice(1);
      const colNum = XLSX.utils.decode_col(col);
      const rowNum = parseInt(row) - 1;
      maxRow = Math.max(maxRow, rowNum);
      maxCol = Math.max(maxCol, colNum);
    });
    
    // Initialize the sheet with empty cells
    for (let i = 0; i <= maxRow; i++) {
      sheetData[i] = new Array(maxCol + 1).fill('');
    }
    
    // Fill in the data
    Object.entries(cellData).forEach(([cellId, cell]) => {
      const [col, row] = cellId.match(/([A-Z]+)(\d+)/).slice(1);
      const colNum = XLSX.utils.decode_col(col);
      const rowNum = parseInt(row) - 1;
      
      // Use display value if available, otherwise use the raw value
      sheetData[rowNum][colNum] = cell.displayValue || cell.value || '';
    });
    
    // Create worksheet from data
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    
    // Add style information
    ws['!cols'] = Array(maxCol + 1).fill({ wch: 10 }); // Default column width
    
    // Add formatting information
    Object.entries(cellData).forEach(([cellId, cell]) => {
      const [col, row] = cellId.match(/([A-Z]+)(\d+)/).slice(1);
      if (cell.format) {
        const addr = XLSX.utils.encode_cell({ c: XLSX.utils.decode_col(col), r: parseInt(row) - 1 });
        if (!ws[addr]) ws[addr] = { v: '' };
        ws[addr].s = {
          font: {
            bold: cell.format.bold,
            italic: cell.format.italic,
            sz: cell.format.fontSize,
            color: { rgb: cell.format.color?.replace('#', '') }
          }
        };
      }
    });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Generate the Excel file
    XLSX.writeFile(wb, 'spreadsheet.xlsx');
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert the worksheet to an array of arrays
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            // Convert the array data back to our cell format
            const newCellData = {};
            const newCellValidations = {};
            
            sheetData.forEach((row, rowIndex) => {
              row.forEach((cellValue, colIndex) => {
                if (cellValue !== null && cellValue !== undefined) {
                  const cellId = `${XLSX.utils.encode_col(colIndex)}${rowIndex + 1}`;
                  
                  // Get cell style information
                  const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                  const cell = worksheet[cellRef];
                  const cellStyle = cell?.s || {};
                  
                  // Create cell format object
                  const format = {
                    bold: cellStyle.font?.bold || false,
                    italic: cellStyle.font?.italic || false,
                    fontSize: cellStyle.font?.sz || 14,
                    color: cellStyle.font?.color?.rgb ? `#${cellStyle.font.color.rgb}` : '#000000'
                  };
                  
                  // Determine data type
                  let dataType = 'text';
                  if (typeof cellValue === 'number') dataType = 'number';
                  else if (cellValue instanceof Date) dataType = 'date';
                  
                  // Store cell data
                  newCellData[cellId] = {
                    value: cellValue.toString(),
                    format,
                    displayValue: cellValue.toString()
                  };
                  
                  // Store cell validation
                  newCellValidations[cellId] = dataType;
                }
              });
            });
            
            setCellData(newCellData);
            setCellValidations(newCellValidations);
          } catch (error) {
            console.error('Error reading Excel file:', error);
            alert('Error reading Excel file. Please make sure it\'s a valid Excel file.');
          }
        };
        reader.readAsArrayBuffer(file);
      }
    };
    
    input.click();
  };

  return (
    <div className="flex flex-col h-full relative">
      <Toolbar 
        onFormatChange={handleFormatChange}
        selectedCell={selectedCell}
        cellFormat={cellData[selectedCell]?.format}
        onFindReplace={() => setShowFindReplace(true)}
        onSave={handleSave}
        onOpen={handleOpen}
        disabled={!selectedCell}
      />
      <FormulaBar 
        selectedCell={selectedCell}
        value={formulaValue}
        onChange={handleFormulaChange}
        disabled={!selectedCell}
      />
      <Grid 
        selectedCell={selectedCell}
        cellData={cellData}
        onCellSelect={handleCellSelect}
        onCellChange={handleCellChange}
        onGridChange={handleGridChange}
        onRangeSelect={setSelectedRange}
        cellValidations={cellValidations}
        onContextMenuAction={handleContextMenuAction}
      />
      {showFindReplace && (
        <FindReplaceModal
          onClose={() => setShowFindReplace(false)}
          onReplace={handleReplace}
          selectedRange={selectedRange || [selectedCell]}
        />
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
          hasSelection={true}
        />
      )}
      {showDataValidationModal && (
        <DataValidationModal
          isOpen={true}
          onClose={() => setShowDataValidationModal(false)}
          onApply={handleDataValidationApply}
          currentType={selectedCell ? cellValidations[selectedCell] || 'text' : 'text'}
        />
      )}
    </div>
  );
}

export default Spreadsheet; 