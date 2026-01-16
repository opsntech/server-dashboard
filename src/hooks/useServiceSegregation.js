import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchMasterServices,
  addMasterService as apiAddMasterService,
  removeMasterService as apiRemoveMasterService,
  fetchServiceSegregationConfigs,
  fetchServiceSegregationConfig,
  createServiceSegregationConfig,
  updateServiceSegregationConfig,
  deleteServiceSegregationConfig
} from '../utils/api';

export function useServiceSegregation() {
  const [masterServices, setMasterServices] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Debounce timer ref for auto-save
  const saveTimeoutRef = useRef(null);

  // Fetch all configurations on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [services, configs] = await Promise.all([
        fetchMasterServices(),
        fetchServiceSegregationConfigs()
      ]);
      setMasterServices(services);
      setConfigurations(configs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load specific configuration
  const loadConfig = useCallback(async (account, environment) => {
    try {
      setLoading(true);
      setError(null);
      const config = await fetchServiceSegregationConfig(account, environment);
      setCurrentConfig(config);
      return config;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new configuration
  const createConfig = useCallback(async (account, environment) => {
    try {
      setSaving(true);
      setError(null);
      const newConfig = await createServiceSegregationConfig(account, environment);
      setConfigurations(prev => [...prev, newConfig]);
      setCurrentConfig(newConfig);
      return newConfig;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Update current configuration with debounce
  const updateConfig = useCallback((updates) => {
    if (!currentConfig) return;

    // Update local state immediately for responsiveness
    setCurrentConfig(prev => ({
      ...prev,
      ...updates
    }));

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the API call
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await updateServiceSegregationConfig(currentConfig.id, updates);
        // Update configurations list
        setConfigurations(prev =>
          prev.map(c => c.id === currentConfig.id ? { ...c, ...updates } : c)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    }, 500);
  }, [currentConfig]);

  // Force immediate save (for explicit save actions)
  const saveConfigNow = useCallback(async () => {
    if (!currentConfig) return;

    // Clear any pending debounced save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      setSaving(true);
      const { id, account, environment, createdAt, ...updates } = currentConfig;
      await updateServiceSegregationConfig(id, updates);
      setConfigurations(prev =>
        prev.map(c => c.id === id ? currentConfig : c)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentConfig]);

  // Delete configuration
  const deleteConfig = useCallback(async (id) => {
    try {
      setSaving(true);
      setError(null);
      await deleteServiceSegregationConfig(id);
      setConfigurations(prev => prev.filter(c => c.id !== id));
      if (currentConfig?.id === id) {
        setCurrentConfig(null);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [currentConfig]);

  // Master services management
  const addMasterService = useCallback(async (name, defaultPriority = 'MEDIUM') => {
    try {
      setSaving(true);
      setError(null);
      const services = await apiAddMasterService(name, defaultPriority);
      setMasterServices(services);
      return services;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const removeMasterService = useCallback(async (name) => {
    try {
      setSaving(true);
      setError(null);
      const services = await apiRemoveMasterService(name);
      setMasterServices(services);
      return services;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    masterServices,
    configurations,
    currentConfig,
    loading,
    saving,
    error,

    // Actions
    fetchAllData,
    loadConfig,
    createConfig,
    updateConfig,
    saveConfigNow,
    deleteConfig,
    addMasterService,
    removeMasterService,
    setCurrentConfig,
    clearError: () => setError(null)
  };
}
