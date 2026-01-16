import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { login, verifyToken, authMiddleware, adminMiddleware, getUserById, changePassword } from './auth.js';
import { getAccounts, addAccount, removeAccount, getEnvironments, addEnvironment, removeEnvironment } from './config.js';
import {
  getMasterServices,
  addMasterService,
  removeMasterService,
  getConfigurations,
  getConfigByAccountEnv,
  createConfig,
  updateConfig,
  deleteConfig
} from './service-segregation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = process.env.DATA_FILE || join(__dirname, 'data', 'servers.json');

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit request body size

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

// ============ AUTH ROUTES (Public) ============

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const result = login(username, password);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({ token: result.token, user: result.user });
});

// Verify token / Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Change password
app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const result = changePassword(req.user.id, currentPassword, newPassword);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  res.json({ message: 'Password changed successfully' });
});

// ============ SERVER ROUTES ============

// Get all servers (authenticated)
app.get('/api/servers', authMiddleware, (req, res) => {
  try {
    const servers = readData();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read servers' });
  }
});

// Add a new server (admin only)
app.post('/api/servers', authMiddleware, adminMiddleware, (req, res) => {
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

// Update a server (admin only)
app.put('/api/servers/:id', authMiddleware, adminMiddleware, (req, res) => {
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

// Delete a server (admin only)
app.delete('/api/servers/:id', authMiddleware, adminMiddleware, (req, res) => {
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

// Bulk import servers (admin only)
app.post('/api/servers/import', authMiddleware, adminMiddleware, (req, res) => {
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

// Export all servers (authenticated)
app.get('/api/servers/export', authMiddleware, (req, res) => {
  try {
    const servers = readData();
    res.json(servers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export servers' });
  }
});

// ============ CONFIG ROUTES ============

// Get config (accounts and environments)
app.get('/api/config', authMiddleware, (req, res) => {
  try {
    res.json({
      accounts: getAccounts(),
      environments: getEnvironments()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// Add account (admin only)
app.post('/api/config/accounts', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { account } = req.body;
    if (!account || !account.trim()) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    const accounts = addAccount(account.trim());
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add account' });
  }
});

// Remove account (admin only)
app.delete('/api/config/accounts/:account', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const accounts = removeAccount(decodeURIComponent(req.params.account));
    res.json({ accounts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove account' });
  }
});

// Add environment (admin only)
app.post('/api/config/environments', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { value, label } = req.body;
    if (!value || !label) {
      return res.status(400).json({ error: 'Value and label are required' });
    }
    const environments = addEnvironment({ value: value.trim().toLowerCase(), label: label.trim() });
    res.json({ environments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add environment' });
  }
});

// Remove environment (admin only)
app.delete('/api/config/environments/:value', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const environments = removeEnvironment(decodeURIComponent(req.params.value));
    res.json({ environments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove environment' });
  }
});

// ============ SERVICE SEGREGATION ROUTES ============

// Get all master services (authenticated)
app.get('/api/service-segregation/services', authMiddleware, (req, res) => {
  try {
    const services = getMasterServices();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get services' });
  }
});

// Add new master service (admin only)
app.post('/api/service-segregation/services', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { name, defaultPriority } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Service name is required' });
    }
    const services = addMasterService(name.trim(), defaultPriority || 'MEDIUM');
    res.status(201).json(services);
  } catch (error) {
    if (error.message === 'Service already exists') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add service' });
  }
});

// Remove master service (admin only)
app.delete('/api/service-segregation/services/:name', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const services = removeMasterService(decodeURIComponent(req.params.name));
    res.json(services);
  } catch (error) {
    if (error.message === 'Service not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to remove service' });
  }
});

// Get all configurations (authenticated)
app.get('/api/service-segregation/configs', authMiddleware, (req, res) => {
  try {
    const configs = getConfigurations();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get configurations' });
  }
});

// Get specific configuration by account and environment (authenticated)
app.get('/api/service-segregation/configs/:account/:environment', authMiddleware, (req, res) => {
  try {
    const config = getConfigByAccountEnv(
      decodeURIComponent(req.params.account),
      decodeURIComponent(req.params.environment)
    );
    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

// Create new configuration (admin only)
app.post('/api/service-segregation/configs', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const { account, environment } = req.body;
    if (!account || !environment) {
      return res.status(400).json({ error: 'Account and environment are required' });
    }
    const config = createConfig(account, environment);
    res.status(201).json(config);
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create configuration' });
  }
});

// Update configuration (admin only)
app.put('/api/service-segregation/configs/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const config = updateConfig(req.params.id, req.body);
    res.json(config);
  } catch (error) {
    if (error.message === 'Configuration not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Delete configuration (admin only)
app.delete('/api/service-segregation/configs/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    deleteConfig(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.message === 'Configuration not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete configuration' });
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
  console.log(`API available at http://localhost:${PORT}/api`);
  if (existsSync(distPath)) {
    console.log(`Serving static files from ${distPath}`);
  }
});
