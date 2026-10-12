import { OAuthMetadataController } from './auth/oauth-metadata.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CatalogClient } from './clients/catalog.client';
import { CatalogToolsService } from './tools/catalog-tools.service';
import { McpController } from './mcp/mcp.controller';
import { CATALOG_CONFIG, loadCatalogConfig } from './mcp/catalog.config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [McpController, OAuthMetadataController],
  providers: [
    CatalogClient,
    CatalogToolsService,
    {
      provide: CATALOG_CONFIG,
      useFactory: () => loadCatalogConfig(process.env),
    },
  ],
})
export class AppModule {}
