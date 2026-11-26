/** Cross-platform dev runner: Vite (3000) + Express API (3001) in one command. */
import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const tasks = [
  { name: 'client', args: ['run', 'dev'] },
  { name: 'server', args: ['run', 'server'] },
];
const children = tasks.map(({ name, args }) => {
  const child = spawn(npm, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  });
  child.on('error', (error) => console.error(`[dev:full] ${name} failed to start: ${error.message}`));
  return child;
});

let shuttingDown = false;
function stop(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exitCode = code;
}

children.forEach((child) => {
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      console.log(`[dev:full] a process exited (${signal ?? code}); stopping the other one.`);
      stop(code ?? 1);
    }
  });
});

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
