import { useState } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatLastChecked } from '../utils/ping';

const ENVIRONMENT_COLORS = {
  production: 'bg-red-100 text-red-800 border-red-200',
  staging: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  development: 'bg-green-100 text-green-800 border-green-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function ServerTable({
  servers,
  sortConfig,
  onSort,
  onEdit,
  onDelete,
  onStatusUpdate,
  isAdmin = false
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SortableHeader = ({ column, label }) => {
    const isActive = sortConfig.key === column;
    return (
      <th
        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
        onClick={() => onSort(column)}
      >
        <div className="flex items-center gap-1">
          {label}
          <span className="text-gray-400">
            {isActive ? (
              sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} className="opacity-30" />
            )}
          </span>
        </div>
      </th>
    );
  };

  if (servers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900">No servers found</h3>
        <p className="text-gray-500 mt-1">Get started by adding a new server or adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader column="serverName" label="Server Name" />
            <SortableHeader column="ip" label="IP Address" />
            <SortableHeader column="hostname" label="Hostname" />
            <SortableHeader column="account" label="Account" />
            <SortableHeader column="environment" label="Environment" />
            <SortableHeader column="status" label="Status" />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Checked
            </th>
            {isAdmin && (
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {servers.map(server => (
            <tr key={server.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{server.serverName || '-'}</div>
                {server.notes && (
                  <div className="text-xs text-gray-500 truncate max-w-xs" title={server.notes}>
                    {server.notes}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {server.ip ? (
                  <div className="flex items-center gap-1 group">
                    <code className="text-sm bg-gray-100 px-2 py-0.5 rounded font-mono">
                      {server.ip}
                    </code>
                    <button
                      onClick={() => handleCopy(server.ip, `ip-${server.id}`)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      title="Copy IP"
                    >
                      {copiedId === `ip-${server.id}` ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {server.hostname ? (
                  <div className="flex items-center gap-1 group">
                    <span className="text-sm text-gray-700">{server.hostname}</span>
                    <button
                      onClick={() => handleCopy(server.hostname, `host-${server.id}`)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      title="Copy hostname"
                    >
                      {copiedId === `host-${server.id}` ? (
                        <CheckCircle size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                {server.account ? (
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    {server.account}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full border ${ENVIRONMENT_COLORS[server.environment]}`}>
                  {server.environment}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={server.status} size="sm" />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {server.tags?.length > 0 ? (
                    server.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="inline-flex px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                  {server.tags?.length > 3 && (
                    <span className="text-xs text-gray-500">+{server.tags.length - 3}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {formatLastChecked(server.lastChecked)}
              </td>
              {isAdmin && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onStatusUpdate(server.id, server.status)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Update last checked time"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(server)}
                      className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Edit server"
                    >
                      <Edit size={16} />
                    </button>
                    {deleteConfirm === server.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDelete(server.id);
                            setDeleteConfirm(null);
                          }}
                          className="px-2 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(server.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete server"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
