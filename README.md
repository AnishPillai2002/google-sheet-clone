# React Spreadsheet Application

A modern Excel-like spreadsheet application built with React, featuring real-time formula evaluation, cell formatting, and data manipulation capabilities.

## 🌟 Core Features

### Cell Management
- Dynamic cell editing and formatting
- Formula support with auto-suggestions
- Range selection and drag operations
- Custom formatting (bold, italic, font size, color)

### Formula Functions
1. **Mathematical Functions**
   - `SUM(range)`: Calculate sum of cells
   - `AVERAGE(range)`: Calculate average
   - `MAX(range)`: Find maximum value
   - `MIN(range)`: Find minimum value
   - `COUNT(range)`: Count numeric cells

2. **Text Functions**
   - `TRIM(cell)`: Remove extra whitespace
   - `UPPER(cell)`: Convert to uppercase
   - `LOWER(cell)`: Convert to lowercase
   - `PROPER(cell)`: Convert to title case

### Data Operations
- Find and Replace with case sensitivity
- Delete duplicate rows based on column selection
- Row and column insertion/deletion
- Context menu for quick actions

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Cell.jsx                    # Individual cell component
│   ├── ContextMenu.jsx             # Right-click menu component
│   ├── DeleteDuplicatesModal.jsx   # Modal for handling 
│   ├── FindReplaceModal.jsx        # Modal for find and replace 
│   ├── FormulaBar.jsx             # Formula input and display 
│   ├── FunctionSuggestions.jsx     # Formula function 
│   ├── Grid.jsx                   # Main spreadsheet grid with 
│   ├── ResizeHandle.jsx           # Column/row resize handler
│   ├── Spreadsheet.jsx           # Root component managing 
│   └── Toolbar.jsx               # Formatting and operations 
├── utils/
│   └── spreadsheetFunctions.js    # Formula implementations and 
├── App.jsx                        # Root application component
├── index.css                      # Base styles and Tailwind 
└── main.jsx                       # Application entry point
```

## 💡 Technical Implementation

### Data Structure
The application uses several key data structures for efficient spreadsheet operations:

#### 1. Cell Data Storage
The core data structure is a flat object that maps cell IDs to their data:

```javascript
{
  "A1": {
    value: "Sample Text",
    format: {
      bold: false,
      italic: false,
      fontSize: 14,
      color: "#000000"
    }
  },
  "B1": {
    value: "=SUM(A1:A10)",
    format: { ... }
  }
}
```

**Why This Structure?**
- O(1) access time for any cell
- Memory efficient for sparse data
- Easy state management with React

#### 2. Range Selection
For operations involving multiple cells, we use array-based range representation:

```javascript
// Example: Selected range A1:B3
const selectedRange = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];

// Range calculation
const getCellRange = (startCell, endCell) => {
  const start = startCell.match(/([A-Z]+)(\d+)/);
  const end = endCell.match(/([A-Z]+)(\d+)/);
  return {
    startCol: start[1],
    startRow: parseInt(start[2]),
    endCol: end[1],
    endRow: parseInt(end[2])
  };
};
```

#### 3. Row Operations
For row-based operations (like delete duplicates), we use Maps and Sets:

```javascript
// Example: Identifying duplicate rows
const getUniqueRowKey = (rowIndex, columns) => {
  return columns.map(col => {
    const cellId = `${col}${rowIndex}`;
    return cellData[cellId]?.value || '';
  }).join('|');
};

