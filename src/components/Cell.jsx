import React, { useState, useRef, useEffect } from 'react';

function Cell({ 
  id, 
  value, 
  isSelected, 
  isInRange,
  onSelect, 
  onChange,
  onDragStart,
  onDragEnter,
  onContextMenu,
  width,
  height,
  format = {}
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  const {
    bold = false,
    italic = false,
    fontSize = 14,
    color = '#000000'
  } = format;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onChange(id, editValue);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      onDragStart();
    }
  };

  return (
    <div
      className={`border-b border-r border-gray-300 relative
        ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
        ${isInRange ? 'bg-blue-50 ring-1 ring-blue-400' : ''}
        ${isEditing ? 'z-20' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={onDragEnter}
      onContextMenu={onContextMenu}
      draggable={false}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full px-2 border-none outline-none bg-white"
          style={{
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: `${fontSize}px`,
            color
          }}
        />
      ) : (
        <div 
          className="w-full h-full px-2 overflow-hidden whitespace-nowrap"
          style={{
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: `${fontSize}px`,
            color
          }}
        >
          {value}
        </div>
      )}
    </div>
  );
}

export default Cell; 