import React from 'react';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

function Toolbar({ onFormatChange, selectedCell, cellFormat = {} }) {
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
    <div className="flex items-center gap-2 p-2 border-b bg-white">
      {/* File Menu */}
      <div className="flex items-center gap-1 px-2 hover:bg-gray-100 rounded cursor-pointer">
        <DocumentTextIcon className="w-4 h-4" />
        <span className="text-sm">File</span>
        <ChevronDownIcon className="w-4 h-4" />
      </div>

      {/* Format Options */}
      <div className="flex items-center gap-1 border-l pl-2">
        <button 
          className={`p-1.5 rounded hover:bg-gray-100 cursor-pointer
            ${bold ? 'bg-gray-200' : ''}`}
          onClick={() => onFormatChange({ bold: !bold })}
        >
          <span className="font-bold text-sm">B</span>
        </button>
        <button 
          className={`p-1.5 rounded hover:bg-gray-100 cursor-pointer
            ${italic ? 'bg-gray-200' : ''}`}
          onClick={() => onFormatChange({ italic: !italic })}
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
          className="px-2 py-1 border rounded text-sm"
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
          className="w-6 h-6 p-0 border rounded cursor-pointer"
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
    </div>
  );
}

export default Toolbar; 