const uniqueRows = new Map();  // Store unique row values
const duplicateRows = new Set(); // Track duplicate indices
```

#### 4. Data Operations

**Insertion:**
```javascript
// Insert new cell
setCellData(prev => ({
  ...prev,
  [cellId]: {
    value: newValue,
    format: { ...defaultFormat }
  }
}));
```

**Deletion:**
```javascript
// Delete cell
setCellData(prev => {
  const newData = { ...prev };
  delete newData[cellId];
  return newData;
});
```

**Row Shifting (for delete operations):**
```javascript
const shiftRowsUp = (startRow, endRow) => {
  const newCellData = { ...cellData };
  for (let col = 1; col <= COLS; col++) {
    for (let row = startRow; row <= endRow; row++) {
      const currentCell = `${getColLetter(col)}${row}`;
      const nextCell = `${getColLetter(col)}${row + 1}`;
      newCellData[currentCell] = newCellData[nextCell] || { value: '', format: {} };
    }
  }
  return newCellData;
};
```

#### 5. Formula Evaluation
For formula evaluation, we use a recursive approach with memoization:

```javascript
const evaluateFormula = (formula, memo = new Set()) => {
  if (memo.has(formula)) return '#CIRCULAR!';
  memo.add(formula);

  // Parse and evaluate nested formulas
  const cellRefs = formula.match(/[A-Z]+[0-9]+/g) || [];
  for (const ref of cellRefs) {
    const value = cellData[ref]?.value;
    if (value?.startsWith('=')) {
      const result = evaluateFormula(value, memo);
      formula = formula.replace(ref, result);
    }
  }
  return evaluate(formula);
};
```

These data structures enable:
- Efficient cell access and updates
- Fast range operations
- Memory-efficient storage
- Reliable formula evaluation
- Smooth user interactions
- Scalable spreadsheet operations

### Key Components

#### 1. Cell Component
```javascript
function Cell({ 
  id, 
  value, 
  displayValue,
  isSelected,
  format,
  onSelect,
  onChange 
}) {
  // Cell rendering and interaction logic
}
```

#### 2. Grid Component
```javascript
function Grid({ 
  selectedCell,
  cellData,
  onCellSelect,
  onCellChange,
  onGridChange 
}) {
  // Grid management and cell coordination
}
```

#### 3. Formula Evaluation
```javascript
const evaluateFormula = (formula) => {
  const match = formula.match(/^=(\w+)\(([A-Z]+\d+)(?:,([A-Z]+\d+))?\)$/);
  if (!match) return formula;
  
  const [_, functionName, startCell, endCell] = match;
  return spreadsheetFunctions[functionName](startCell, endCell, cellData);
};
```

## 🛠️ Technology Stack

- **React**: UI components and state management
- **TailwindCSS**: Styling and responsive design
- **JavaScript**: Core logic and formula evaluation

### Why These Technologies?

1. **React**
   - Component-based architecture
   - Efficient DOM updates
   - Rich ecosystem
   - Easy state management

2. **TailwindCSS**
   - Rapid UI development
   - Consistent styling
   - Easy customization

## 🚀 Getting Started

1. Clone the repository
```bash
git clone https://github.com/AnishPillai2002/google-sheet-clone
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

## 📝 Usage Examples

### 1. Text Functions
```javascript
// Text manipulation
A1: "  Hello world  "
B1: "=TRIM(A1)"      // "Hello world"
C1: "=UPPER(A1)"     // "HELLO WORLD"
D1: "=PROPER(A1)"    // "Hello World"
E1: "=LOWER(A1)" // "hello world"
```

### 2. Mathematical Functions
```javascript
// Basic calculations
A1: 10
A2: 20
A3: 30
A4: "=SUM(A1:A3)"      // Result: 60
A5: "=AVERAGE(A1:A3)"  // Result: 20
A6: "=MAX(A1:A3)"      // Result: 30
A7: "=MIN(A1:A3)"      // Result: 10
A8: "=COUNT(A1:A3)"    // Result: 3
```


### 3. Delete Duplicates
```javascript
// Example data:
A1: "Name"    B1: "Age"
A2: "John"    B2: "25"
A3: "Jane"    B3: "30"
A4: "John"    B4: "25"

// Select columns A and B
// Click "Delete Duplicates"
// Result:
A1: "Name"    B1: "Age"
A2: "John"    B2: "25"
A3: "Jane"    B3: "30"
```

### 4. Cell Formatting
```javascript
// Apply multiple formats
cellFormat: {
  bold: true,
  italic: false,
  fontSize: 14,
  color: "#000000"
}

// Format range
selectedRange.forEach(cellId => {
  applyCellFormat(cellId, { bold: true });
});
```

### 5. Nested Formulas
```javascript
// Complex calculations
A1: 10
A2: 20
A3: "=SUM(A1:A2)"          // Result: 30
A4: "=AVERAGE(A1,A3)"      // Result: 20
A5: "=MAX(A1,A4)"       // Result: 30

// Nested text operations
A1: "  HELLO world  "
B1: "=TRIM(A1)"           // "HELLO world"
C1: "=PROPER(TRIM(A1))"   // "Hello World"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

