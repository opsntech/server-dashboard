const CSV_HEADERS = ['id', 'ip', 'hostname', 'serverName', 'tags', 'environment', 'notes', 'status', 'lastChecked', 'createdAt', 'updatedAt'];

function escapeCSV(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

export function exportToCSV(servers) {
  const rows = [CSV_HEADERS.join(',')];

  for (const server of servers) {
    const row = CSV_HEADERS.map(header => {
      if (header === 'tags') {
        return escapeCSV(server.tags?.join(';') || '');
      }
      return escapeCSV(server[header]);
    });
    rows.push(row.join(','));
  }

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `servers-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const lines = e.target.result.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error('CSV file must have a header row and at least one data row');
        }

        const headers = parseCSVLine(lines[0]);
        const servers = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const server = {};

          headers.forEach((header, index) => {
            const value = values[index] || '';
            if (header === 'tags') {
              server.tags = value ? value.split(';').map(t => t.trim()).filter(Boolean) : [];
            } else {
              server[header] = value;
            }
          });

          // Validate required fields
          if (!server.ip && !server.hostname && !server.serverName) {
            errors.push(`Row ${i + 1}: At least one of ip, hostname, or serverName is required`);
            continue;
          }

          // Generate ID if missing
          if (!server.id) {
            server.id = crypto.randomUUID();
          }

          // Set defaults
          server.environment = server.environment || 'other';
          server.status = server.status || 'unknown';
          server.tags = server.tags || [];
          server.createdAt = server.createdAt || new Date().toISOString();
          server.updatedAt = server.updatedAt || new Date().toISOString();

          servers.push(server);
        }

        if (errors.length > 0 && servers.length === 0) {
          reject(new Error(`CSV validation failed:\n${errors.join('\n')}`));
        } else {
          resolve({ servers, errors });
        }
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
