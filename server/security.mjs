/**
 * Small hand-rolled security helpers: manual headers, cookie parsing/issuing,
 * a CSRF token skeleton and an in-memory per-IP limiter. No auth is implied.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';

const CSRF_COOKIE = 'soko_csrf';
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 300;

export function installSecurityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; " +
        "script-src 'self'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob: https://images.unsplash.com https://images.pexels.com; " +
        "font-src 'self' data:; connect-src 'self'"
    );
  }
  next();
}

export function parseCookieHeader(header = '') {
  const cookies = {};
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      cookies[key] = '';
    }
  }
  return cookies;
}

export function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  parts.push('HttpOnly', 'SameSite=Lax');
  if (options.secure) parts.push('Secure');
  return parts.join('; ');
}

/** Attaches read/write cookie helpers without adding a cookie dependency. */
export function cookieMiddleware(req, res, next) {
  req.cookies = parseCookieHeader(req.headers.cookie);
  res.setCookie = (name, value, options = {}) => {
    res.append('Set-Cookie', serializeCookie(name, value, { path: '/', ...options }));
  };
  res.clearCookie = (name) => {
    res.append('Set-Cookie', serializeCookie(name, '', { path: '/', maxAge: 0 }));
  };
  next();
}

/** GET /api/csrf — client sends the returned token in X-CSRF-Token on writes. */
export function csrfTokenHandler(req, res) {
  const token = req.cookies?.[CSRF_COOKIE] || randomBytes(24).toString('hex');
  res.setCookie(CSRF_COOKIE, token, { maxAge: 3600 });
  res.json({ csrfToken: token });
}

/** Skeleton check: full session/auth handling is intentionally out of scope. */
export function csrfGuard(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.get('x-csrf-token');
  if (!cookie || !header || cookie.length !== header.length) {
    return res.status(403).json({ error: 'CSRF token missing or invalid' });
  }
  const matches = timingSafeEqual(Buffer.from(cookie), Buffer.from(header));
  if (!matches) return res.status(403).json({ error: 'CSRF token missing or invalid' });
  return next();
}

export function createRateLimiter({ windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
  const hits = new Map();
  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const recent = (hits.get(ip) ?? []).filter((time) => now - time < windowMs);
    if (recent.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests' });
    }
    recent.push(now);
    hits.set(ip, recent);
    if (hits.size > 1000) {
      for (const [key, times] of hits) {
        if (times.every((time) => now - time >= windowMs)) hits.delete(key);
      }
    }
    return next();
  };
}
