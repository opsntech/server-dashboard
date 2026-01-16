import { useState, useEffect } from 'react';
import { X, Save, Server } from 'lucide-react';
import TagManager from './TagManager';

const STATUSES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'unknown', label: 'Unknown' }
];

export default function ServerForm({ server, onSubmit, onCancel, allTags, allAccounts = [], allEnvironments = [] }) {
  const isEditing = !!server;

  const [formData, setFormData] = useState({
    ip: '',
    hostname: '',
    serverName: '',
    account: '',
    environment: 'development',
    status: 'unknown',
    tags: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (server) {
      setFormData({
        ip: server.ip || '',
        hostname: server.hostname || '',
        serverName: server.serverName || '',
        account: server.account || '',
        environment: server.environment || 'development',
        status: server.status || 'unknown',
        tags: server.tags || [],
        notes: server.notes || ''
      });
    }
  }, [server]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ip && !formData.hostname && !formData.serverName) {
      newErrors.general = 'At least one of IP, Hostname, or Server Name is required';
    }

    if (formData.ip && !/^(\d{1,3}\.){3}\d{1,3}$/.test(formData.ip)) {
      newErrors.ip = 'Invalid IP address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors.general && (field === 'ip' || field === 'hostname' || field === 'serverName')) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Server className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Server' : 'Add Server'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          {/* IP Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address
            </label>
            <input
              type="text"
              value={formData.ip}
              onChange={(e) => handleChange('ip', e.target.value)}
              placeholder="192.168.1.1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.ip ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.ip && (
              <p className="mt-1 text-sm text-red-600">{errors.ip}</p>
            )}
          </div>

          {/* Hostname */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostname
            </label>
            <input
              type="text"
              value={formData.hostname}
              onChange={(e) => handleChange('hostname', e.target.value)}
              placeholder="server.example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Server Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Server Name
            </label>
            <input
              type="text"
              value={formData.serverName}
              onChange={(e) => handleChange('serverName', e.target.value)}
              placeholder="Web Server 01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Account/Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account / Product
            </label>
            <select
              value={formData.account}
              onChange={(e) => handleChange('account', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select account...</option>
              {allAccounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>

          {/* Environment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Environment
            </label>
            <select
              value={formData.environment}
              onChange={(e) => handleChange('environment', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {allEnvironments.map(env => (
                <option key={env.value} value={env.value}>{env.label}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <TagManager
              tags={formData.tags}
              onChange={(tags) => handleChange('tags', tags)}
              suggestions={allTags}
              placeholder="Add tags..."
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes about this server..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={18} />
              {isEditing ? 'Save Changes' : 'Add Server'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
