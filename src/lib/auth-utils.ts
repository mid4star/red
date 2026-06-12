import crypto from 'crypto';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_1234567890_red_sea';

// Safe Base64URL encoding/decoding helper
function base64urlEncode(str: string | Buffer): string {
  const buf = typeof str === 'string' ? Buffer.from(str) : str;
  return buf.toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString();
}

// PBKDF2 Password Hashing (Secure & Native)
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    const [salt, hash] = parts;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}

// Native JWT Implementation
export function signJwt(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  
  // Set default expiration to 24 hours
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24);
  const encodedPayload = base64urlEncode(JSON.stringify({ ...payload, exp }));
  
  const signature = crypto.createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const encodedSignature = base64urlEncode(signature);
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export function verifyJwt(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Validate signature
    const signature = crypto.createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const expectedSignature = base64urlEncode(signature);
    
    if (encodedSignature !== expectedSignature) return null;
    
    const payload = JSON.parse(base64urlDecode(encodedPayload));
    
    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (e) {
    return null;
  }
}

// Request Authentication Helper
export async function verifyAuth(req: Request): Promise<{ id: string; employeeId: string; role: string; reserveId?: string; reserve?: string; reserveAr?: string } | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    return verifyJwt(token);
  } catch (error) {
    return null;
  }
}
