import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useServiceSegregation } from '../../hooks/useServiceSegregation';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useConfig } from '../../hooks/useConfig';
import { useServers } from '../../hooks/useServers';
import ServiceSegregationApp from './ServiceSegregationApp';
import './ServiceSegregation.css';

function ServiceSegregationPage({ onBack }) {
  const { isAdmin } = useAuth();
  const { accounts, environments } = useConfig();
  const { servers: realServers } = useServers();

  const {
    configurations,
    currentConfig,
    loading,
    saving,
    error,
    loadConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    clearError
  } = useServiceSegregation();

  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load config when account/environment changes
  useEffect(() => {
    if (selectedAccount && selectedEnvironment) {
      loadConfig(selectedAccount, selectedEnvironment);
    }
  }, [selectedAccount, selectedEnvironment, loadConfig]);

  const handleCreateConfig = async () => {
    if (!selectedAccount || !selectedEnvironment) return;
    try {
      await createConfig(selectedAccount, selectedEnvironment);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleDeleteConfig = async () => {
    if (!currentConfig) return;
    try {
      await deleteConfig(currentConfig.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleUpdateConfig = (updates) => {
    updateConfig(updates);
  };

  // Check if config exists for selected account/env
  const configExists = configurations.some(
    c => c.account === selectedAccount && c.environment === selectedEnvironment
  );

  return (
    <div className="service-segregation-page">
      {/* Header */}
      <header className="ss-page-header">
        <div className="ss-page-header-left">
          <button className="btn-back" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Service Segregation</h1>
            <p className="ss-page-subtitle">Manage service allocation across app servers</p>
          </div>
        </div>
        <div className="ss-page-header-right">
          {saving && (
            <span className="saving-indicator">
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </span>
          )}
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="ss-error-banner">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={clearError}>&times;</button>
        </div>
      )}

      {/* Selector Section */}
      <div className="ss-selector-section">
        <div className="ss-selector-row">
          <div className="ss-selector">
            <label htmlFor="account">Account</label>
            <select
              id="account"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Select Account...</option>
              {accounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>

          <div className="ss-selector">
            <label htmlFor="environment">Environment</label>
            <select
              id="environment"
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
            >
              <option value="">Select Environment...</option>
              {environments.map(env => (
                <option key={env.value} value={env.value}>{env.label}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          {selectedAccount && selectedEnvironment && !loading && (
            <div className="ss-selector-actions">
              {!configExists && isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={handleCreateConfig}
                  disabled={saving}
                >
                  <Plus size={16} />
                  Create Configuration
                </button>
              )}
              {configExists && isAdmin && (
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Config info */}
        {currentConfig && (
          <div className="ss-config-info">
            <span>Configuration: <strong>{currentConfig.account}</strong> / <strong>{currentConfig.environment}</strong></span>
            <span className="ss-config-date">Last updated: {new Date(currentConfig.updatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="ss-main-content">
        {loading ? (
          <div className="ss-loading">
            <Loader2 size={32} className="animate-spin" />
            <span>Loading configuration...</span>
          </div>
        ) : !selectedAccount || !selectedEnvironment ? (
          <div className="ss-empty-state">
            <h3>Select Account & Environment</h3>
            <p>Choose an account and environment to view or manage service allocations.</p>
          </div>
        ) : !currentConfig ? (
          <div className="ss-empty-state">
            <h3>No Configuration Found</h3>
            <p>
              No service configuration exists for <strong>{selectedAccount}</strong> / <strong>{selectedEnvironment}</strong>.
            </p>
            {isAdmin && (
              <button className="btn btn-primary" onClick={handleCreateConfig}>
                <Plus size={16} />
                Create Configuration
              </button>
            )}
          </div>
        ) : (
          <ServiceSegregationApp
            config={currentConfig}
            onUpdateConfig={handleUpdateConfig}
            realServers={realServers}
            readOnly={!isAdmin}
            account={selectedAccount}
            environment={selectedEnvironment}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Configuration</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete the configuration for{' '}
                <strong>{selectedAccount}</strong> / <strong>{selectedEnvironment}</strong>?
              </p>
              <p className="warning-text">
                This will permanently delete all app servers and service assignments for this configuration.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfig}>
                Delete Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceSegregationPage;
