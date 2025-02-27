import React, { useState } from 'react';

const DATA_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date'
};

function DataValidationModal({ isOpen, onClose, onApply, currentType = DATA_TYPES.TEXT }) {
  const [selectedType, setSelectedType] = useState(currentType);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-96">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Validation</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allow only:
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={DATA_TYPES.TEXT}>Any text</option>
              <option value={DATA_TYPES.NUMBER}>Numbers only</option>
              <option value={DATA_TYPES.DATE}>Date values</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApply(selectedType);
                onClose();
              }}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DataValidationModal; 