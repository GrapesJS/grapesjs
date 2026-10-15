import { spawnSync } from 'child_process';
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';

describe('build command', () => {
  let projectDir: string;
  const cliPath = resolve(__dirname, '../dist/cli.js');

  beforeEach(() => {
    projectDir = mkdtempSync(join(tmpdir(), 'grapesjs-cli-build-'));
    mkdirSync(join(projectDir, 'src'));
    writeFileSync(join(projectDir, 'package.json'), JSON.stringify({ name: 'build-test', version: '1.0.0' }));
  });

  afterEach(() => {
    rmSync(projectDir, { recursive: true, force: true });
  });

  const runBuild = () =>
    spawnSync(process.execPath, [cliPath, 'build', '--patch=false', '--dts=skip'], {
      cwd: projectDir,
      encoding: 'utf8',
    });

  test('exits unsuccessfully when webpack reports a compilation error', () => {
    writeFileSync(join(projectDir, 'src/index.js'), 'export default ;');

    const result = runBuild();

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Error during building');
    expect(result.stdout).not.toContain('Building completed successfully!');
    expect(existsSync(join(projectDir, 'dist/index.js'))).toBe(false);
  });

  test('exits successfully and emits the bundle for a valid entry', () => {
    writeFileSync(join(projectDir, 'src/index.js'), 'export default "built";');

    const result = runBuild();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Building completed successfully!');
    expect(existsSync(join(projectDir, 'dist/index.js'))).toBe(true);
  });

  test('exits unsuccessfully when webpack reports a fatal error', () => {
    writeFileSync(join(projectDir, 'src/index.js'), 'export default "built";');
    writeFileSync(
      join(projectDir, 'webpack.config.js'),
      `module.exports = ({ config }) => ({
        ...config,
        plugins: [{
          apply(compiler) {
            compiler.hooks.beforeRun.tap('FailBuild', () => {
              throw new Error('Fatal build failure');
            });
          },
        }],
      });`,
    );

    const result = runBuild();

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Error during building');
    expect(result.stderr).toContain('Fatal build failure');
    expect(existsSync(join(projectDir, 'dist/index.js'))).toBe(false);
  });
});
