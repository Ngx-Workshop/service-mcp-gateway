import { Module } from '@nestjs/common';
import { CATALOG_CONFIG, loadCatalogConfig } from './catalog.config';

@Module({
  providers: [
    {
      provide: CATALOG_CONFIG,
      useFactory: () => loadCatalogConfig(process.env),
    },
  ],
  exports: [CATALOG_CONFIG],
})
export class CatalogConfigModule {}
