import React, { useState, useRef, useEffect } from 'react';

function FileMenu({ onSave, onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    { id: 'save', label: 'Save', icon: '💾', action: onSave },
    { id: 'open', label: 'Open', icon: '📂', action: onOpen }
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        className={`px-3 py-1 text-sm hover:bg-gray-100 rounded
                   ${isOpen ? 'bg-gray-100' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        File
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 
                      rounded-md shadow-lg z-50 min-w-[160px] py-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 
                       hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
            >
              <span className="w-5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileMenu; 