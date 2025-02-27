import React, { useState } from 'react';
import Toolbar from './Toolbar';
import FormulaBar from './FormulaBar';
import Grid from './Grid';

function Spreadsheet() {
  const [selectedCell, setSelectedCell] = useState(null);
  const [cellData, setCellData] = useState({});
  const [formulaValue, setFormulaValue] = useState('');

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

  return (
    <div className="flex flex-col h-full">
      <Toolbar 
        onFormatChange={handleFormatChange}
        selectedCell={selectedCell}
        cellFormat={cellData[selectedCell]?.format}
      />
      <FormulaBar 
        selectedCell={selectedCell}
        value={formulaValue}
        onChange={handleFormulaChange}
      />
      <Grid 
        selectedCell={selectedCell}
        cellData={cellData}
        onCellSelect={handleCellSelect}
        onCellChange={(cellId, value) => {
          setCellData(prev => ({
            ...prev,
            [cellId]: {
              ...prev[cellId],
              value,
              formula: value.startsWith('=') ? value : '',
              format: prev[cellId]?.format || {}
            }
          }));
          if (cellId === selectedCell) {
            setFormulaValue(value);
          }
        }}
        onGridChange={handleGridChange}
      />
    </div>
  );
}

export default Spreadsheet; 