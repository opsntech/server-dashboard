import { useState } from 'react';

const PriorityManager = ({ priorities, onUpdatePriority, onAddPriority, onDeletePriority, readOnly }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPriority, setNewPriority] = useState({
    name: '',
    heap: 256,
    color: '#4ecdc4'
  });
  const [editingHeap, setEditingHeap] = useState({});

  const handleHeapChange = (priorityName, value) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      setEditingHeap(prev => ({ ...prev, [priorityName]: value }));
    }
  };

  const handleHeapBlur = (priorityName) => {
    const value = editingHeap[priorityName];
    if (value) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue > 0) {
        onUpdatePriority(priorityName, { heap: numValue });
      }
    }
    setEditingHeap(prev => {
      const next = { ...prev };
      delete next[priorityName];
      return next;
    });
  };

  const handleColorChange = (priorityName, color) => {
    onUpdatePriority(priorityName, { color });
  };

  const handleAddPriority = () => {
    if (newPriority.name.trim()) {
      const name = newPriority.name.trim().toUpperCase().replace(/\s+/g, '_');
      onAddPriority({
        name,
        heap: newPriority.heap,
        color: newPriority.color
      });
      setNewPriority({ name: '', heap: 256, color: '#4ecdc4' });
      setIsAdding(false);
    }
  };

  const priorityList = Object.entries(priorities);

  return (
    <div className="priority-manager">
      <div className="priority-manager-header">
        <span className="priority-manager-title">Priority Legend</span>
        {!readOnly && (
          <button
            className="btn btn-small btn-add"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? 'Cancel' : '+ Add'}
          </button>
        )}
      </div>

      {isAdding && !readOnly && (
        <div className="add-priority-form">
          <input
            type="text"
            placeholder="Priority name (e.g., CRITICAL)"
            value={newPriority.name}
            onChange={(e) => setNewPriority(prev => ({ ...prev, name: e.target.value }))}
            className="priority-input"
          />
          <input
            type="number"
            placeholder="Heap (MB)"
            value={newPriority.heap}
            onChange={(e) => setNewPriority(prev => ({ ...prev, heap: parseInt(e.target.value) || 0 }))}
            className="heap-input"
            min="1"
          />
          <div className="color-picker-wrapper">
            <input
              type="color"
              value={newPriority.color}
              onChange={(e) => setNewPriority(prev => ({ ...prev, color: e.target.value }))}
              className="color-picker"
            />
          </div>
          <button className="btn btn-small btn-primary" onClick={handleAddPriority}>
            Add
          </button>
        </div>
      )}

      <div className="priority-list">
        {priorityList.map(([name, config]) => (
          <div key={name} className="priority-item">
            <div className="priority-color-wrapper">
              {readOnly ? (
                <span
                  className="color-indicator"
                  style={{ backgroundColor: config.color }}
                ></span>
              ) : (
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => handleColorChange(name, e.target.value)}
                  className="color-picker"
                  title="Click to change color"
                />
              )}
            </div>
            <span className="priority-name">{name}</span>
            <div className="priority-heap-wrapper">
              {readOnly ? (
                <span className="heap-value">{config.heap}</span>
              ) : (
                <input
                  type="number"
                  value={editingHeap[name] !== undefined ? editingHeap[name] : config.heap}
                  onChange={(e) => handleHeapChange(name, e.target.value)}
                  onBlur={() => handleHeapBlur(name)}
                  onKeyDown={(e) => e.key === 'Enter' && handleHeapBlur(name)}
                  className="heap-input-inline"
                  min="1"
                />
              )}
              <span className="heap-unit">MB</span>
            </div>
            {!readOnly && !['HIGH', 'MEDIUM', 'LOW'].includes(name) && (
              <button
                className="btn-delete"
                onClick={() => onDeletePriority(name)}
                title="Delete priority"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityManager;
