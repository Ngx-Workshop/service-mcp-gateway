const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

if (
  process.env.CI ||
  process.env.HUSKY === '0' ||
  process.env.NODE_ENV === 'production' ||
  !existsSync('.git') ||
  !existsSync('node_modules/husky/bin.js')
) {
  return;
}

const result = spawnSync(process.execPath, ['node_modules/husky/bin.js'], {
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status ?? 1);
