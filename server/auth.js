import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const USERS_FILE = process.env.USERS_FILE || join(__dirname, 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'server-dashboard-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// Initialize users file with default users if it doesn't exist
function initializeUsers() {
  if (!existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        username: 'user',
        password: bcrypt.hashSync('user123', 10),
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
    writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf8');
    console.log('Created default users file');
  }
}

function readUsers() {
  initializeUsers();
  const data = readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Login and return JWT token
export function login(username, password) {
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user) {
    return { success: false, error: 'Invalid username or password' };
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);
  if (!isValidPassword) {
    return { success: false, error: 'Invalid username or password' };
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    success: true,
    token,
    user: { id: user.id, username: user.username, role: user.role }
  };
}

// Verify JWT token
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, user: decoded };
  } catch (error) {
    return { valid: false, error: 'Invalid or expired token' };
  }
}

// Auth middleware
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const result = verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: result.error });
  }

  req.user = result.user;
  next();
}

// Admin-only middleware
export function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// Get user by ID (without password)
export function getUserById(id) {
  const users = readUsers();
  const user = users.find(u => u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Change password
export function changePassword(userId, currentPassword, newPassword) {
  const users = readUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  const user = users[userIndex];
  const isValidPassword = bcrypt.compareSync(currentPassword, user.password);

  if (!isValidPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }

  users[userIndex].password = bcrypt.hashSync(newPassword, 10);
  writeUsers(users);

  return { success: true };
}

// Initialize on module load
initializeUsers();
