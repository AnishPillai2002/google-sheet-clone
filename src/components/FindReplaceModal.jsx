import React, { useState } from 'react';
import PropTypes from 'prop-types';

function FindReplaceModal({ onClose, onReplace, selectedRange }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFind = () => {
    if (!findText) return;
    
    const results = selectedRange.filter(cellId => {
      const cellValue = document.querySelector(`[data-cell-id="${cellId}"]`)?.querySelector('div')?.textContent || '';
      return matchCase 
        ? cellValue.includes(findText)
        : cellValue.toLowerCase().includes(findText.toLowerCase());
    });
    
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleReplace = () => {
    if (searchResults.length > 0) {
      searchResults.forEach(cellId => {
        onReplace(cellId, findText, replaceText, matchCase);
      });
      onClose(); // Close the modal after replacing
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Find and Replace</h2>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Find
            </label>
            <input
              type="text"
              value={findText}
              onChange={(e) => {
                setFindText(e.target.value);
                setHasSearched(false);
              }}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Text to find..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Replace with
            </label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Replacement text..."
              disabled={!hasSearched || searchResults.length === 0}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="matchCase"
              checked={matchCase}
              onChange={(e) => {
                setMatchCase(e.target.checked);
                setHasSearched(false);
              }}
              className="mr-2"
            />
            <label htmlFor="matchCase" className="text-sm text-gray-600">
              Match case
            </label>
          </div>

          {hasSearched && (
            <div className="text-sm text-gray-600">
              {searchResults.length > 0 
                ? `Found ${searchResults.length} matches` 
                : 'No matches found'}
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <div className="space-x-2">
            <button
              onClick={handleFind}
              disabled={!findText}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Find
            </button>
            <button
              onClick={handleReplace}
              disabled={!hasSearched || searchResults.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              Replace All
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

FindReplaceModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
  selectedRange: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default FindReplaceModal; 