import { useState, useEffect, useCallback } from 'react';
import * as api from '../utils/api';

export function useConfig() {
  const [accounts, setAccounts] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const config = await api.fetchConfig();
      setAccounts(config.accounts || []);
      setEnvironments(config.environments || []);
    } catch (err) {
      setError('Failed to load config');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const addAccount = useCallback(async (account) => {
    try {
      const result = await api.addAccount(account);
      setAccounts(result.accounts);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const removeAccount = useCallback(async (account) => {
    try {
      const result = await api.removeAccount(account);
      setAccounts(result.accounts);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const addEnvironment = useCallback(async (value, label) => {
    try {
      const result = await api.addEnvironment(value, label);
      setEnvironments(result.environments);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const removeEnvironment = useCallback(async (value) => {
    try {
      const result = await api.removeEnvironment(value);
      setEnvironments(result.environments);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    accounts,
    environments,
    loading,
    error,
    addAccount,
    removeAccount,
    addEnvironment,
    removeEnvironment,
    refresh: loadConfig
  };
}
