const STORAGE_KEY = 'server-dashboard-data';

export function loadServers() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load servers from localStorage:', error);
    return [];
  }
}

export function saveServers(servers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    return true;
  } catch (error) {
    console.error('Failed to save servers to localStorage:', error);
    return false;
  }
}

export function exportToJSON(servers) {
  const dataStr = JSON.stringify(servers, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `servers-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const servers = JSON.parse(e.target.result);
        if (!Array.isArray(servers)) {
          throw new Error('Invalid JSON format: expected an array');
        }
        resolve(servers);
      } catch (error) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
