import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { OAuthMetadataController } from '../auth/oauth-metadata.controller';
import { CatalogClient } from '../clients/catalog.client';
import { ObservabilityModule } from '../observability/observability.module';
import { CatalogToolsService } from '../tools/catalog-tools.service';
import { CatalogConfigModule } from './catalog-config.module';
import { McpController } from './mcp.controller';

@Module({
  imports: [HttpModule, CatalogConfigModule, ObservabilityModule],
  controllers: [McpController, OAuthMetadataController],
  providers: [CatalogClient, CatalogToolsService],
})
export class CatalogModule {}
