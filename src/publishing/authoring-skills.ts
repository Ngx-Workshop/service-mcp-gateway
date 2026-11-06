import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const names = [
  'plan-workshop',
  'write-workshop-documentation',
  'write-workshop-lab',
  'write-workshop-assessment',
] as const;
export function authoringSkills() {
  return names.map((name) => {
    const instructions = readFileSync(
      join(__dirname, 'skills', name, 'SKILL.md'),
      'utf8'
    );
    const version = /version: "([^"]+)"/.exec(instructions)?.[1];
    if (!version) throw new Error('Authoring skill version missing');
    return {
      name,
      version,
      hash: createHash('sha256').update(instructions).digest('hex'),
      instructions,
    };
  });
}
