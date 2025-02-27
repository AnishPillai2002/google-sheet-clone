export const FUNCTION_DESCRIPTIONS = {
  SUM: 'Calculates the sum of a range of cells',
  AVERAGE: 'Calculates the average of a range of cells',
  MAX: 'Returns the maximum value from a range of cells',
  MIN: 'Returns the minimum value from a range of cells',
  COUNT: 'Counts the number of cells containing numerical values'
};

// Helper to get cell range from function parameters
const getCellRange = (startCell, endCell) => {
  const start = startCell.match(/([A-Z]+)(\d+)/);
  const end = endCell.match(/([A-Z]+)(\d+)/);
  
  const startCol = start[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
  const endCol = end[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);
  const startRow = parseInt(start[2]);
  const endRow = parseInt(end[2]);
  
  return {
    startCol: Math.min(startCol, endCol),
    endCol: Math.max(startCol, endCol),
    startRow: Math.min(startRow, endRow),
    endRow: Math.max(startRow, endRow)
  };
};

// Helper to get cell values from range
const getCellValues = (range, cellData, evaluateFormula) => {
  const values = [];
  for (let row = range.startRow; row <= range.endRow; row++) {
    for (let col = range.startCol; col <= range.endCol; col++) {
      const colLetter = String.fromCharCode(64 + col);
      const cellId = `${colLetter}${row}`;
      const value = cellData[cellId]?.value;
      
      // If the cell contains a formula, evaluate it
      if (value && value.startsWith('=')) {
        const evaluatedValue = evaluateFormula(value);
        if (!isNaN(parseFloat(evaluatedValue))) {
          values.push(parseFloat(evaluatedValue));
        }
      }
      // Otherwise handle as normal number
      else if (value !== undefined && value !== '' && !isNaN(parseFloat(value))) {
        values.push(parseFloat(value));
      }
    }
  }
  return values;
};

export const spreadsheetFunctions = {
  SUM: (startCell, endCell, cellData, evaluateFormula) => {
    const range = getCellRange(startCell, endCell);
    const values = getCellValues(range, cellData, evaluateFormula);
    return values.reduce((sum, val) => sum + val, 0);
  },
  
  AVERAGE: (startCell, endCell, cellData, evaluateFormula) => {
    const range = getCellRange(startCell, endCell);
    const values = getCellValues(range, cellData, evaluateFormula);
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  },
  
  MAX: (startCell, endCell, cellData, evaluateFormula) => {
    const range = getCellRange(startCell, endCell);
    const values = getCellValues(range, cellData, evaluateFormula);
    if (values.length === 0) return 0;
    return Math.max(...values);
  },
  
  MIN: (startCell, endCell, cellData, evaluateFormula) => {
    const range = getCellRange(startCell, endCell);
    const values = getCellValues(range, cellData, evaluateFormula);
    if (values.length === 0) return 0;
    return Math.min(...values);
  },
  
  COUNT: (startCell, endCell, cellData, evaluateFormula) => {
    const range = getCellRange(startCell, endCell);
    const values = getCellValues(range, cellData, evaluateFormula);
    return values.length;
  }
}; 