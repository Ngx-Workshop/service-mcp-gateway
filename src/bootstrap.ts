import { validateDependencies } from './auth/readiness';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CATALOG_CONFIG, CatalogConfig } from './mcp/catalog.config';
import { productionBoundary } from './auth/production-boundary';
import { localBoundary } from './mcp/local-boundary';

export async function createCatalogApp() {
  // Let the official SDK parse bounded MCP request bodies.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get<CatalogConfig>(CATALOG_CONFIG);
  app.use(
    config.runtime.production ? productionBoundary(config) : localBoundary
  );
  try {
    if (config.runtime.production) await validateDependencies(config);
  } catch (error) {
    await app.close();
    throw error;
  }
  app.enableShutdownHooks();
  return app;
}
export async function bootstrap() {
  const app = await createCatalogApp();
  const config = app.get<CatalogConfig>(CATALOG_CONFIG);
  await app.listen(config.port, config.runtime.bind);
  return app;
}
