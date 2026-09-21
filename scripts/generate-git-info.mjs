import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const shortSha = commitSha.slice(0, 7);

const content = `// This file is auto-generated during build.
export const gitInfo = {
  commitSha: '${commitSha}',
  shortSha: '${shortSha}',
};
`;

const targetPath = resolve(__dirname, '../src/environments/git-info.ts');
writeFileSync(targetPath, content.replace(/\r\n/g, '\n'), 'utf8');
console.log(`Generated git-info.ts with commit: ${commitSha} (${shortSha})`);
