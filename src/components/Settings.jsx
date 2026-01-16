import { useState } from 'react';
import { X, Settings as SettingsIcon, Plus, Trash2, Building2, Layers } from 'lucide-react';

export default function Settings({
  accounts,
  environments,
  onAddAccount,
  onRemoveAccount,
  onAddEnvironment,
  onRemoveEnvironment,
  onClose
}) {
  const [newAccount, setNewAccount] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvLabel, setNewEnvLabel] = useState('');
  const [error, setError] = useState('');

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!newAccount.trim()) return;

    setError('');
    const result = await onAddAccount(newAccount.trim());
    if (result.success) {
      setNewAccount('');
    } else {
      setError(result.error);
    }
  };

  const handleAddEnvironment = async (e) => {
    e.preventDefault();
    if (!newEnvValue.trim() || !newEnvLabel.trim()) return;

    setError('');
    const result = await onAddEnvironment(newEnvValue.trim(), newEnvLabel.trim());
    if (result.success) {
      setNewEnvValue('');
      setNewEnvLabel('');
    } else {
      setError(result.error);
    }
  };

  const handleRemoveAccount = async (account) => {
    const result = await onRemoveAccount(account);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleRemoveEnvironment = async (value) => {
    const result = await onRemoveEnvironment(value);
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SettingsIcon className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Accounts Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={20} className="text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">Accounts / Products</h3>
            </div>

            {/* Add Account Form */}
            <form onSubmit={handleAddAccount} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                placeholder="New account name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!newAccount.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </form>

            {/* Accounts List */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {accounts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No accounts configured. Add one above.
                </div>
              ) : (
                accounts.map(account => (
                  <div key={account} className="flex items-center justify-between p-3">
                    <span className="text-gray-700">{account}</span>
                    <button
                      onClick={() => handleRemoveAccount(account)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove account"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Environments Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={20} className="text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Environments</h3>
            </div>

            {/* Add Environment Form */}
            <form onSubmit={handleAddEnvironment} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                placeholder="Value (e.g., qa)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="text"
                value={newEnvLabel}
                onChange={(e) => setNewEnvLabel(e.target.value)}
                placeholder="Label (e.g., QA)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newEnvValue.trim() || !newEnvLabel.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </form>

            {/* Environments List */}
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
              {environments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No environments configured. Add one above.
                </div>
              ) : (
                environments.map(env => (
                  <div key={env.value} className="flex items-center justify-between p-3">
                    <div>
                      <span className="text-gray-700 font-medium">{env.label}</span>
                      <span className="text-gray-400 text-sm ml-2">({env.value})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveEnvironment(env.value)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove environment"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
