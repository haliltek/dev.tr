import { SignJWT, jwtVerify } from 'jose';
import fs from 'fs';
import path from 'path';

const JWT_SECRET_STRING = process.env.ADMIN_JWT_SECRET || 'devcore-admin-super-secure-secret-token-key-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

const CONFIG_FILE = path.join(process.cwd(), 'data', 'admin_config.json');

interface AdminConfig {
  username: string;
  passwordHash?: string;
  passwordPlain?: string;
}

function getStoredConfig(): AdminConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read admin config:', err);
  }
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordPlain: process.env.ADMIN_PASSWORD || 'Halil12621262.',
  };
}

export function saveAdminConfig(config: AdminConfig): void {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save admin config:', err);
  }
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.username && payload.role === 'admin') {
      return { username: payload.username as string, role: payload.role as string };
    }
    return null;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(user: string, pass: string): boolean {
  const config = getStoredConfig();
  const expectedUser = (config.username || process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
  const expectedPass = (config.passwordPlain || process.env.ADMIN_PASSWORD || 'Halil12621262.').trim();
  return user.trim().toLowerCase() === expectedUser && pass.trim() === expectedPass;
}

export function updateAdminPassword(newPassword: string): void {
  const config = getStoredConfig();
  config.passwordPlain = newPassword;
  saveAdminConfig(config);
}
