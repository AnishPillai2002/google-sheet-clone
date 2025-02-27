import React, { useState, useRef, useEffect } from 'react';
import FunctionSuggestions from './FunctionSuggestions';
import { FUNCTION_DESCRIPTIONS } from '../utils/spreadsheetFunctions';

function Cell({ 
  id, 
  value, 
  displayValue,
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const cellRef = useRef(null);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

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
      inputRef.current.setSelectionRange(
        editValue.length,
        editValue.length
      );
    }
  }, [isEditing, editValue]);

  const handleBlur = () => {
    setIsEditing(false);
    setShowSuggestions(false);
    if (editValue !== value) {
      onChange(editValue);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    if (newValue === '=' || newValue.match(/^=[A-Za-z]*$/)) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setEditValue(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
      const cursorPos = suggestion.length;
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsEditing(false);
    } else if (e.key === 'Enter') {
      if (showSuggestions) {
        const suggestions = Object.keys(FUNCTION_DESCRIPTIONS)
          .filter(fn => fn.toLowerCase().startsWith(editValue.slice(1).toLowerCase()))
          .slice(0, 5);
        if (suggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(`=${suggestions[selectedSuggestionIndex]}`);
          e.preventDefault();
        }
      } else {
        handleBlur();
      }
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      const firstSuggestion = Object.keys(FUNCTION_DESCRIPTIONS)[0];
      if (firstSuggestion) {
        handleSuggestionSelect(`=${firstSuggestion}`);
      }
    } else if (showSuggestions) {
      const suggestions = Object.keys(FUNCTION_DESCRIPTIONS)
        .filter(fn => fn.toLowerCase().startsWith(editValue.slice(1).toLowerCase()))
        .slice(0, 5);
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
      }
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setMouseDownTime(Date.now());
      onDragStart();
    }
  };

  const handleClick = (e) => {
    const clickDuration = Date.now() - mouseDownTime;
    
    // If it's a quick click (not a drag), start editing
    if (clickDuration < 200) {
      onSelect();
      setIsEditing(true);
    }
  };

  return (
    <div
      ref={cellRef}
      data-cell-id={id}
      className={`border-b border-r border-gray-300 relative
        ${isSelected ? 'ring-2 ring-blue-500 z-10' : ''}
        ${isInRange ? 'bg-blue-50 ring-1 ring-blue-400' : ''}
        ${isEditing ? 'z-20' : ''}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={onDragEnter}
      onContextMenu={onContextMenu}
      draggable={false}
    >
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="absolute inset-0 w-full h-full px-2 border-none outline-none bg-white text-left"
            style={{
              fontWeight: bold ? 'bold' : 'normal',
              fontStyle: italic ? 'italic' : 'normal',
              fontSize: `${fontSize}px`,
              color
            }}
          />
          {showSuggestions && (
            <FunctionSuggestions
              query={editValue}
              onSelect={handleSuggestionSelect}
              selectedIndex={selectedSuggestionIndex}
              position={{
                top: cellRef.current?.getBoundingClientRect().top || 0,
                left: cellRef.current?.getBoundingClientRect().left || 0,
                height: height,
                width: width
              }}
            />
          )}
        </>
      ) : (
        <div 
          className="w-full h-full px-2 overflow-hidden whitespace-nowrap text-left"
          style={{
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            fontSize: `${fontSize}px`,
            color
          }}
        >
          {displayValue}
        </div>
      )}
    </div>
  );
}

export default Cell; 