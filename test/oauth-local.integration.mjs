import 'reflect-metadata';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createServer } from 'node:net';
import { createServer as createHttpServer } from 'node:http';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const root = resolve(process.env.AUTH_SERVICE_ROOT ?? '../service-auth');
const { startMongoFixture } = await import(
  pathToFileURL(join(root, 'spikes/oauth-engine/mongo-fixture.mjs')).href
);
async function port() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const value = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return value;
}
let stage = 'owner availability';
async function main() {
  // Owner services must already be running; use only their public read APIs.
  const document = process.env.DOCUMENT_BASE_URL ?? 'http://127.0.0.1:3007',
    labs = process.env.CODING_LABS_BASE_URL ?? 'http://127.0.0.1:3009';
  for (const value of [document, labs]) {
    const url = new URL(value);
    assert(
      ['127.0.0.1', 'localhost'].includes(url.hostname) &&
        url.protocol === 'http:' &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash,
      'Only local owner URLs permitted'
    );
  }
  for (const url of [
    document + '/navigation/sections',
    labs + '/published-labs',
  ])
    assert.equal(
      (
        await fetch(url, {
          redirect: 'error',
          signal: AbortSignal.timeout(5000),
        })
      ).status,
      200,
      'Start real local owners first'
    );
  let mongo, authApp, gateway, stub, directory;
  const secrets = [];
  try {
    stage = 'isolated auth startup';
    const authPort = await port(),
      gatewayPort = await port();
    directory = await mkdtemp(join(tmpdir(), 'gateway-oauth-local-'));
    const file = join(directory, 'config.json');
    execFileSync(
      process.execPath,
      [join(root, 'scripts/oauth-local-config.mjs'), file],
      { stdio: 'pipe' }
    );
    const config = JSON.parse(await readFile(file, 'utf8'));
    config.issuer = `http://127.0.0.1:${authPort}`;
    config.resource = `http://127.0.0.1:${gatewayPort}/mcp`;
    await writeFile(file, JSON.stringify(config), { mode: 0o600 });
    secrets.push(config.resourceClient.secret);
    mongo = await startMongoFixture();
    stub = createHttpServer((req, res) => {
      req.resume();
      res.end('{}');
    });
    await new Promise((resolve) => stub.listen(0, '127.0.0.1', resolve));
    Object.assign(process.env, {
      NODE_ENV: 'development',
      OAUTH_ENABLED: 'true',
      OAUTH_LOCAL_DEV: 'true',
      OAUTH_CONFIG_FILE: file,
      PORT: String(authPort),
      MONGODB_URI: `mongodb://127.0.0.1:${mongo.client.options.hosts[0].port}/${mongo.db.databaseName}?replicaSet=oauthSpike`,
      JWT_SECRET: randomBytes(32).toString('base64url'),
      JWT_ISSUER: 'local-fixture',
      JWT_AUDIENCE: 'local-fixture',
      USER_METADATA_URL: `http://127.0.0.1:${stub.address().port}`,
    });
    require(join(root, 'node_modules/@nestjs/common')).Logger.overrideLogger(
      false
    );
    const { createAuthApp } = require(join(root, 'dist/src/bootstrap.js'));
    ({ app: authApp } = await createAuthApp());
    await authApp.listen(authPort, '127.0.0.1');
    const password = 'LocalFixture1!' + randomBytes(8).toString('hex'),
      email = `local-${randomBytes(8).toString('hex')}@example.test`;
    secrets.push(password);
    assert.equal(
      (
        await fetch(config.issuer + '/sign-up', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
      ).status,
      201
    );
    Object.assign(process.env, {
      PORT: String(gatewayPort),
      MCP_AUTH_MODE: 'oauth',
      MCP_LOCAL_DEV: 'true',
      MCP_RESOURCE_URL: config.resource,
      AUTH_ISSUER_URL: config.issuer,
      AUTH_INTROSPECTION_URL: config.issuer + '/oauth/introspect',
      AUTH_INTROSPECTION_CLIENT_ID: config.resourceClient.id,
      AUTH_INTROSPECTION_CLIENT_SECRET: config.resourceClient.secret,
      DOCUMENT_BASE_URL: document,
      CODING_LABS_BASE_URL: labs,
    });
    require('@nestjs/common').Logger.overrideLogger(false);
    const { createCatalogApp } = require('../dist/bootstrap.js');
    gateway = await createCatalogApp();
    await gateway.listen(gatewayPort, '127.0.0.1');
    const metadata = await (
      await fetch(
        new URL('/.well-known/oauth-protected-resource/mcp', config.resource)
      )
    ).json();
    assert.equal(metadata.resource, config.resource);
    assert.deepEqual(metadata.authorization_servers, [config.issuer]);
    assert.equal(
      (await fetch(config.resource, { method: 'POST', body: 'bad-json' }))
        .status,
      401
    );
    async function mint() {
      const cookies = new Map(),
        verifier = randomBytes(32).toString('base64url'),
        state = randomBytes(16).toString('hex');
      let path =
        '/oauth/authorize?' +
        new URLSearchParams({
          client_id: 'ngx-workshop-local',
          redirect_uri: 'http://127.0.0.1:39999/callback',
          response_type: 'code',
          scope: 'catalog:read',
          resource: config.resource,
          state,
          code_challenge: createHash('sha256')
            .update(verifier)
            .digest('base64url'),
          code_challenge_method: 'S256',
        });
      const cookie = () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
      const save = (res) => {
        for (const value of res.headers.getSetCookie()) {
          const pair = value.split(';')[0],
            i = pair.indexOf('=');
          cookies.set(pair.slice(0, i), pair.slice(i + 1));
        }
      };
      for (let step = 0; step < 14; step++) {
        const res = await fetch(new URL(path, config.issuer), {
          redirect: 'manual',
          headers: { cookie: cookie() },
          signal: AbortSignal.timeout(10000),
        });
        save(res);
        const location = res.headers.get('location');
        if (location) {
          const target = new URL(location, config.issuer);
          if (target.origin !== config.issuer) {
            assert.equal(target.origin, 'http://127.0.0.1:39999');
            assert.equal(target.searchParams.get('state'), state);
            assert.equal(target.searchParams.get('iss'), config.issuer);
            const code = target.searchParams.get('code');
            assert(code);
            const exchange = await fetch(config.issuer + '/oauth/token', {
              method: 'POST',
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: 'ngx-workshop-local',
                redirect_uri: 'http://127.0.0.1:39999/callback',
                resource: config.resource,
                code,
                code_verifier: verifier,
              }),
            });
            assert.equal(exchange.status, 200);
            const body = await exchange.json();
            secrets.push(body.access_token);
            return { token: body.access_token, cookie: cookie() };
          }
          path = target.href;
          continue;
        }
        const html = await res.text();
        const csrf = html.match(/name="csrf" value="([^"]+)"/)?.[1];
        assert(csrf, 'Real browser form required');
        const login = html.includes('<h1>Sign in</h1>');
        if (!login)
          assert(
            html.includes(config.resource) && html.includes('catalog:read')
          );
        const submitted = await fetch(new URL(path, config.issuer), {
          method: 'POST',
          redirect: 'manual',
          headers: {
            origin: config.issuer,
            cookie: cookie(),
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            csrf,
            ...(login
              ? { email, password, action: 'login' }
              : { action: 'allow' }),
          }),
        });
        save(submitted);
        assert.equal(submitted.status, 303);
        path = submitted.headers.get('location');
      }
      throw new Error('Authorization did not complete');
    }
    stage = 'login, consent and PKCE exchange';
    const first = await mint();
    stage = 'real catalog tools';
    // Existing exhaustive catalog runner compares every tool to public owner reads
    // in both SDK eras, including pinned versions and negative resource cases.
    await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ['-r', 'ts-node/register', 'test/live-catalog.integration.ts'],
        {
          env: {
            ...process.env,
            MCP_GATEWAY_URL: config.resource,
            MCP_BEARER_TOKEN: first.token,
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      let output = '';
      for (const stream of [child.stdout, child.stderr])
        stream.on('data', (chunk) => {
          output += String(chunk);
        });
      child.on('error', reject);
      child.on('exit', (code) => {
        for (const secret of secrets)
          output = output.replaceAll(secret, '[redacted]');
        process.stdout.write(output);
        code === 0
          ? resolve()
          : reject(new Error('Real catalog verification failed'));
      });
    });
    stage = 'token revocation';
    assert.equal(
      (
        await fetch(config.issuer + '/oauth/revoke', {
          method: 'POST',
          body: new URLSearchParams({
            token: first.token,
            client_id: 'ngx-workshop-local',
          }),
        })
      ).status,
      200
    );
    for (const method of ['POST', 'GET', 'DELETE'])
      assert.equal(
        (
          await fetch(config.resource, {
            method,
            headers: { authorization: `Bearer ${first.token}` },
          })
        ).status,
        401
      );
    stage = 'browser grant revocation';
    const second = await mint();
    const page = await (
      await fetch(config.issuer + '/oauth/grants', {
        headers: { cookie: second.cookie },
      })
    ).text();
    const form = page.match(
      /<form[^>]*>.*?name="csrf" value="([^"]+)".*?name="grant" value="([^"]+)"/s
    );
    assert(form);
    // Revoke all listed grants, since earlier independent browser logins may coexist.
    for (const match of page.matchAll(
      /<form[^>]*>.*?name="csrf" value="([^"]+)".*?name="grant" value="([^"]+)"/gs
    ))
      assert.equal(
        (
          await fetch(config.issuer + '/oauth/grants', {
            method: 'POST',
            redirect: 'manual',
            headers: { origin: config.issuer, cookie: second.cookie },
            body: new URLSearchParams({ csrf: match[1], grant: match[2] }),
          })
        ).status,
        303
      );
    assert.equal(
      (
        await fetch(config.resource, {
          method: 'POST',
          headers: { authorization: `Bearer ${second.token}` },
        })
      ).status,
      401
    );
    stage = 'auth outage';
    await authApp.close();
    authApp = undefined;
    assert.equal(
      (
        await fetch(config.resource, {
          method: 'POST',
          headers: { authorization: 'Bearer ' + 'a'.repeat(43) },
        })
      ).status,
      503
    );
    console.log(
      'PASS: real OAuth login/consent, modern+legacy tools, token/grant revocation and auth outage.'
    );
  } finally {
    await gateway?.close();
    await authApp?.close();
    await mongo?.close();
    if (stub) await new Promise((resolve) => stub.close(resolve));
    if (directory) await rm(directory, { recursive: true, force: true });
  }
}
await main().catch(() => {
  console.error(`Local OAuth integration failed at: ${stage}.`);
  process.exitCode = 1;
});
