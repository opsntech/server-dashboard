import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_FILE = join(__dirname, 'data', 'service-segregation.json');

// Default priorities configuration
const DEFAULT_PRIORITIES = {
  HIGH: { heap: 512, color: '#ff6b6b' },
  MEDIUM: { heap: 256, color: '#ffd93d' },
  LOW: { heap: 128, color: '#6bcb77' }
};

// Initialize data file if it doesn't exist
function initializeDataFile() {
  if (!existsSync(DATA_FILE)) {
    const initialData = {
      masterServices: [],
      configurations: []
    };
    writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

// Read all data from file
function readData() {
  initializeDataFile();
  const data = readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

// Write data to file
function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ============ VALIDATION HELPERS ============

const VALID_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];

function sanitizeString(str, maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

function isValidServiceName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  // Allow alphanumeric, hyphens, underscores, dots (common service name chars)
  return trimmed.length > 0 && trimmed.length <= 100 && /^[a-zA-Z0-9._-]+$/.test(trimmed);
}

function isValidAccountOrEnv(value) {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
}

// ============ MASTER SERVICES ============

export function getMasterServices() {
  const data = readData();
  return data.masterServices || [];
}

export function addMasterService(name, defaultPriority = 'MEDIUM') {
  // Validate inputs
  if (!isValidServiceName(name)) {
    throw new Error('Invalid service name. Use alphanumeric characters, hyphens, underscores, or dots.');
  }

  const sanitizedName = sanitizeString(name);
  const sanitizedPriority = VALID_PRIORITIES.includes(defaultPriority) ? defaultPriority : 'MEDIUM';

  const data = readData();

  // Check if service already exists (case-insensitive)
  const exists = data.masterServices.some(
    s => s.name.toLowerCase() === sanitizedName.toLowerCase()
  );
  if (exists) {
    throw new Error('Service already exists');
  }

  data.masterServices.push({ name: sanitizedName, defaultPriority: sanitizedPriority });
  writeData(data);
  return data.masterServices;
}

export function removeMasterService(name) {
  const data = readData();
  const index = data.masterServices.findIndex(
    s => s.name.toLowerCase() === name.toLowerCase()
  );

  if (index === -1) {
    throw new Error('Service not found');
  }

  data.masterServices.splice(index, 1);
  writeData(data);
  return data.masterServices;
}

// ============ CONFIGURATIONS ============

export function getConfigurations() {
  const data = readData();
  return data.configurations || [];
}

export function getConfigByAccountEnv(account, environment) {
  const data = readData();
  return data.configurations.find(
    c => c.account === account && c.environment === environment
  ) || null;
}

export function createConfig(account, environment) {
  // Validate inputs
  if (!isValidAccountOrEnv(account)) {
    throw new Error('Invalid account name');
  }
  if (!isValidAccountOrEnv(environment)) {
    throw new Error('Invalid environment name');
  }

  const sanitizedAccount = sanitizeString(account, 50);
  const sanitizedEnv = sanitizeString(environment, 50);

  const data = readData();

  // Check if config already exists
  const exists = data.configurations.some(
    c => c.account === sanitizedAccount && c.environment === sanitizedEnv
  );
  if (exists) {
    throw new Error('Configuration already exists for this account and environment');
  }

  const newConfig = {
    id: crypto.randomUUID(),
    account: sanitizedAccount,
    environment: sanitizedEnv,
    priorities: { ...DEFAULT_PRIORITIES },
    appServers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  data.configurations.push(newConfig);
  writeData(data);
  return newConfig;
}

export function updateConfig(id, updates) {
  // Validate ID format (UUID)
  if (!id || typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) {
    throw new Error('Invalid configuration ID');
  }

  const data = readData();
  const index = data.configurations.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error('Configuration not found');
  }

  // Whitelist allowed update fields only
  const allowedUpdates = {};

  if (updates.priorities && typeof updates.priorities === 'object') {
    // Validate priorities structure
    allowedUpdates.priorities = {};
    for (const [key, value] of Object.entries(updates.priorities)) {
      if (typeof key === 'string' && key.length <= 20 && typeof value === 'object') {
        allowedUpdates.priorities[sanitizeString(key, 20)] = {
          heap: typeof value.heap === 'number' ? Math.min(Math.max(value.heap, 1), 10000) : 256,
          color: typeof value.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.color) ? value.color : '#6bcb77'
        };
      }
    }
  }

  if (updates.appServers && Array.isArray(updates.appServers)) {
    // Validate and sanitize app servers
    allowedUpdates.appServers = updates.appServers.slice(0, 50).map(server => ({
      id: sanitizeString(server.id, 50),
      name: sanitizeString(server.name, 100),
      linkedServerId: server.linkedServerId ? sanitizeString(server.linkedServerId, 50) : null,
      services: Array.isArray(server.services) ? server.services.slice(0, 200).map(svc => ({
        id: sanitizeString(svc.id, 100),
        name: sanitizeString(svc.name, 100),
        priority: VALID_PRIORITIES.includes(svc.priority) ? svc.priority : 'MEDIUM',
        maxHeap: typeof svc.maxHeap === 'number' ? Math.min(Math.max(svc.maxHeap, 1), 10000) : 256
      })) : []
    }));
  }

  data.configurations[index] = {
    ...data.configurations[index],
    ...allowedUpdates,
    updatedAt: new Date().toISOString()
  };

  writeData(data);
  return data.configurations[index];
}

export function deleteConfig(id) {
  // Validate ID format (UUID)
  if (!id || typeof id !== 'string' || !/^[a-f0-9-]{36}$/i.test(id)) {
    throw new Error('Invalid configuration ID');
  }

  const data = readData();
  const index = data.configurations.findIndex(c => c.id === id);

  if (index === -1) {
    throw new Error('Configuration not found');
  }

  data.configurations.splice(index, 1);
  writeData(data);
  return true;
}
