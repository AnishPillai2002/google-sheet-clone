import React from 'react';

function ContextMenu({ x, y, onClose, onAction }) {
  const menuItems = [
    { id: 'insertRowBelow', label: 'Insert row below' },
    { id: 'insertColumnRight', label: 'Insert column right' },
    { id: 'deleteRow', label: 'Delete row' },
    { id: 'deleteColumn', label: 'Delete column' }
  ];

  return (
    <div 
      className="fixed bg-white shadow-lg rounded-md py-1 border border-gray-200 z-50"
      style={{ top: y, left: x }}
    >
      {menuItems.map(item => (
        <div
          key={item.id}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => {
            onAction(item.id);
            onClose();
          }}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default ContextMenu; 