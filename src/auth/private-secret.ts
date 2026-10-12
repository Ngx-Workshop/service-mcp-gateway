import {
  constants,
  openSync,
  fstatSync,
  readFileSync,
  closeSync,
} from 'node:fs';
export function readPrivateSecret(path: string): string {
  const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = fstatSync(fd);
    if (
      !info.isFile() ||
      (info.mode & 0o777) !== 0o600 ||
      info.uid !== process.getuid?.() ||
      info.size > 4096
    )
      throw new Error('Invalid private secret file');
    const value = readFileSync(fd, 'utf8').trim();
    if (value.length < 32 || /[\s\0]/.test(value))
      throw new Error('Invalid secret');
    return value;
  } finally {
    closeSync(fd);
  }
}
