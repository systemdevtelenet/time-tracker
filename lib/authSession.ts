import { createHmac, timingSafeEqual } from 'node:crypto';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string;
  loginAt: number;
}

function getSigningKey() {
  const key = process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('A session signing key is required.');
  return key;
}

export function signAuthSession(session: AuthSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = createHmac('sha256', getSigningKey()).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyAuthSession(value: string | undefined): AuthSession | null {
  if (!value) return null;
  const [payload, providedSignature, extra] = value.split('.');
  if (!payload || !providedSignature || extra) return null;

  try {
    const expected = createHmac('sha256', getSigningKey()).update(payload).digest();
    const provided = Buffer.from(providedSignature, 'base64url');
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AuthSession;
    if (!session.id || !session.email || !Number.isFinite(session.loginAt)) return null;
    if (Date.now() - session.loginAt > 7 * 24 * 60 * 60 * 1000) return null;
    return session;
  } catch {
    return null;
  }
}
