import { bootstrap } from './bootstrap';
void bootstrap().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Catalog startup failed'
  );
  process.exitCode = 1;
});
