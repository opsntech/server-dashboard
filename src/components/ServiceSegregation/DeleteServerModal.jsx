const DeleteServerModal = ({
  isOpen,
  onClose,
  server,
  otherServers,
  onDeleteWithReallocation,
  onDeleteWithoutServices
}) => {
  if (!isOpen || !server) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const hasServices = server.services.length > 0;
  const hasOtherServers = otherServers.length > 0;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content delete-modal">
        <div className="modal-header">
          <h3>Delete Server</h3>
          <span className="modal-subtitle">{server.name}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {hasServices ? (
            <>
              <div className="warning-message">
                <span className="warning-icon">Warning</span>
                <p>
                  This server has <strong>{server.services.length} services</strong>.
                  Choose how to handle them:
                </p>
              </div>

              <div className="delete-options">
                {hasOtherServers && (
                  <button
                    className="delete-option-btn reallocate"
                    onClick={() => onDeleteWithReallocation(server.id)}
                  >
                    <span className="option-icon">Redistribute</span>
                    <span className="option-title">Redistribute Services</span>
                    <span className="option-desc">
                      Automatically distribute services to other servers based on current load
                    </span>
                  </button>
                )}

                <button
                  className="delete-option-btn delete-all"
                  onClick={() => onDeleteWithoutServices(server.id)}
                >
                  <span className="option-icon">Delete</span>
                  <span className="option-title">Delete Everything</span>
                  <span className="option-desc">
                    Delete the server and all {server.services.length} services permanently
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="confirm-message">
              <p>Are you sure you want to delete this empty server?</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => onDeleteWithoutServices(server.id)}
                >
                  Delete Server
                </button>
              </div>
            </div>
          )}
        </div>

        {hasServices && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteServerModal;
