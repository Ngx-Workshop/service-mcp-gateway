const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const workflow = fs.readFileSync(path.join(__dirname, '../.github/workflows/deploy.yml'), 'utf8');
const source = workflow.split("          node - <<'NODE'\n")[1].split('          NODE')[0]
  .split('\n').map(line => line.slice(10)).join('\n');
const sha = 'a'.repeat(40);

function execute(responses) {
  const calls = [];
  let exitCode;
  const exit = {};
  try {
    vm.runInNewContext(source, {
      require(name) {
        if (name === 'node:fs') return { readFileSync: () => JSON.stringify({ name: '@tmdjr/service-mcp-gateway-contracts', version: '1.1.0' }) };
        if (name === 'node:child_process') return {
          spawnSync(command, args) {
            calls.push([command, ...args]);
            assert.ok(responses.length, 'Unexpected npm command');
            return responses.shift();
          }
        };
        throw new Error(`Unexpected dependency: ${name}`);
      },
      process: { env: { GITHUB_RUN_NUMBER: '42', GITHUB_SHA: sha }, exit(code) { exitCode = code; throw exit; } },
      console: { log() {} }
    });
  } catch (error) {
    if (error !== exit) throw error;
  }
  return { calls, exitCode };
}

test('new version publishes deterministic version with provenance', () => {
  const result = execute([{ status: 1, stdout: JSON.stringify({ error: { code: 'E404' } }) }, { status: 0 }, { status: 0 }]);
  assert.equal(result.calls[1][2], '1.1.42');
  assert.deepEqual(result.calls[2], ['npm', 'publish', '--access', 'public', '--provenance']);
  assert.equal(result.exitCode, 0);
});
test('rerun skips already published same commit', () => {
  const result = execute([{ status: 0, stdout: JSON.stringify({ gitHead: sha }) }]);
  assert.equal(result.calls.length, 1);
  assert.equal(result.exitCode, 0);
});
test('version collision from another commit fails', () => {
  assert.throws(() => execute([{ status: 0, stdout: JSON.stringify({ gitHead: 'other' }) }]), /different commit/);
});
test('registry outage cannot be treated as an available version', () => {
  assert.throws(() => execute([{ status: 1, stdout: JSON.stringify({ error: { code: 'E503' } }) }]), /availability/);
});
test('publication failure fails job', () => {
  const result = execute([{ status: 1, stdout: JSON.stringify({ error: { code: 'E404' } }) }, { status: 0 }, { status: 1 }]);
  assert.equal(result.exitCode, 1);
});
