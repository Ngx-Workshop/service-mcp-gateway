import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { HttpService } from '@nestjs/axios';
import { raw, type Request, type Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { CATALOG_CONFIG, CatalogConfig } from '../mcp/catalog.config';
const BODY_BYTES = 8 * 1024 * 1024;
// Compatibility transport only. Publisher owns authorization and all tool behavior.
@ApiExcludeController()
@Controller()
export class PublishingProxyController {
  constructor(
    private readonly http: HttpService,
    @Inject(CATALOG_CONFIG) private readonly config: CatalogConfig
  ) {}
  @All(['publisher/tools', 'mcp/publishing'])
  async forward(@Req() request: Request, @Res() response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    if (!this.config.publisherBaseUrl) {
      response.status(404).json({ error: 'publishing_disabled' });
      return;
    }
    if (
      request.rawHeaders.filter(
        (value, index) =>
          index % 2 === 0 && value.toLowerCase() === 'authorization'
      ).length > 1
    ) {
      response.status(401).json({ error: 'invalid_credentials' });
      return;
    }
    try {
      // Buffer bounded bytes, without interpreting JSON or accepting compressed bodies.
      await new Promise<void>((resolve, reject) =>
        raw({ type: () => true, limit: BODY_BYTES, inflate: false })(
          request,
          response,
          (error: unknown) =>
            error ? reject(new Error('Invalid body')) : resolve()
        )
      );
    } catch {
      response.status(413).json({ error: 'invalid_request_body' });
      return;
    }
    const headers: Record<string, string> = {};
    for (const name of [
      'authorization',
      'cookie',
      'origin',
      'content-type',
      'accept',
      'mcp-protocol-version',
      'mcp-method',
      'mcp-name',
      'last-event-id',
    ]) {
      const value = request.headers[name];
      if (typeof value === 'string') headers[name] = value;
    }
    const path =
      request.path === '/publisher/tools'
        ? '/publisher/tools'
        : '/mcp/publishing';
    try {
      const upstream = await firstValueFrom(
        this.http.request<Buffer>({
          url: this.config.publisherBaseUrl + path,
          method: request.method,
          headers,
          data: request.body as Buffer | undefined,
          responseType: 'arraybuffer',
          timeout: 600000,
          maxRedirects: 0,
          maxBodyLength: BODY_BYTES,
          maxContentLength: BODY_BYTES,
          proxy: false,
          validateStatus: () => true,
        })
      );
      for (const name of [
        'content-type',
        'cache-control',
        'access-control-allow-origin',
        'access-control-allow-credentials',
        'access-control-allow-methods',
        'access-control-allow-headers',
        'vary',
        'www-authenticate',
        'allow',
      ]) {
        const value = upstream.headers[name] as unknown;
        if (typeof value === 'string') response.setHeader(name, value);
      }
      response.status(upstream.status).send(upstream.data);
    } catch {
      response.status(502).json({ error: 'publisher_unavailable' });
    }
  }
}
