import React from 'react';

function ContextMenu({ x, y, onClose, onAction, hasSelection }) {
  const menuItems = [
    { id: 'dataValidation', label: 'Data Validation', icon: '✓' },
    { id: 'insertRowBelow', label: 'Insert row below', icon: '+' },
    { id: 'insertColumnRight', label: 'Insert column right', icon: '+' },
    { id: 'deleteRow', label: 'Delete row', icon: '-' },
    { id: 'deleteColumn', label: 'Delete column', icon: '-' }
  ];

  return (
    <>
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div 
        className="fixed bg-white shadow-lg rounded-md py-1 border border-gray-200 z-50"
        style={{ top: y, left: x }}
      >
        {menuItems.map(item => (
          <div
            key={item.id}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
            onClick={() => {
              onAction(item.id);
              onClose();
            }}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </div>
        ))}
        
        {hasSelection && (
          <div
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-t border-gray-200"
            onClick={() => {
              onAction('deleteDuplicates');
              onClose();
            }}
          >
            Delete Duplicate Rows
          </div>
        )}
      </div>
    </>
  );
}

export default ContextMenu; 