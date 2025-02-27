import React from 'react';
import { FUNCTION_DESCRIPTIONS } from '../utils/spreadsheetFunctions';

const FUNCTION_SYNTAX = {
  SUM: '=SUM(A1,B1)',
  AVERAGE: '=AVERAGE(A1,B1)',
  MAX: '=MAX(A1,B1)',
  MIN: '=MIN(A1,B1)',
  COUNT: '=COUNT(A1,B1)',
  TRIM: '=TRIM(A1)',
  UPPER: '=UPPER(A1)',
  LOWER: '=LOWER(A1)',
  PROPER: '=PROPER(A1)'
};

function FunctionSuggestions({ query, onSelect, position, selectedIndex = 0 }) {
  // Remove the '=' from query if it exists
  const cleanQuery = query.startsWith('=') ? query.slice(1) : query;

  const suggestions = Object.keys(FUNCTION_DESCRIPTIONS)
    .filter(fn => fn.toLowerCase().startsWith(cleanQuery.toLowerCase()))
    .slice(0, 5);

  if (!query.startsWith('=')) return null;

  // Calculate position to show suggestions below the cell
  const top = position.top + position.height;
  // If suggestions would go off screen to the right, align to right edge of cell
  const left = Math.min(
    position.left,
    window.innerWidth - 300 // 300px is the width of suggestion box
  );

  return (
    <div 
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 z-50 w-[300px]"
      style={{ 
        top: `${top}px`,
        left: `${left}px`,
        maxHeight: '200px',
        overflowY: 'auto'
      }}
    >
      {suggestions.map((fn, index) => (
        <div
          key={fn}
          className={`px-3 py-2 cursor-pointer
            ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
          `}
          onClick={() => onSelect(`=${fn}`)}
        >
          <div className="flex items-baseline justify-between">
            <span className="font-medium text-gray-800">{fn}</span>
            <span className="text-xs text-gray-400 font-mono">{FUNCTION_SYNTAX[fn]}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">{FUNCTION_DESCRIPTIONS[fn]}</div>
        </div>
      ))}
      {suggestions.length === 0 && (
        <div className="px-3 py-1.5 text-gray-400 italic text-sm">
          No matching functions
        </div>
      )}
    </div>
  );
}

export default FunctionSuggestions; 