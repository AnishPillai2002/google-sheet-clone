import React, { useState } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';

function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellValues, setCellValues] = useState({});
  const [formulaValue, setFormulaValue] = useState('');

  const handleCellSelect = (cellId) => {
    setSelectedCell(cellId);
    setFormulaValue(cellValues[cellId]?.value || '');
  };

  const handleFormulaChange = (value) => {
    setFormulaValue(value);
    if (selectedCell) {
      setCellValues(prev => ({
        ...prev,
        [selectedCell]: { value, formula: value.startsWith('=') ? value : '' }
      }));
    }
  };

  const handleFormatChange = (format) => {
    if (selectedCell) {
      setCellValues(prev => ({
        ...prev,
        [selectedCell]: {
          ...prev[selectedCell],
          format: { ...(prev[selectedCell]?.format || {}), ...format }
        }
      }));
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Toolbar onFormatChange={handleFormatChange} />
      <FormulaBar 
        selectedCell={selectedCell}
        value={formulaValue}
        onChange={handleFormulaChange}
      />
      <Grid 
        selectedCell={selectedCell}
        cellData={cellValues}
        onCellSelect={handleCellSelect}
        onCellChange={(cellId, value) => {
          setCellValues(prev => ({
            ...prev,
            [cellId]: { value, formula: value.startsWith('=') ? value : '' }
          }));
          if (cellId === selectedCell) {
            setFormulaValue(value);
          }
        }}
      />
    </div>
  );
}

export default Spreadsheet; 