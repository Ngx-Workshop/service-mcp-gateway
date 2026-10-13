"""Failure-path tests without Docker or production access."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('deployment', Path(__file__).with_name('deploy-production.py'))
deployment = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deployment)
REVISION = 'a' * 40
IMAGE = 'sha256:' + 'b' * 64


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'image.tar').write_bytes(b'validated image')
        (self.root / 'image.tar.sha256').write_text(hashlib.sha256(b'validated image').hexdigest() + '  image.tar\n')
        (self.root / 'image-id.txt').write_text(IMAGE)
        self.env = self.root / 'runtime.env'
        self.env.write_text('PORT=3011\nRUNTIME_PROFILE=production\nMCP_AUTH_MODE=oauth\nPUBLISHING_ENABLED=true\nPUBLISHING_JOURNAL_DIRECTORY=/var/lib/ngx-publishing\nAUTH_INTROSPECTION_SECRET_FILE=/run/secrets/introspection\nOPENAI_API_KEY=private-test-value\n')
        self.env.chmod(0o600)
        self.secret = self.root / 'introspection'
        self.secret.touch()
        self.calls = []
        self.ready = True
        self.fail_run = False
        self.bad_image = False

    def docker(self, *args):
        self.calls.append(args)
        if args[:2] == ('image', 'inspect'):
            return ('sha256:' + 'c' * 64 if self.bad_image else IMAGE) if args[2].endswith(':candidate') else REVISION
        if args[0] == 'run' and self.fail_run:
            raise subprocess.CalledProcessError(1, args)
        if args[0] == 'exec':
            if not self.ready:
                raise subprocess.CalledProcessError(1, args)
            return json.dumps({'resource': 'https://mcp.ngx-workshop.io/mcp'})
        return ''

    def deploy(self):
        # Only root ownership is mocked; real temporary permission checks still run.
        info = self.env.stat()
        with patch.object(deployment, 'ENV', self.env), patch.object(deployment, 'SECRET', self.secret), \
             patch.object(deployment, 'docker', self.docker), patch.object(deployment.time, 'sleep'), \
             patch.object(Path, 'stat', autospec=True) as stat:
            # ENV.stat and SECRET.is_file need a usable stat result.
            stat.return_value = type('Stat', (), {'st_uid': 0, 'st_mode': info.st_mode})()
            deployment.deploy(self.root, REVISION, '123-1')

    def test_success_preserves_runtime_and_volume(self):
        before = self.env.read_bytes()
        self.deploy()
        self.assertEqual(self.env.read_bytes(), before)
        run = next(args for args in self.calls if args[0] == 'run')
        self.assertIn('type=volume,source=ngx-publisher-runs,target=/var/lib/ngx-publishing', run)
        self.assertIn('--read-only', run)
        self.assertNotIn('-p', run)
        self.assertNotIn('private-test-value', str(self.calls))
        self.assertNotIn(('start', deployment.NAME), self.calls)

    def test_checksum_rejected_before_docker(self):
        (self.root / 'image.tar').write_bytes(b'corrupt')
        with self.assertRaisesRegex(RuntimeError, 'checksum'):
            self.deploy()
        self.assertEqual(self.calls, [])

    def test_wrong_image_rejected_before_stopping(self):
        self.bad_image = True
        with self.assertRaisesRegex(RuntimeError, 'validated commit'):
            self.deploy()
        self.assertNotIn(('stop', deployment.NAME), self.calls)

    def test_readiness_failure_restores_previous(self):
        self.ready = False
        with self.assertRaisesRegex(RuntimeError, 'previous container restored'):
            self.deploy()
        self.assertEqual(self.calls[-3:], [('rm', '-f', deployment.NAME), ('rename', deployment.NAME + '.before-ci-123-1', deployment.NAME), ('start', deployment.NAME)])

    def test_run_failure_restores_previous(self):
        self.fail_run = True
        with self.assertRaisesRegex(RuntimeError, 'previous container restored'):
            self.deploy()
        self.assertEqual(self.calls[-1], ('start', deployment.NAME))


if __name__ == '__main__':
    unittest.main()
