import React from 'react';
import { FUNCTION_DESCRIPTIONS } from '../utils/spreadsheetFunctions';

function FunctionSuggestions({ query, onSelect, position, selectedIndex = 0 }) {
  // Remove the '=' from query if it exists
  const cleanQuery = query.startsWith('=') ? query.slice(1) : query;

  const suggestions = Object.keys(FUNCTION_DESCRIPTIONS)
    .filter(fn => fn.toLowerCase().startsWith(cleanQuery.toLowerCase()))
    .slice(0, 5);

  if (!query.startsWith('=')) return null;

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md border border-gray-200 z-50 w-[200px]"
      style={{ 
        top: position.top + 24, // Below the cell
        left: position.left 
      }}
    >
      {suggestions.map((fn, index) => (
        <div
          key={fn}
          className={`px-3 py-2 cursor-pointer flex flex-col
            ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
          `}
          onClick={() => onSelect(`=${fn}`)}
        >
          <div className="font-medium text-gray-800">{fn}</div>
          <div className="text-xs text-gray-500">{FUNCTION_DESCRIPTIONS[fn]}</div>
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