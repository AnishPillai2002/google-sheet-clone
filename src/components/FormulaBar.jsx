import React from 'react';

function FormulaBar({ selectedCell, value, onChange }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b bg-white">
      <div className="text-gray-600 font-medium min-w-[20px]">
        {selectedCell || ''}
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="formula-input"
          placeholder="Enter formula or value"
        />
      </div>
    </div>
  );
}

export default FormulaBar; 