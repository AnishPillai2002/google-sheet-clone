import React, { useState } from 'react';
import PropTypes from 'prop-types';

function DeleteDuplicatesModal({ columns, cellData, onConfirm, onClose }) {
  const [selectedColumns, setSelectedColumns] = useState([]);

  // Get count of duplicate rows based on selected columns
  const getDuplicateCount = () => {
    if (selectedColumns.length === 0) return 0;

    // Get all row numbers from the selected columns
    const rowNumbers = new Set();
    selectedColumns.forEach(col => {
      Object.keys(cellData)
        .filter(cellId => cellId.startsWith(col))
        .forEach(cellId => {
          const rowNum = parseInt(cellId.match(/\d+/)[0]);
          rowNumbers.add(rowNum);
        });
    });

    // Create a map of row values and their counts
    const valueMap = new Map();
    [...rowNumbers].forEach(rowNum => {
      const rowValues = selectedColumns.map(col => {
        const cellId = `${col}${rowNum}`;
        return cellData[cellId]?.value || '';
      }).join('|');

      valueMap.set(rowValues, (valueMap.get(rowValues) || 0) + 1);
    });

    // Count rows that appear more than once
    let duplicateCount = 0;
    valueMap.forEach(count => {
      if (count > 1) {
        duplicateCount += count - 1; // Subtract 1 to count only the duplicates
      }
    });

    return duplicateCount;
  };

  // Convert column letter to number (A -> 1, B -> 2, etc.)
  const getColumnNumber = (columnLetter) => {
    return columnLetter.charCodeAt(0) - 64; // A = 65 in ASCII
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col border-2 border-emerald-500">
        <div className="p-4 border-b border-emerald-100 bg-emerald-50">
          <h2 className="text-lg font-semibold">Delete Duplicate Rows</h2>
          <p className="text-sm text-gray-500 mt-1">
            Select columns to check for duplicates
          </p>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            {columns.map((column) => (
              <label 
                key={column} 
                className={`
                  flex items-center p-3 rounded-lg border cursor-pointer
                  ${selectedColumns.includes(column) 
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' 
                    : 'border-gray-200 hover:bg-gray-50'
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  className="mr-3 accent-emerald-500 h-4 w-4"
                />
                <span className="font-medium">Column {getColumnNumber(column)}</span>
              </label>
            ))}
          </div>

          {selectedColumns.length > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-700">
                <span className="font-semibold">{getDuplicateCount()}</span> duplicate rows found
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-emerald-100 bg-emerald-50 rounded-b-lg">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-emerald-100 rounded-md border border-emerald-200"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(selectedColumns)}
              disabled={selectedColumns.length === 0}
              className={`px-4 py-2 rounded-md ${
                selectedColumns.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              Delete {getDuplicateCount()} Rows
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

DeleteDuplicatesModal.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  cellData: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default DeleteDuplicatesModal; 