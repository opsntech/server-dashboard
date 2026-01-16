import { Search, X, Filter } from 'lucide-react';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'unknown', label: 'Unknown' }
];

export default function SearchBar({
  searchTerm,
  onSearchChange,
  filterEnvironment,
  onEnvironmentChange,
  filterStatus,
  onStatusChange,
  filterAccount,
  onAccountChange,
  filterTags,
  onTagsChange,
  allTags,
  allAccounts = [],
  allEnvironments = []
}) {
  const hasActiveFilters = filterEnvironment || filterStatus || filterAccount || filterTags.length > 0;

  const clearAllFilters = () => {
    onSearchChange('');
    onEnvironmentChange('');
    onStatusChange('');
    onAccountChange('');
    onTagsChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by IP, hostname, server name, or account..."
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Account filter */}
        <select
          value={filterAccount}
          onChange={(e) => onAccountChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Accounts</option>
          {allAccounts.map(account => (
            <option key={account} value={account}>{account}</option>
          ))}
        </select>

        {/* Environment filter */}
        <select
          value={filterEnvironment}
          onChange={(e) => onEnvironmentChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Environments</option>
          {allEnvironments.map(env => (
            <option key={env.value} value={env.value}>{env.label}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {STATUSES.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-500">Tags:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                if (filterTags.includes(tag)) {
                  onTagsChange(filterTags.filter(t => t !== tag));
                } else {
                  onTagsChange([...filterTags, tag]);
                }
              }}
              className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                filterTags.includes(tag)
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <X size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );
}
