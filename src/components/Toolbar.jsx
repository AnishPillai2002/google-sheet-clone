import React from 'react';
import {
  ChevronDownIcon,
  DocumentTextIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

function Toolbar({ onFormatChange }) {
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
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="font-bold text-sm">B</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="italic text-sm">I</span>
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100 cursor-pointer">
          <span className="underline text-sm">U</span>
        </button>
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