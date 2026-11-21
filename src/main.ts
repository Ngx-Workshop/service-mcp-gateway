import { bootstrap } from './bootstrap';
import { createServiceLogger } from './observability/observability';
void bootstrap().catch(() => {
  createServiceLogger().error('Catalog startup failed', 'Bootstrap');
  process.exitCode = 1;
});
