import { execSync } from 'child_process';
import fs from 'fs';
import { relative, resolve } from 'path';
import { runCommand } from './common';

const rootDir = resolve(__dirname, '..');
const releaseTags = ['latest', 'rc'];
const usage = 'Usage: pnpm release:package <package> <latest|rc>, eg. pnpm release:package @grapesjs/webmcp rc';

interface WorkspacePackage {
  name: string;
  path: string;
  private?: boolean;
}

/**
 * Find a workspace package by its name (eg. `@grapesjs/webmcp`) or its folder (eg. `packages/webmcp`).
 */
function findPackage(name: string) {
  const packages: WorkspacePackage[] = JSON.parse(
    execSync('pnpm ls -r --depth -1 --json', { cwd: rootDir, encoding: 'utf8' }),
  ).filter((pkg: WorkspacePackage) => pkg.path !== rootDir);
  const pkg = packages.find((pkg) => pkg.name === name || relative(rootDir, pkg.path) === name);

  if (!pkg) {
    const names = packages.filter((pkg) => !pkg.private).map((pkg) => pkg.name);
    throw new Error(`Package "${name}" not found. Available packages: ${names.join(', ')}`);
  }

  if (pkg.private) {
    throw new Error(`Package "${pkg.name}" is private and can't be published`);
  }

  return pkg;
}

async function preparePackageRelease() {
  try {
    const [name, releaseTag] = process.argv.slice(2);

    if (!name || !releaseTags.includes(releaseTag)) {
      throw new Error(usage);
    }

    const pkg = findPackage(name);
    console.log(`Prepare release ${pkg.name} tag:`, releaseTag);

    // Check if the current branch is clean (no staged changes)
    runCommand(
      'git diff-index --quiet HEAD --',
      'You have uncommitted changes. Please commit or stash them before running the release script.',
    );

    // Increment the package version
    const versionCmd = releaseTag === 'latest' ? 'patch' : `prerelease --preid ${releaseTag}`;
    runCommand(`pnpm --filter ${pkg.name} exec npm version ${versionCmd} --no-git-tag-version --no-commit-hooks`);

    // Create a new release branch
    const newVersion = JSON.parse(fs.readFileSync(`${pkg.path}/package.json`, 'utf8')).version;
    const newBranch = `release-${pkg.name.replace(/^@/, '').replace(/\//g, '-')}-v${newVersion}`;
    runCommand(`git checkout -b ${newBranch}`);
    runCommand('git add .');
    // The message is used by the publish-package workflow, keep the format in sync
    runCommand(`git commit -m "Release package ${pkg.name} ${releaseTag}: v${newVersion}"`);

    console.log(
      `Release prepared! Push the current "${newBranch}" branch and open a new PR targeting 'dev'.`,
      'Keep the commit message as the merge commit title, it triggers the publish.',
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

preparePackageRelease();
