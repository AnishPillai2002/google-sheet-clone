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
  format = {},
  dataType = 'text'
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState(null);
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

  // Validate input based on data type
  const validateInput = (inputValue) => {
    // Always allow empty values and formulas
    if (!inputValue || inputValue === '' || inputValue.startsWith('=')) {
      return true;
    }

    switch (dataType) {
      case 'number':
        const num = Number(inputValue);
        return !isNaN(num) && Number.isFinite(num);
      case 'date':
        const date = new Date(inputValue);
        return !isNaN(date.getTime());
      case 'text':
        return true;
      default:
        return true;
    }
  };

  const getValidationErrorMessage = () => {
    if (!validateInput(value)) {
      switch (dataType) {
        case 'number':
          return 'Please enter a valid number';
        case 'date':
          return 'Please enter a valid date (YYYY-MM-DD)';
        default:
          return null;
      }
    }
    return null;
  };

  // Update validation state when value or dataType changes
  useEffect(() => {
    if (value && !validateInput(value)) {
      setValidationError(getValidationErrorMessage());
    } else {
      setValidationError(null);
    }
  }, [value, dataType]);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  const handleClick = () => {
    onSelect();
    setIsEditing(true);
    // Don't reset the editValue here, keep the existing value
  };

  const handleBlur = () => {
    setIsEditing(false);
    setShowSuggestions(false);
    
    if (editValue !== value) {
      if (validateInput(editValue)) {
        onChange(editValue);
        setValidationError(null);
      } else {
        setValidationError(getValidationErrorMessage());
        setEditValue(value || ''); // Revert to previous valid value
      }
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    // Show formula suggestions
    if (newValue.startsWith('=')) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      // Validate input as user types
      if (!validateInput(newValue)) {
        setValidationError(getValidationErrorMessage());
      } else {
        setValidationError(null);
      }
    }
  };

  // Format display value based on data type
  const getFormattedValue = (val) => {
    if (!val || val.startsWith('=')) return val;
    
    switch (dataType) {
      case 'date':
        try {
          const date = new Date(val);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {}
        return val;
      case 'number':
        const num = Number(val);
        if (!isNaN(num)) {
          return num.toString();
        }
        return val;
      default:
        return val;
    }
  };

  // Check if current value matches data type
  const hasDataTypeMismatch = () => {
    return value && !validateInput(value);
  };

  // Get text color based on validation
  const getTextColor = () => {
    if (hasDataTypeMismatch()) {
      return '#dc2626'; // red-600
    }
    return color;
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
      onMouseDown={(e) => {
        if (e.button === 0) {
          setMouseDownTime(Date.now());
          onDragStart();
        }
      }}
      onMouseEnter={() => onDragEnter()}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowSuggestions(false);
        onContextMenu(e);
      }}
      draggable={false}
    >
      {/* Data type indicator - increased size */}
      {hasDataTypeMismatch() && (
        <div 
          className="absolute top-0 right-0 w-0 h-0 
                     border-t-[10px] border-t-red-500 
                     border-l-[10px] border-l-transparent z-10"
          title={`Expected ${dataType} type`}
        />
      )}

      {/* Main cell content */}
      {isEditing ? (
        <>
          <input
            ref={inputRef}
            type={dataType === 'date' ? 'date' : 'text'}
            value={editValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBlur();
                setShowSuggestions(false);
              }
              if (e.key === 'Escape') {
                setEditValue(value || '');
                setIsEditing(false);
                setValidationError(null);
                setShowSuggestions(false);
              }
            }}
            className="absolute inset-0 w-full h-full px-2 border-none outline-none bg-white text-left"
            style={{
              fontWeight: bold ? 'bold' : 'normal',
              fontStyle: italic ? 'italic' : 'normal',
              fontSize: `${fontSize}px`,
              color: getTextColor()
            }}
            autoComplete="off"
          />
          {showSuggestions && (
            <FunctionSuggestions
              query={editValue}
              onSelect={(suggestion) => {
                setEditValue(suggestion);
                setShowSuggestions(false);
              }}
              selectedIndex={selectedSuggestionIndex}
              position={{
                top: cellRef.current?.getBoundingClientRect().top || 0,
                left: cellRef.current?.getBoundingClientRect().left || 0,
                height,
                width
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
            color: getTextColor()
          }}
        >
          {getFormattedValue(displayValue || value) || ''}
        </div>
      )}

      {/* Error message bubble - with increased width */}
      {isSelected && validationError && (
        <div 
          className="absolute left-full top-0 ml-2
                     bg-white border border-gray-200 shadow-sm
                     rounded-md z-50 flex items-stretch"
          style={{
            height: `${Math.max(height + 10, 32)}px`, // Minimum height of 32px
            width: '250px', // Increased fixed width
            padding: '2px 0',
          }}
        >
          {/* Red indicator bar */}
          <div className="w-1.5 bg-red-500 rounded-l-md flex-shrink-0" />
          
          {/* Error message container */}
          <div className="flex-1 flex items-center px-3 min-w-0">
            {/* Error icon */}
            <svg 
              className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            {/* Error text - removed truncate to show full text */}
            <span className="text-sm text-gray-700 break-normal">
              {validationError}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cell; 