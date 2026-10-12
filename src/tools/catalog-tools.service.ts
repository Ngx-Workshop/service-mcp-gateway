import { Injectable } from '@nestjs/common';
import { McpServer, CallToolResult } from '@modelcontextprotocol/server';
import { firstValueFrom } from 'rxjs';
import { z } from 'zod';
import { CatalogClient } from '../clients/catalog.client';
import { safeCatalogError } from '../clients/catalog-error';
import { catalogDefinitions } from './catalog.schemas';

@Injectable()
export class CatalogToolsService {
  constructor(private readonly catalog: CatalogClient) {}
  createServer(): McpServer {
    const server = new McpServer({
      name: 'ngx-workshop-catalog',
      version: '0.1.0',
    });
    server.registerTool(
      'list_workshops',
      catalogDefinitions.list_workshops,
      ({ sectionId }) =>
        this.result(catalogDefinitions.list_workshops.outputSchema, () =>
          firstValueFrom(this.catalog.listWorkshops(sectionId))
        )
    );
    server.registerTool(
      'get_workshop',
      catalogDefinitions.get_workshop,
      ({ sectionId, workshopId }) =>
        this.result(catalogDefinitions.get_workshop.outputSchema, () =>
          firstValueFrom(this.catalog.getWorkshop(sectionId, workshopId))
        )
    );
    server.registerTool(
      'get_coding_lab',
      catalogDefinitions.get_coding_lab,
      ({ labId, versionId }) =>
        this.result(catalogDefinitions.get_coding_lab.outputSchema, () =>
          firstValueFrom(this.catalog.getCodingLab(labId, versionId))
        )
    );
    return server;
  }
  private async result<T extends Record<string, unknown>>(
    schema: z.ZodType<T>,
    execute: () => Promise<T>
  ): Promise<CallToolResult> {
    try {
      const structuredContent = schema.parse(await execute());
      return {
        structuredContent,
        content: [{ type: 'text', text: JSON.stringify(structuredContent) }],
      };
    } catch (error: unknown) {
      const safe = safeCatalogError(error);
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
}
