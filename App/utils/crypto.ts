import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'edurank_secret_signature_key_2026';

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  exp: number;
}

export function generateToken(payload: Omit<TokenPayload, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours
  const fullPayload: TokenPayload = { ...payload, exp };
  
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(`${header}.${body}`);
  const signature = hmac.digest('base64url');
  
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, body, signature] = parts;
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(`${header}.${body}`);
    const expectedSignature = hmac.digest('base64url');
    
    if (signature !== expectedSignature) return null;
    
    const decodedBody = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as TokenPayload;
    if (decodedBody.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return decodedBody;
  } catch {
    return null;
  }
}
