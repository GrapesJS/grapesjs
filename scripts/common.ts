import { execSync } from 'child_process';

export function runCommand(command: string, error?: string) {
  try {
    return (execSync(command, { stdio: 'inherit' }) || '').toString().trim();
  } catch (err) {
    console.error(error || `Error while running command: ${command}`);
    throw err;
  }
}
