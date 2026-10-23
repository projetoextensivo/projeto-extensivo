import { spawn } from 'node:child_process';
const children = [spawn(process.execPath, ['server/index.mjs'], { stdio: 'inherit' }), spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' })];
let closing = false;
function stop(code = 0) { if (closing) return; closing = true; children.forEach(child => child.kill()); process.exit(code); }
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
children.forEach(child => { child.on('error', error => { console.error(error.message); stop(1); }); child.on('exit', code => { if (!closing) stop(code ?? 1); }); });
