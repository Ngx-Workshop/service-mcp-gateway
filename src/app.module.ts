import { ObservabilityModule } from './observability/observability.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CatalogConfigModule } from './mcp/catalog-config.module';
import { CatalogModule } from './mcp/catalog.module';
import { PublisherModule } from './publisher/publisher.module';

@Module({
  imports: [
    ObservabilityModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CatalogConfigModule,
    CatalogModule,
    PublisherModule,
  ],
})
export class AppModule {}
