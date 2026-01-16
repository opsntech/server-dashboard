import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = process.env.DATA_FILE || join(__dirname, 'data', 'servers.json');

// Middleware
app.use(express.json());

// Helper functions
function readData() {
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, '[]', 'utf8');
  }
  const data = readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes

// Get all servers
app.get('/api/servers', (req, res) => {
  try {
    const servers = readData();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read servers' });
  }
});

// Add a new server
app.post('/api/servers', (req, res) => {
  try {
    const servers = readData();
    const newServer = {
      ...req.body,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    servers.push(newServer);
    writeData(servers);
    res.status(201).json(newServer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add server' });
  }
});

// Update a server
app.put('/api/servers/:id', (req, res) => {
  try {
    const servers = readData();
    const index = servers.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Server not found' });
    }
    servers[index] = {
      ...servers[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    writeData(servers);
    res.json(servers[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update server' });
  }
});

// Delete a server
app.delete('/api/servers/:id', (req, res) => {
  try {
    const servers = readData();
    const filtered = servers.filter(s => s.id !== req.params.id);
    if (filtered.length === servers.length) {
      return res.status(404).json({ error: 'Server not found' });
    }
    writeData(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete server' });
  }
});

// Bulk import servers
app.post('/api/servers/import', (req, res) => {
  try {
    const { servers: newServers, replace } = req.body;

    if (replace) {
      writeData(newServers);
      res.json(newServers);
    } else {
      const existing = readData();
      const existingIds = new Set(existing.map(s => s.id));

      // Update existing, add new
      const updated = existing.map(server => {
        const imported = newServers.find(s => s.id === server.id);
        return imported ? { ...server, ...imported, updatedAt: new Date().toISOString() } : server;
      });
      const newOnes = newServers.filter(s => !existingIds.has(s.id));
      const merged = [...updated, ...newOnes];

      writeData(merged);
      res.json(merged);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to import servers' });
  }
});

// Export all servers (same as GET but explicit endpoint)
app.get('/api/servers/export', (req, res) => {
  try {
    const servers = readData();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export servers' });
  }
});

// Serve static files from the dist folder (production)
const distPath = join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));

  // Handle SPA routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/servers`);
  if (existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
  }
});
