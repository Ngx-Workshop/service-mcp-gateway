const assert = require('node:assert/strict');
const {
  chmodSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} = require('node:fs');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawnSync } = require('node:child_process');

const repository = resolve(__dirname, '..');
const fixture = mkdtempSync(join(tmpdir(), 'gateway-formatting-'));

function run(command, args, expectedStatus = 0) {
  const result = spawnSync(command, args, {
    cwd: fixture,
    encoding: 'utf8',
    env: process.env,
  });
  assert.equal(
    result.status,
    expectedStatus,
    `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`
  );
  return result;
}

try {
  mkdirSync(join(fixture, '.husky'));
  mkdirSync(join(fixture, 'scripts'));
  mkdirSync(join(fixture, 'src'));
  mkdirSync(join(fixture, 'test'));
  copyFileSync(join(repository, 'package.json'), join(fixture, 'package.json'));
  copyFileSync(
    join(repository, '.prettierignore'),
    join(fixture, '.prettierignore')
  );
  copyFileSync(
    join(repository, '.husky/pre-commit'),
    join(fixture, '.husky/pre-commit')
  );
  copyFileSync(
    join(repository, 'scripts/prepare-husky.cjs'),
    join(fixture, 'scripts/prepare-husky.cjs')
  );
  chmodSync(join(fixture, '.husky/pre-commit'), 0o755);
  symlinkSync(join(repository, 'node_modules'), join(fixture, 'node_modules'));
  writeFileSync(
    join(fixture, 'src/sample.ts'),
    'export const value = 1;\nexport const stable = true;\n'
  );
  writeFileSync(join(fixture, 'test/sample.ts'), 'export const test = true;\n');

  run('git', ['init', '--quiet']);
  run('git', ['config', 'user.name', 'Formatting Test']);
  run('git', ['config', 'user.email', 'formatting@example.invalid']);
  run('git', ['add', '.']);
  run('git', ['commit', '--quiet', '--no-verify', '-m', 'baseline']);
  run(process.execPath, ['scripts/prepare-husky.cjs']);

  writeFileSync(
    join(fixture, 'src/sample.ts'),
    'export   const value=2\nexport const stable = true;\n'
  );
  run('git', ['add', 'src/sample.ts']);
  writeFileSync(
    join(fixture, 'src/sample.ts'),
    'export   const value=2\nexport const stable = true;\nexport   const unstaged=true\n'
  );
  run('git', ['commit', '--quiet', '-m', 'format staged content']);
  assert.equal(
    run('git', ['show', 'HEAD:src/sample.ts']).stdout,
    'export const value = 2;\nexport const stable = true;\n'
  );
  assert.equal(
    readFileSync(join(fixture, 'src/sample.ts'), 'utf8'),
    'export const value = 2;\nexport const stable = true;\nexport   const unstaged=true\n'
  );

  const formatCheck = run('npm', ['run', 'format:check'], 1);
  assert.match(
    formatCheck.stdout + formatCheck.stderr,
    /Code style issues found/
  );

  writeFileSync(join(fixture, '.husky/pre-commit'), 'exit 1\n');
  chmodSync(join(fixture, '.husky/pre-commit'), 0o755);
  run('git', ['add', 'src/sample.ts']);
  run('git', ['commit', '--quiet', '-m', 'must be blocked'], 1);
  assert.equal(
    run('git', ['show', 'HEAD:src/sample.ts']).stdout,
    'export const value = 2;\nexport const stable = true;\n'
  );
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
