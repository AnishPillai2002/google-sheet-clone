import React, { useState } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';
import FindReplaceModal from './FindReplaceModal';

function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellData, setCellData] = useState({});
  const [formulaValue, setFormulaValue] = useState('');
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);

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

  return (
    <div className="flex flex-col h-full">
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
      />
      {showFindReplace && (
        <FindReplaceModal
          onClose={() => setShowFindReplace(false)}
          onReplace={handleReplace}
          selectedRange={selectedRange || [selectedCell]}
        />
      )}
    </div>
  );
}

export default Spreadsheet; 