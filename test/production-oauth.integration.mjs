// Explicit opt-in launch acceptance, using an operator-owned temporary auth account.
// Never follows the external ChatGPT callback or prints tokens/passwords.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
const issuer = 'https://auth.ngx-workshop.io',
  resource = 'https://mcp.ngx-workshop.io/mcp';
const client = 'ngx-workshop-chatgpt-prod',
  redirect = 'https://chatgpt.com/connector_platform_oauth_redirect';
const login = JSON.parse(
  await readFile(process.env.MCP_TEST_LOGIN_FILE, 'utf8')
);
const request = (url, options = {}) =>
  fetch(url, {
    ...options,
    redirect: 'manual',
    signal: AbortSignal.timeout(15000),
  });
async function mint(deny = false) {
  const cookies = new Map(),
    verifier = randomBytes(32).toString('base64url'),
    state = randomBytes(16).toString('hex');
  const cookie = () => [...cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  const save = (res) => {
    for (const item of res.headers.getSetCookie()) {
      assert(/;\s*secure(?:;|$)/i.test(item), 'OAuth cookies must be secure');
      const pair = item.split(';')[0],
        i = pair.indexOf('=');
      cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
  };
  let path =
    issuer +
    '/oauth/authorize?' +
    new URLSearchParams({
      client_id: client,
      redirect_uri: redirect,
      response_type: 'code',
      scope: 'catalog:read',
      resource,
      state,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256',
    });
  for (let step = 0; step < 16; step++) {
    const res = await request(path, { headers: { cookie: cookie() } });
    save(res);
    const location = res.headers.get('location');
    if (location) {
      const target = new URL(location, issuer);
      if (target.origin !== issuer) {
        assert.equal(target.origin, new URL(redirect).origin);
        assert.equal(target.pathname, new URL(redirect).pathname);
        assert.equal(target.searchParams.get('state'), state);
        assert.equal(target.searchParams.get('iss'), issuer);
        if (deny) {
          assert.equal(target.searchParams.get('error'), 'access_denied');
          console.log('RFC9207 issuer binding on denied consent PASS.');
          return;
        }
        const code = target.searchParams.get('code');
        assert(code);
        const exchange = await request(issuer + '/oauth/token', {
          method: 'POST',
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: client,
            redirect_uri: redirect,
            resource,
            code,
            code_verifier: verifier,
          }),
        });
        assert.equal(exchange.status, 200, 'PKCE exchange');
        const body = await exchange.json();
        assert.equal(body.scope, 'catalog:read');
        assert.equal(body.expires_in, 600);
        assert(!body.refresh_token);
        return { token: body.access_token, cookie: cookie() };
      }
      path = target.href;
      continue;
    }
    assert.equal(res.status, 200, 'Browser interaction must succeed');
    const html = await res.text(),
      csrf = html.match(/name="csrf" value="([^"]+)"/)?.[1];
    assert(csrf);
    const signingIn = html.includes('<h1>Sign in</h1>');
    if (!signingIn)
      assert(html.includes(resource) && html.includes('catalog:read'));
    const submitted = await request(path, {
      method: 'POST',
      headers: { origin: issuer, cookie: cookie() },
      body: new URLSearchParams({
        csrf,
        ...(signingIn
          ? { email: login.email, password: login.password, action: 'login' }
          : { action: deny ? 'deny' : 'allow' }),
      }),
    });
    save(submitted);
    assert.equal(submitted.status, 303, 'Login/consent submit');
    path = new URL(submitted.headers.get('location'), issuer).href;
  }
  throw Error('OAuth did not complete');
}
let stage = 'public discovery';
try {
  const discovery = await request(
    issuer + '/.well-known/oauth-authorization-server'
  );
  assert.equal(discovery.status, 200);
  const metadata = await discovery.json();
  assert.equal(metadata.issuer, issuer);
  assert.equal(metadata.authorization_response_iss_parameter_supported, true);
  assert.deepEqual(metadata.scopes_supported, ['catalog:read']);
  assert.deepEqual(metadata.token_endpoint_auth_methods_supported.sort(), [
    'client_secret_basic',
    'none',
  ]);
  const protectedMetadata = await (
    await request(
      'https://mcp.ngx-workshop.io/.well-known/oauth-protected-resource/mcp'
    )
  ).json();
  assert.equal(protectedMetadata.resource, resource);
  assert.deepEqual(protectedMetadata.authorization_servers, [issuer]);
  assert.equal(
    (await request(resource, { method: 'POST', body: 'bad-json' })).status,
    401
  );
  assert.equal(
    (
      await request(resource, {
        method: 'POST',
        headers: { origin: 'https://unapproved.example' },
        body: 'bad-json',
      })
    ).status,
    403
  );
  stage = 'real login consent PKCE';
  const session = await mint();
  try {
    console.log(
      'Public HTTPS discovery, secure cookies, real login/consent and PKCE PASS.'
    );
    if (process.env.MCP_AUTH_RESTART_CHECK === 'true') {
      execFileSync(
        'ssh',
        ['root@24.144.98.154', 'docker restart ngx-auth-service'],
        { stdio: 'pipe' }
      );
      let ready = false;
      for (let attempt = 0; attempt < 30; attempt++) {
        try {
          ready =
            (await request(issuer + '/.well-known/oauth-authorization-server'))
              .status === 200;
        } catch {}
        if (ready) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      assert(ready, 'Auth restart readiness');
      assert.equal(
        (
          await request(issuer + '/oauth/grants', {
            headers: { cookie: session.cookie },
          })
        ).status,
        200
      );
      console.log(
        'Persistent production keys and browser session across auth restart PASS.'
      );
    }

    stage = 'real catalog tools';
    await new Promise((resolve, reject) => {
      const child = spawn(
        process.execPath,
        ['-r', 'ts-node/register', 'test/live-catalog.integration.ts'],
        {
          env: {
            ...process.env,
            MCP_VERIFY_PRODUCTION: 'true',
            MCP_GATEWAY_URL: resource,
            DOCUMENT_BASE_URL: 'https://beta.ngx-workshop.io/api/documents',
            CODING_LABS_BASE_URL:
              'https://beta.ngx-workshop.io/api/coding-labs',
            MCP_BEARER_TOKEN: session.token,
          },
          stdio: ['ignore', 'pipe', 'pipe'],
        }
      );
      let output = '';
      for (const stream of [child.stdout, child.stderr])
        stream.on('data', (x) => {
          output += x;
        });
      child.on('error', reject);
      child.on('exit', (code) => {
        process.stdout.write(
          output
            .replaceAll(session.token, '[redacted]')
            .replaceAll(login.password, '[redacted]')
        );
        code === 0
          ? resolve()
          : reject(Error('Real production catalog checks failed'));
      });
    });
  } finally {
    const revoked = await request(issuer + '/oauth/revoke', {
      method: 'POST',
      body: new URLSearchParams({ token: session.token, client_id: client }),
    });
    assert.equal(revoked.status, 200);
    for (const method of ['POST', 'GET', 'DELETE'])
      assert.equal(
        (
          await request(resource, {
            method,
            headers: { authorization: 'Bearer ' + session.token },
          })
        ).status,
        401
      );
    console.log('Immediate public token revocation enforcement PASS.');
  }

  stage = 'browser grant revocation';
  const browserSession = await mint();
  const grantsPage = await request(issuer + '/oauth/grants', {
    headers: { cookie: browserSession.cookie },
  });
  assert.equal(grantsPage.status, 200);
  const html = await grantsPage.text();
  const forms = [
    ...html.matchAll(
      /<form[^>]*>.*?name="csrf" value="([^"]+)".*?name="grant" value="([^"]+)"/gs
    ),
  ];
  assert(forms.length > 0);
  for (const form of forms) {
    const response = await request(issuer + '/oauth/grants', {
      method: 'POST',
      headers: { cookie: browserSession.cookie, origin: issuer },
      body: new URLSearchParams({ csrf: form[1], grant: form[2] }),
    });
    assert.equal(response.status, 303);
  }
  assert.equal(
    (
      await request(resource, {
        method: 'POST',
        headers: { authorization: 'Bearer ' + browserSession.token },
        body: 'bad-json',
      })
    ).status,
    401
  );
  console.log('Public browser grant revocation enforcement PASS.');
  stage = 'denied consent issuer binding';
  await mint(true);
  console.log('Production acceptance PASS.');
} catch {
  console.error(
    'Production acceptance failed at ' +
      stage +
      '; sensitive output suppressed.'
  );
  process.exitCode = 1;
}
