import { AuthClientService } from '@tmdjr/ngx-auth-client';
import { PublishingController } from './publishing/publishing.controller';
import { PublishingOwnerClient } from './publishing/owner.client';
import { PublishingRunService } from './publishing/publishing-run.service';
import { PublishingToolsService } from './publishing/publishing-tools.service';
import { DraftAgentService } from './publishing/draft-agent.service';
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
  controllers: [McpController, OAuthMetadataController, PublishingController],
  providers: [
    AuthClientService,
    PublishingOwnerClient,
    PublishingRunService,
    PublishingToolsService,
    DraftAgentService,
    CatalogClient,
    CatalogToolsService,
    {
      provide: CATALOG_CONFIG,
      useFactory: () => loadCatalogConfig(process.env),
    },
  ],
})
export class AppModule {}
