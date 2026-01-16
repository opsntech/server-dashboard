import { useState } from 'react';
import { Link2, Server, X } from 'lucide-react';

const ServerLinkModal = ({
  isOpen,
  onClose,
  appServer,
  realServers,
  currentLinkedId,
  onLink
}) => {
  const [selectedServerId, setSelectedServerId] = useState(currentLinkedId || '');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || !appServer) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLink = () => {
    onLink(appServer.id, selectedServerId || null);
    onClose();
  };

  const handleUnlink = () => {
    onLink(appServer.id, null);
    onClose();
  };

  const filteredServers = realServers.filter(server => {
    const term = searchTerm.toLowerCase();
    return (
      server.hostname?.toLowerCase().includes(term) ||
      server.ip?.toLowerCase().includes(term) ||
      server.account?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content server-link-modal">
        <div className="modal-header">
          <h3>Link to Server</h3>
          <span className="modal-subtitle">{appServer.name}</span>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="link-description">
            Link this app server configuration to an actual server from your dashboard.
            This helps track which physical/virtual server runs these services.
          </p>

          <div className="form-group">
            <label htmlFor="serverSearch">Search Servers</label>
            <input
              type="text"
              id="serverSearch"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by hostname, IP, or account..."
              autoFocus
            />
          </div>

          <div className="server-list-container">
            {filteredServers.length === 0 ? (
              <div className="no-servers">
                {realServers.length === 0
                  ? 'No servers available in the dashboard'
                  : 'No servers match your search'}
              </div>
            ) : (
              <div className="server-list-radio">
                {filteredServers.map(server => (
                  <label
                    key={server.id}
                    className={`server-option ${selectedServerId === server.id ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="linkedServer"
                      value={server.id}
                      checked={selectedServerId === server.id}
                      onChange={(e) => setSelectedServerId(e.target.value)}
                    />
                    <div className="server-option-content">
                      <Server size={16} className="server-icon" />
                      <div className="server-details">
                        <span className="server-hostname">{server.hostname}</span>
                        <span className="server-meta">
                          {server.ip} | {server.account} | {server.environment}
                        </span>
                      </div>
                      <span className={`status-badge status-${server.status}`}>
                        {server.status}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {currentLinkedId && (
            <button className="btn btn-danger" onClick={handleUnlink}>
              <X size={16} />
              Unlink
            </button>
          )}
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleLink}
              disabled={!selectedServerId}
            >
              <Link2 size={16} />
              Link Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerLinkModal;
