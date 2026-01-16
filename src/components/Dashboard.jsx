import { useState, useEffect } from 'react';
import { Plus, Server, Wifi, WifiOff, HelpCircle, AlertCircle, Loader2, LogOut, User, Settings as SettingsIcon, Layers } from 'lucide-react';
import { useServers } from '../hooks/useServers';
import { useAuth } from '../hooks/useAuth.jsx';
import { useConfig } from '../hooks/useConfig';
import SearchBar from './SearchBar';
import ServerTable from './ServerTable';
import ServerForm from './ServerForm';
import ImportExport from './ImportExport';
import Settings from './Settings';
import { ServiceSegregationPage } from './ServiceSegregation';

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const {
    servers,
    filteredServers,
    allTags,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterTags,
    setFilterTags,
    filterEnvironment,
    setFilterEnvironment,
    filterStatus,
    setFilterStatus,
    filterAccount,
    setFilterAccount,
    sortConfig,
    handleSort,
    addServer,
    updateServer,
    deleteServer,
    updateServerStatus,
    importServers,
    refresh
  } = useServers();

  const {
    accounts,
    environments,
    addAccount,
    removeAccount,
    addEnvironment,
    removeEnvironment
  } = useConfig();

  const [showForm, setShowForm] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showServiceSegregation, setShowServiceSegregation] = useState(false);

  // Keyboard shortcuts (only for admin)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAdmin) return;

      // Ctrl/Cmd + K for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
      // Ctrl/Cmd + N for new server
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowForm(true);
      }
      // Escape to close modal
      if (e.key === 'Escape') {
        setShowForm(false);
        setEditingServer(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin]);

  const handleAddServer = (data) => {
    addServer(data);
    setShowForm(false);
  };

  const handleEditServer = (server) => {
    if (!isAdmin) return;
    setEditingServer(server);
    setShowForm(true);
  };

  const handleUpdateServer = (data) => {
    if (editingServer) {
      updateServer(editingServer.id, data);
      setEditingServer(null);
      setShowForm(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingServer(null);
  };

  // Stats
  const stats = {
    total: servers.length,
    online: servers.filter(s => s.status === 'online').length,
    offline: servers.filter(s => s.status === 'offline').length,
    unknown: servers.filter(s => s.status === 'unknown').length
  };

  // Show Service Segregation Page if active
  if (showServiceSegregation) {
    return (
      <ServiceSegregationPage
        onBack={() => setShowServiceSegregation(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="text-blue-600" size={28} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Server Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* User info */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${isAdmin ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                  {user?.role}
                </span>
              </div>

              {/* Service Segregation button (visible to all authenticated users) */}
              <button
                onClick={() => setShowServiceSegregation(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Service Segregation"
              >
                <Layers size={20} />
                <span className="hidden sm:inline">Services</span>
              </button>

              {/* Admin-only actions */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <SettingsIcon size={20} />
                  </button>
                  <ImportExport servers={servers} onImport={importServers} />
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Plus size={20} />
                    Add Server
                  </button>
                </>
              )}

              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Server size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Servers</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wifi size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
                <p className="text-sm text-gray-500">Online</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <WifiOff size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.offline}</p>
                <p className="text-sm text-gray-500">Offline</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <HelpCircle size={20} className="text-gray-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-500">{stats.unknown}</p>
                <p className="text-sm text-gray-500">Unknown</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Connection Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={refresh}
              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-3 text-gray-600">Loading servers...</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterEnvironment={filterEnvironment}
            onEnvironmentChange={setFilterEnvironment}
            filterStatus={filterStatus}
            onStatusChange={setFilterStatus}
            filterAccount={filterAccount}
            onAccountChange={setFilterAccount}
            filterTags={filterTags}
            onTagsChange={setFilterTags}
            allTags={allTags}
            allAccounts={accounts}
            allEnvironments={environments}
          />
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredServers.length} of {servers.length} servers
        </div>

        {/* Server Table */}
        <ServerTable
          servers={filteredServers}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={isAdmin ? handleEditServer : null}
          onDelete={isAdmin ? deleteServer : null}
          onStatusUpdate={isAdmin ? updateServerStatus : null}
          isAdmin={isAdmin}
        />

        {/* Keyboard shortcuts hint (admin only) */}
        {isAdmin && (
          <div className="mt-6 text-center text-sm text-gray-400">
            <span className="hidden sm:inline">
              Keyboard shortcuts: <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+N</kbd> New server
              {' '}<kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl+K</kbd> Search
              {' '}<kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> Close modal
            </span>
          </div>
        )}
      </main>

      {/* Server Form Modal (admin only) */}
      {showForm && isAdmin && (
        <ServerForm
          server={editingServer}
          onSubmit={editingServer ? handleUpdateServer : handleAddServer}
          onCancel={handleCloseForm}
          allTags={allTags}
          allAccounts={accounts}
          allEnvironments={environments}
        />
      )}

      {/* Settings Modal (admin only) */}
      {showSettings && isAdmin && (
        <Settings
          accounts={accounts}
          environments={environments}
          onAddAccount={addAccount}
          onRemoveAccount={removeAccount}
          onAddEnvironment={addEnvironment}
          onRemoveEnvironment={removeEnvironment}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
