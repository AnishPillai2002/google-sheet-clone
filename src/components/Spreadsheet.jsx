import React, { useState, useCallback } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import FindReplaceModal from './FindReplaceModal';
import Cell from './Cell';
import ContextMenu from './ContextMenu';
import DataValidationModal from './DataValidationModal';

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

  return (
    <div className="flex flex-col h-full relative">
      <Toolbar 
        onFormatChange={handleFormatChange}
        selectedCell={selectedCell}
        cellFormat={cellData[selectedCell]?.format}
        onFindReplace={() => setShowFindReplace(true)}
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