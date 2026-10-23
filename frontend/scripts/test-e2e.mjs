import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
if(!existsSync('dist/index.html')){console.error('Execute npm run build antes dos testes de navegador.');process.exit(1);}
process.env.DB_PATH=':memory:';
const {server,db}=await import('../server/index.mjs');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const baseURL='http://127.0.0.1:'+server.address().port;
let child;
try{
 child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,E2E_BASE_URL:baseURL}});
 process.on('SIGINT',()=>child.kill());
 process.on('SIGTERM',()=>child.kill());
 process.exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
}finally{
 server.closeAllConnections();
 await new Promise(resolve=>server.close(resolve));
 db.close();
}
