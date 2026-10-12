import type { Request, Response, NextFunction } from 'express';
const hosts = new Set(['127.0.0.1', 'localhost', '[::1]']);
export function localBoundary(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const host = request.headers.host;
  try {
    if (
      !host ||
      /[\s/@?#\\]/.test(host) ||
      !hosts.has(new URL(`http://${host}`).hostname)
    )
      throw new Error('host');
    const origin = request.headers.origin;
    if (origin !== undefined) {
      const parsed = new URL(origin);
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        !hosts.has(parsed.hostname) ||
        origin !== parsed.origin
      )
        throw new Error('origin');
    }
  } catch {
    response.status(403).json({ error: 'Local catalog access only' });
    return;
  }
  next();
}
