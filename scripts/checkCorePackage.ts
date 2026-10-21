import { execFileSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const coreDir = resolve(__dirname, '../packages/core');
const pkg: { main: string; module: string; types: string } = JSON.parse(
  readFileSync(resolve(coreDir, 'package.json'), 'utf8'),
);
const [packed]: { files: { path: string; size: number }[] }[] = JSON.parse(
  execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: coreDir,
    encoding: 'utf8',
  }),
);
const requiredFiles = [pkg.main, pkg.module, pkg.types, 'dist/css/grapes.min.css'];
const missingFiles = requiredFiles.filter((path) => !packed.files.some((file) => file.path === path && file.size > 0));

if (missingFiles.length) {
  throw new Error(
    `Core package is missing required files: ${missingFiles.join(', ')}. Run the core build before publishing.`,
  );
}

console.log(`Core package verified: ${requiredFiles.join(', ')}`);
