import React from 'react';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import FileMenu from './FileMenu';

function Toolbar({ 
  onFormatChange, 
  selectedCell, 
  cellFormat = {}, 
  onFindReplace,
  onSave,
  onOpen,
  disabled = false
}) {
  const {
    bold = false,
    italic = false,
    fontSize = 14,
    color = '#000000'
  } = cellFormat;

  const handleFontSizeChange = (e) => {
    onFormatChange({ fontSize: parseInt(e.target.value) });
  };

  const handleColorChange = (e) => {
    onFormatChange({ color: e.target.value });
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-300 bg-white">
      {/* File Menu */}
      <div className="border-r border-gray-300 pr-2">
        <FileMenu onSave={onSave} onOpen={onOpen} />
      </div>

      {/* Format Options */}
      <div className="flex items-center gap-1 border-l pl-2">
        <button 
          className={`p-1.5 rounded hover:bg-gray-100 cursor-pointer
            ${bold ? 'bg-gray-200' : ''}`}
          onClick={() => onFormatChange({ bold: !bold })}
          disabled={disabled}
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button 
          className={`p-1.5 rounded hover:bg-gray-100 cursor-pointer
            ${italic ? 'bg-gray-200' : ''}`}
          onClick={() => onFormatChange({ italic: !italic })}
          disabled={disabled}
        >
          <span className="italic text-sm">I</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="underline text-sm">U</span>
        </button>

        {/* Font Size */}
        <select
          value={fontSize}
          onChange={handleFontSizeChange}
          className={`px-2 py-1 border rounded text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          {[8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        {/* Color Picker */}
        <input
          type="color"
          value={color}
          onChange={handleColorChange}
          className={`w-6 h-6 p-0 border rounded cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        />
      </div>

      {/* Alignment Options */}
      <div className="flex items-center gap-1 border-l pl-2">
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="text-sm">⫷</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="text-sm">≣</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="text-sm">⫸</span>
        </button>
      </div>

      {/* Find and Replace Button */}
      <button
        onClick={onFindReplace}
        disabled={disabled}
        className={`px-3 py-1 rounded ${
          disabled ? 'bg-gray-100 text-gray-400' : 'hover:bg-gray-100'
        }`}
        title="Find and Replace"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

export default Toolbar; 