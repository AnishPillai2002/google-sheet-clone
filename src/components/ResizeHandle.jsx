import React from 'react';

function ResizeHandle({ type, onMouseDown }) {
  return (
    <div
      className={`absolute bg-transparent hover:bg-blue-500 z-20
        ${type === 'column' ? 
          'cursor-col-resize w-1 h-full right-0 top-0' : 
          'cursor-row-resize h-1 w-full bottom-0 left-0'
        }`}
      onMouseDown={onMouseDown}
    />
  );
}

export default ResizeHandle; 