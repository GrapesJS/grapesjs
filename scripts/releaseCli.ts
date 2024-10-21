import fs from 'fs';
import { resolve } from 'path';
import { runCommand } from './common';

const pathLib = resolve(__dirname, '../packages/cli');

async function prepareCoreRelease() {
  try {
    const releaseTag = process.argv[2] || 'rc';
    console.log('Prepare release cli tag:', releaseTag);

    // Check if the current branch is clean (no staged changes)
    runCommand(
      'git diff-index --quiet HEAD --',
      'You have uncommitted changes. Please commit or stash them before running the release script.',
    );

    // Increment the CLI version
    const versionCmd = releaseTag === 'latest' ? 'patch' : `prerelease --preid ${releaseTag}`;
    runCommand(`pnpm --filter grapesjs-cli exec npm version ${versionCmd} --no-git-tag-version --no-commit-hooks`);

    // Create a new release branch
    const newVersion = JSON.parse(fs.readFileSync(`${pathLib}/package.json`, 'utf8')).version;
    const newBranch = `release-v${newVersion}`;
    runCommand(`git checkout -b ${newBranch}`);
    runCommand('git add .');
    runCommand(`git commit -m "Release GrapesJS cli ${releaseTag}: v${newVersion}"`);

    console.log(`Release prepared! Push the current "${newBranch}" branch and open a new PR targeting 'dev'`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

prepareCoreRelease();
