// Use relative URL in production, absolute in development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

export async function fetchServers() {
  const response = await fetch(`${API_BASE}/servers`);
  if (!response.ok) throw new Error('Failed to fetch servers');
  return response.json();
}

export async function createServer(serverData) {
  const response = await fetch(`${API_BASE}/servers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serverData)
  });
  if (!response.ok) throw new Error('Failed to create server');
  return response.json();
}

export async function updateServer(id, updates) {
  const response = await fetch(`${API_BASE}/servers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update server');
  return response.json();
}

export async function deleteServer(id) {
  const response = await fetch(`${API_BASE}/servers/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete server');
}

export async function importServers(servers, replace = false) {
  const response = await fetch(`${API_BASE}/servers/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ servers, replace })
  });
  if (!response.ok) throw new Error('Failed to import servers');
  return response.json();
}
