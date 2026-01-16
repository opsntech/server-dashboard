import { useState } from 'react';

const AddServerButton = ({ onAddServer, serverCount }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [serverName, setServerName] = useState('');

  const handleAdd = () => {
    const name = serverName.trim() || `App Server ${serverCount + 1}`;
    onAddServer(name);
    setServerName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setServerName('');
    }
  };

  if (isAdding) {
    return (
      <div className="add-server-column">
        <div className="add-server-form">
          <input
            type="text"
            placeholder={`App Server ${serverCount + 1}`}
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="server-name-input"
            autoFocus
          />
          <div className="add-server-actions">
            <button className="btn btn-small btn-primary" onClick={handleAdd}>
              Add
            </button>
            <button
              className="btn btn-small btn-secondary"
              onClick={() => {
                setIsAdding(false);
                setServerName('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-server-column" onClick={() => setIsAdding(true)}>
      <div className="add-server-placeholder">
        <span className="add-icon">+</span>
        <span className="add-text">Add Server</span>
      </div>
    </div>
  );
};

export default AddServerButton;
