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

/**
 * Whether the incoming request arrived over HTTPS.
 * Browsers refuse to send `Secure` cookies over plain HTTP (the localhost
 * exception does not apply to LAN IPs like 192.168.x.x), so the cookie's
 * `secure` flag must follow the actual transport — not just NODE_ENV.
 * Behind a reverse proxy, x-forwarded-proto is the source of truth.
 */
export function isHttpsRequest(request: { headers: Headers; url: string }): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  if (forwardedProto) return forwardedProto === 'https';
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return false;
  }
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
