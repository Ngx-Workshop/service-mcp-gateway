import {
  OAuthIntrospectionClient,
  OAuthVerificationError,
} from '@tmdjr/ngx-auth-client';
import {
  verifyBearerToken,
  bearerAuthChallengeResponse,
  AuthInfo,
} from '@modelcontextprotocol/server';
import type { Request, Response } from 'express';
import type { OAuthConfig } from './oauth.config';
export class OAuthGate {
  private readonly client?: OAuthIntrospectionClient;
  readonly metadataUrl?: string;
  constructor(private readonly config: OAuthConfig) {
    if (config.mode === 'oauth') {
      this.metadataUrl = new URL(
        '/.well-known/oauth-protected-resource/mcp',
        config.resource
      ).href;
      this.client = new OAuthIntrospectionClient({
        issuer: config.issuer,
        resource: config.resource,
        introspectionUrl: config.endpoint,
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        allowLocalHttp: config.issuer.startsWith('http://'),
      });
    }
  }
  async authorize(request: Request, response: Response): Promise<boolean> {
    if (request.method === 'OPTIONS') {
      response.setHeader('Allow', 'POST, GET, DELETE, OPTIONS');
      if (request.headers.origin) {
        response.setHeader(
          'Access-Control-Allow-Origin',
          request.headers.origin
        );
        response.setHeader('Vary', 'Origin');
      }
      response.setHeader(
        'Access-Control-Allow-Methods',
        'POST, GET, DELETE, OPTIONS'
      );
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Accept, MCP-Protocol-Version, MCP-Method, MCP-Name, MCP-Session-Id'
      );
      response.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate');
      response.status(204).end();
      return false;
    }
    if (this.config.mode === 'local-public') return true;
    if (request.headers.origin) {
      response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
      response.setHeader('Vary', 'Origin');
      response.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate');
    }
    response.setHeader('Cache-Control', 'no-store');
    try {
      const count = request.rawHeaders.filter(
        (value, i) => i % 2 === 0 && value.toLowerCase() === 'authorization'
      ).length;
      const query = new URL(request.originalUrl, this.config.resource)
        .searchParams;
      if (count > 1 || query.has('access_token') || query.has('token'))
        throw new OAuthVerificationError('invalid_token');
      const resource = this.config.resource;
      const auth = await verifyBearerToken(request.headers.authorization, {
        verifier: {
          verifyAccessToken: async (token) => {
            const principal = await this.client!.verifyAccessToken(token);
            if (
              principal.audience !== resource ||
              principal.expiresAt <= Math.floor(Date.now() / 1000)
            )
              throw new OAuthVerificationError('invalid_token');
            return {
              token,
              clientId: principal.clientId,
              scopes: [...principal.scopes],
              expiresAt: principal.expiresAt,
              resource: new URL(principal.audience),
              extra: { subject: principal.subject, issuer: principal.issuer },
            };
          },
        },
        requiredScopes: ['catalog:read'],
        expectedResource: new URL(resource),
        resourceMetadataUrl: this.metadataUrl,
      });
      (request as Request & { auth: AuthInfo }).auth = auth;
      return true;
    } catch (error: unknown) {
      if (
        error instanceof OAuthVerificationError &&
        error.category !== 'invalid_token'
      ) {
        response.status(503).json({ error: 'auth_unavailable' });
        return false;
      }
      if (error instanceof OAuthVerificationError) {
        response.setHeader(
          'WWW-Authenticate',
          `Bearer error="invalid_token", resource_metadata="${this.metadataUrl}"`
        );
        response.status(401).json({ error: 'invalid_token' });
        return false;
      }
      const challenge = bearerAuthChallengeResponse(error, {
        requiredScopes: ['catalog:read'],
        resourceMetadataUrl: this.metadataUrl,
      });
      challenge.headers.forEach((value, key) => response.setHeader(key, value));
      response.status(challenge.status).send(await challenge.text());
      return false;
    }
  }
}
