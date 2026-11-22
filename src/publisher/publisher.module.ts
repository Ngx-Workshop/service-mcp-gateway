import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CatalogConfigModule } from '../mcp/catalog-config.module';
import { PublishingProxyController } from './publishing-proxy.controller';

@Module({
  imports: [HttpModule, CatalogConfigModule],
  controllers: [PublishingProxyController],
})
export class PublisherModule {}
