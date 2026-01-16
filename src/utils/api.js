import { getAuthHeader } from '../hooks/useAuth.jsx';

// Use relative URL in production, absolute in development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

export async function fetchServers() {
  const response = await fetch(`${API_BASE}/servers`, {
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch servers');
  }
  return response.json();
}

export async function createServer(serverData) {
  const response = await fetch(`${API_BASE}/servers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(serverData)
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to create server');
  }
  return response.json();
}

export async function updateServer(id, updates) {
  const response = await fetch(`${API_BASE}/servers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates)
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to update server');
  }
  return response.json();
}

export async function deleteServer(id) {
  const response = await fetch(`${API_BASE}/servers/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to delete server');
  }
}

export async function importServers(servers, replace = false) {
  const response = await fetch(`${API_BASE}/servers/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ servers, replace })
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to import servers');
  }
  return response.json();
}

// Config API
export async function fetchConfig() {
  const response = await fetch(`${API_BASE}/config`, {
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    throw new Error('Failed to fetch config');
  }
  return response.json();
}

export async function addAccount(account) {
  const response = await fetch(`${API_BASE}/config/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ account })
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to add account');
  }
  return response.json();
}

export async function removeAccount(account) {
  const response = await fetch(`${API_BASE}/config/accounts/${encodeURIComponent(account)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to remove account');
  }
  return response.json();
}

export async function addEnvironment(value, label) {
  const response = await fetch(`${API_BASE}/config/environments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ value, label })
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to add environment');
  }
  return response.json();
}

export async function removeEnvironment(value) {
  const response = await fetch(`${API_BASE}/config/environments/${encodeURIComponent(value)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('Unauthorized');
    if (response.status === 403) throw new Error('Admin access required');
    throw new Error('Failed to remove environment');
  }
  return response.json();
}
