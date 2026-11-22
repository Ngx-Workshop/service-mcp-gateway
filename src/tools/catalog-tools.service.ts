import { Injectable, Logger } from '@nestjs/common';
import { McpServer, CallToolResult } from '@modelcontextprotocol/server';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { CatalogClient } from '../clients/catalog.client';
import { safeCatalogError } from '../clients/catalog-error';
import { catalogDefinitions } from './catalog.schemas';
import { RequestContext } from '../observability/request-context';

@Injectable()
export class CatalogToolsService {
  private readonly logger = new Logger(CatalogToolsService.name);

  constructor(
    private readonly catalog: CatalogClient,
    private readonly requestContext: RequestContext
  ) {}
  createServer(): McpServer {
    const server = new McpServer({
      name: 'ngx-workshop-catalog',
      version: '0.1.0',
    });
    server.registerTool(
      'list_workshops',
      catalogDefinitions.list_workshops,
      ({ sectionId }) =>
        this.result(
          'list_workshops',
          catalogDefinitions.list_workshops.outputSchema,
          () => firstValueFrom(this.catalog.listWorkshops(sectionId))
        )
    );
    server.registerTool(
      'get_workshop',
      catalogDefinitions.get_workshop,
      ({ sectionId, workshopId }) =>
        this.result(
          'get_workshop',
          catalogDefinitions.get_workshop.outputSchema,
          () => firstValueFrom(this.catalog.getWorkshop(sectionId, workshopId))
        )
    );
    server.registerTool(
      'get_coding_lab',
      catalogDefinitions.get_coding_lab,
      ({ labId, versionId }) =>
        this.result(
          'get_coding_lab',
          catalogDefinitions.get_coding_lab.outputSchema,
          () => firstValueFrom(this.catalog.getCodingLab(labId, versionId))
        )
    );
    return server;
  }
  private async result<T extends Record<string, unknown>>(
    operation: string,
    schema: z.ZodType<T>,
    execute: () => Promise<T>
  ): Promise<CallToolResult> {
    const started = process.hrtime.bigint();
    try {
      const structuredContent = schema.parse(await execute());
      this.logger.log(this.entry(operation, 'success', started));
      return {
        structuredContent,
        content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
      };
    } catch (error: unknown) {
      const safe = safeCatalogError(error);
      const entry = this.entry(operation, 'failure', started, safe.code);
      if (['NOT_FOUND', 'FORBIDDEN'].includes(safe.code))
        this.logger.warn(entry);
      else this.logger.error(entry);
      // Error content deliberately does not pretend to satisfy the success output schema.
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: { code: safe.code, message: safe.message },
            }),
          },
        ],
      };
    }
  }

  private entry(
    operation: string,
    outcome: 'success' | 'failure',
    started: bigint,
    errorCode?: string
  ) {
    const requestId = this.requestContext.requestId;
    return {
      event: 'catalog_tool_call',
      operation,
      outcome,
      durationMs: Math.round(Number(process.hrtime.bigint() - started) / 1e6),
      ...(requestId ? { requestId } : {}),
      ...(errorCode ? { errorCode } : {}),
    };
  }
}
