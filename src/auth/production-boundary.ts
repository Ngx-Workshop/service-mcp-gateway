import { isIP } from 'node:net';
import type { Request, Response, NextFunction } from 'express';
import type { CatalogConfig } from '../mcp/catalog.config';
export function productionBoundary(config: CatalogConfig) {
  if (config.auth.mode !== 'oauth') throw new Error('OAuth required');
  const host = new URL(config.auth.resource).host;
  return (req: Request, res: Response, next: NextFunction): void => {
    const peer = req.socket.remoteAddress?.replace(/^::ffff:/, '');
    const client = req.headers['x-forwarded-for'];
    const count = (name: string) =>
      req.rawHeaders.filter((v, i) => i % 2 === 0 && v.toLowerCase() === name)
        .length;
    if (
      !peer ||
      !config.runtime.proxies.includes(peer) ||
      req.headers.host !== host ||
      count('host') !== 1 ||
      count('x-forwarded-proto') !== 1 ||
      count('x-forwarded-for') !== 1 ||
      req.headers['x-forwarded-proto'] !== 'https' ||
      typeof client !== 'string' ||
      !isIP(client) ||
      req.headers.forwarded !== undefined ||
      req.headers['x-forwarded-host'] !== undefined ||
      (req.headers.origin !== undefined &&
        !config.runtime.origins.includes(req.headers.origin) &&
        !(
          req.method === 'GET' &&
          req.originalUrl.split('?')[0] ===
            '/.well-known/oauth-protected-resource/mcp'
        ))
    ) {
      res.status(403).json({ error: 'Invalid production ingress' });
      return;
    }
    if (
      req.method === 'GET' &&
      req.originalUrl.split('?')[0] ===
        '/.well-known/oauth-protected-resource/mcp'
    )
      res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  };
}
