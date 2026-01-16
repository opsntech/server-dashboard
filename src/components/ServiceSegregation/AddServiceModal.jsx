import { useState } from 'react';

const AddServiceModal = ({ isOpen, onClose, onAddService, priorities, priorityList, serverName }) => {
  const [serviceName, setServiceName] = useState('');
  const [priority, setPriority] = useState('LOW');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (serviceName.trim()) {
      onAddService(serviceName.trim(), priority);
      setServiceName('');
      setPriority('LOW');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add New Service</h3>
          <span className="modal-subtitle">to {serverName}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="serviceName">Service Name</label>
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., my-new-service"
                autoFocus
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <div className="priority-select-wrapper">
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {priorityList.map((p) => (
                    <option key={p} value={p}>
                      {p} ({priorities[p]?.heap}MB)
                    </option>
                  ))}
                </select>
                <span
                  className="priority-color-indicator"
                  style={{ backgroundColor: priorities[priority]?.color }}
                ></span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
