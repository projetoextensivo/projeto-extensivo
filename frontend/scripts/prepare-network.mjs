import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
// O navegador acessa /api na mesma origem do Spring, inclusive em outra máquina.
const child = spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js'), 'build', '--configLoader', 'native'], {
 cwd: root, stdio: 'inherit', env: { ...process.env, VITE_API_BASE_URL: '/api' }
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => {
 if (code !== 0) { process.exitCode = code ?? 1; return; }
 console.log('\nInterface pronta em frontend/dist.');
 console.log('No IntelliJ, reinicie OdontoAgendaApplication com o diretório de trabalho backend-integrado-spring.');
 console.log('Nesta máquina: http://localhost:8080');
 const privateIPv4 = address => /^10\./.test(address) || /^192\.168\./.test(address) || /^172\.(1[6-9]|2\d|3[01])\./.test(address);
 for (const [name, addresses] of Object.entries(networkInterfaces())) {
  if (/WSL|Hyper-V|vEthernet|Loopback|Docker/i.test(name)) continue;
  for (const address of addresses || []) {
   if (address.family === 'IPv4' && !address.internal && privateIPv4(address.address)) {
    console.log(`Outras máquinas na mesma rede (${name}): http://${address.address}:8080`);
   }
  }
 }
 console.log('Mantenha a aplicação Java ligada. Após mudanças no front-end, execute este comando e reinicie a aplicação Java.');
 console.log('Se necessário, permita Java/TCP 8080 no Firewall somente na rede privada.');
});
