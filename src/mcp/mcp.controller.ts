import {
  All,
  Controller,
  Inject,
  OnModuleDestroy,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import type { Request, Response } from 'express';
import { CatalogToolsService } from '../tools/catalog-tools.service';
import { OAuthGate } from '../auth/oauth-gate';
import { CATALOG_CONFIG, CatalogConfig, REQUEST_BYTES } from './catalog.config';

@ApiExcludeController()
@Controller('mcp')
export class McpController implements OnModuleDestroy {
  private readonly handler;
  private readonly nodeHandler;
  private readonly gate: OAuthGate;
  constructor(
    tools: CatalogToolsService,
    @Inject(CATALOG_CONFIG) config: CatalogConfig
  ) {
    this.gate = new OAuthGate(config.auth);
    this.handler = createMcpHandler(() => tools.createServer(), {
      legacy: 'stateless',
      responseMode: 'auto',
      maxRequestBodySize: REQUEST_BYTES,
    });
    this.nodeHandler = toNodeHandler(this.handler, {
      maxRequestBodySize: REQUEST_BYTES,
    });
  }
  @All()
  async handle(@Req() request: Request, @Res() response: Response) {
    if (await this.gate.authorize(request, response))
      await this.nodeHandler(request, response);
  }
  async onModuleDestroy() {
    await this.handler.close();
  }
}
