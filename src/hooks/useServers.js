import { useState, useEffect, useMemo, useCallback } from 'react';
import * as api from '../utils/api';

export function useServers() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const [filterEnvironment, setFilterEnvironment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'serverName', direction: 'asc' });

  // Load servers from API on mount
  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchServers();
      setServers(data);
    } catch (err) {
      setError('Failed to load servers. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique tags from servers
  const allTags = useMemo(() => {
    const tags = new Set();
    servers.forEach(server => {
      server.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [servers]);

  // Filter and sort servers
  const filteredServers = useMemo(() => {
    let result = [...servers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(server =>
        server.ip?.toLowerCase().includes(term) ||
        server.hostname?.toLowerCase().includes(term) ||
        server.serverName?.toLowerCase().includes(term) ||
        server.notes?.toLowerCase().includes(term) ||
        server.account?.toLowerCase().includes(term)
      );
    }

    // Apply tag filter
    if (filterTags.length > 0) {
      result = result.filter(server =>
        filterTags.every(tag => server.tags?.includes(tag))
      );
    }

    // Apply environment filter
    if (filterEnvironment) {
      result = result.filter(server => server.environment === filterEnvironment);
    }

    // Apply status filter
    if (filterStatus) {
      result = result.filter(server => server.status === filterStatus);
    }

    // Apply account filter
    if (filterAccount) {
      result = result.filter(server => server.account === filterAccount);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [servers, searchTerm, filterTags, filterEnvironment, filterStatus, filterAccount, sortConfig]);

  // CRUD operations
  const addServer = useCallback(async (serverData) => {
    try {
      const newServer = await api.createServer({
        ...serverData,
        status: serverData.status || 'unknown',
        tags: serverData.tags || [],
        environment: serverData.environment || 'development'
      });
      setServers(prev => [...prev, newServer]);
      return newServer;
    } catch (err) {
      setError('Failed to add server');
      throw err;
    }
  }, []);

  const updateServer = useCallback(async (id, updates) => {
    try {
      const updated = await api.updateServer(id, updates);
      setServers(prev => prev.map(server =>
        server.id === id ? updated : server
      ));
      return updated;
    } catch (err) {
      setError('Failed to update server');
      throw err;
    }
  }, []);

  const deleteServer = useCallback(async (id) => {
    try {
      await api.deleteServer(id);
      setServers(prev => prev.filter(server => server.id !== id));
    } catch (err) {
      setError('Failed to delete server');
      throw err;
    }
  }, []);

  const updateServerStatus = useCallback(async (id, status) => {
    try {
      const updated = await api.updateServer(id, {
        status,
        lastChecked: new Date().toISOString()
      });
      setServers(prev => prev.map(server =>
        server.id === id ? updated : server
      ));
    } catch (err) {
      setError('Failed to update server status');
      throw err;
    }
  }, []);

  const importServers = useCallback(async (newServers, replace = false) => {
    try {
      const result = await api.importServers(newServers, replace);
      setServers(result);
    } catch (err) {
      setError('Failed to import servers');
      throw err;
    }
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  return {
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
    refresh: loadServers
  };
}
