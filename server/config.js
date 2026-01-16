import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONFIG_FILE = process.env.CONFIG_FILE || join(__dirname, 'data', 'config.json');

const DEFAULT_CONFIG = {
  accounts: [],
  environments: [
    { value: 'development', label: 'Development' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
    { value: 'other', label: 'Other' }
  ]
};

function initializeConfig() {
  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf8');
    console.log('Created default config file');
  }
}

export function readConfig() {
  initializeConfig();
  const data = readFileSync(CONFIG_FILE, 'utf8');
  return JSON.parse(data);
}

export function writeConfig(config) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// Accounts
export function getAccounts() {
  const config = readConfig();
  return config.accounts || [];
}

export function addAccount(account) {
  const config = readConfig();
  if (!config.accounts.includes(account)) {
    config.accounts.push(account);
    config.accounts.sort();
    writeConfig(config);
  }
  return config.accounts;
}

export function removeAccount(account) {
  const config = readConfig();
  config.accounts = config.accounts.filter(a => a !== account);
  writeConfig(config);
  return config.accounts;
}

// Environments
export function getEnvironments() {
  const config = readConfig();
  return config.environments || DEFAULT_CONFIG.environments;
}

export function addEnvironment(environment) {
  const config = readConfig();
  const exists = config.environments.some(e => e.value === environment.value);
  if (!exists) {
    config.environments.push(environment);
    writeConfig(config);
  }
  return config.environments;
}

export function removeEnvironment(value) {
  const config = readConfig();
  config.environments = config.environments.filter(e => e.value !== value);
  writeConfig(config);
  return config.environments;
}

// Initialize on module load
initializeConfig();
