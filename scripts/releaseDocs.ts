import fs from 'fs';
import { resolve } from 'path';
import { runCommand } from './common';

const pathLib = resolve(__dirname, '../docs');

async function prepareCoreRelease() {
  try {
    // Check if the current branch is clean (no staged changes)
    runCommand(
      'git diff-index --quiet HEAD --',
      'You have uncommitted changes. Please commit or stash them before running the release script.',
    );

    // Increment the docs version
    runCommand(`pnpm --filter @grapesjs/docs exec npm version patch --no-git-tag-version --no-commit-hooks`);

    // Create a new release branch
    const newVersion = JSON.parse(fs.readFileSync(`${pathLib}/package.json`, 'utf8')).version;
    const newBranch = `release-docs-v${newVersion}`;
    runCommand(`git checkout -b ${newBranch}`);
    runCommand('git add .');
    runCommand(`git commit -m "Release GrapesJS docs: v${newVersion}"`);

    console.log(`Release prepared! Push the current "${newBranch}" branch and open a new PR targeting 'dev'`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

prepareCoreRelease();
