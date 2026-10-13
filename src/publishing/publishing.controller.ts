import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthClientService } from '@tmdjr/ngx-auth-client';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { json, type Request, type Response } from 'express';
import { z } from 'zod';
import { CATALOG_CONFIG, CatalogConfig } from '../mcp/catalog.config';
import { PublishingToolsService } from './publishing-tools.service';
import { PublisherIdentity } from './owner.client';
const BODY_BYTES = 8 * 1024 * 1024;
@ApiExcludeController()
@Controller()
export class PublishingController {
  constructor(
    private readonly tools: PublishingToolsService,
    private readonly auth: AuthClientService,
    @Inject(CATALOG_CONFIG) private readonly config: CatalogConfig
  ) {}
  async authorize(
    request: Request,
    response: Response
  ): Promise<PublisherIdentity | undefined> {
    if (!this.config.publishing) {
      response.status(404).json({ error: 'publishing_disabled' });
      return;
    }
    const origin = request.headers.origin;
    if (origin) {
      // Runtime boundary already checks Origin; restrict credentialed authoring to administrator UI.
      const allowed = this.config.runtime.production
        ? ['https://admin.ngx-workshop.io']
        : ['http://localhost:4201', 'http://127.0.0.1:4201'];
      if (!allowed.includes(origin)) {
        response.status(403).json({ error: 'publishing_origin_denied' });
        return;
      }
      response.setHeader('Access-Control-Allow-Origin', origin);
      response.setHeader('Access-Control-Allow-Credentials', 'true');
      response.setHeader('Vary', 'Origin');
    }
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'OPTIONS') {
      response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Authorization, Content-Type, Accept, MCP-Protocol-Version, MCP-Method, MCP-Name'
      );
      response.status(204).end();
      return;
    }
    const headers = request.rawHeaders.filter(
      (v, i) => i % 2 === 0 && v.toLowerCase() === 'authorization'
    );
    if (headers.length > 1) {
      response.status(401).json({ error: 'invalid_credentials' });
      return;
    }
    let token = request.headers.authorization?.match(/^Bearer ([^\s;]+)$/)?.[1];
    if (!token && origin) {
      const cookies =
        request.headers.cookie
          ?.split(';')
          .map((v) => v.trim())
          .filter((v) => v.startsWith('accessToken=')) ?? [];
      if (cookies.length === 1) token = cookies[0].slice('accessToken='.length);
    }
    if (!token || !/^[A-Za-z0-9_.-]+$/.test(token)) {
      response.status(401).json({ error: 'administrator_sign_in_required' });
      return;
    }
    // Validate only the selected credential. Never forward unrelated cookies or MCP catalog tokens.
    const authenticated = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;
    try {
      await this.auth.validateAccessToken(authenticated);
    } catch {
      response.status(401).json({ error: 'invalid_credentials' });
      return;
    }
    const user = (
      authenticated as Request & { user?: { sub?: string; role?: string } }
    ).user;
    if (user?.role !== 'admin' || !user.sub) {
      response.status(403).json({ error: 'administrator_required' });
      return;
    }
    return { token, subject: user.sub };
  }
  @All('mcp/publishing')
  async mcp(@Req() request: Request, @Res() response: Response) {
    const identity = await this.authorize(request, response);
    if (!identity) return;
    const handler = createMcpHandler(() => this.tools.createServer(identity), {
      legacy: 'stateless',
      responseMode: 'auto',
      maxRequestBodySize: BODY_BYTES,
    });
    try {
      await toNodeHandler(handler, { maxRequestBodySize: BODY_BYTES })(
        request,
        response
      );
    } finally {
      await handler.close();
    }
  }
  @All('publisher/tools')
  async run(@Req() request: Request, @Res() response: Response) {
    const identity = await this.authorize(request, response);
    if (!identity) return;
    if (request.method !== 'POST') {
      response.status(405).end();
      return;
    }
    try {
      await new Promise<void>((resolve, reject) =>
        json({ limit: BODY_BYTES })(request, response, (error) =>
          error ? reject(new Error('Invalid JSON body')) : resolve()
        )
      );
      const body = z
        .strictObject({ name: z.string(), input: z.unknown() })
        .parse(request.body);
      response.json(await this.tools.invoke(body.name, body.input, identity));
    } catch {
      response.status(400).json({ error: 'invalid_request' });
    }
  }
}
