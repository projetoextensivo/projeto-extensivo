import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppError, cleanPatient, validateAppointment, dateKey } from './domain.mjs';
import { seedData } from './seed.mjs';

const root = fileURLToPath(new URL('../',import.meta.url));
const dbPath = process.env.DB_PATH || resolve(root,'data','odontoagenda.sqlite');
if(dbPath !== ':memory:') mkdirSync(resolve(dbPath,'..'),{recursive:true});
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS entities (kind TEXT NOT NULL,id TEXT NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(kind,id)); CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,role TEXT NOT NULL,password TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires INTEGER NOT NULL);');
const list = kind => db.prepare('SELECT payload FROM entities WHERE kind=?').all(kind).map(r=>JSON.parse(r.payload));
const find = (kind,id) => { const row=db.prepare('SELECT payload FROM entities WHERE kind=? AND id=?').get(kind,id); return row && JSON.parse(row.payload); };
const save = (kind,item) => {db.prepare('INSERT OR REPLACE INTO entities(kind,id,payload) VALUES(?,?,?)').run(kind,item.id,JSON.stringify(item)); return item;};
const remove = (kind,id) => db.prepare('DELETE FROM entities WHERE kind=? AND id=?').run(kind,id);
const hash = password => { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex'); };
const check = (password,encoded) => { const [salt,digest]=encoded.split(':'); return timingSafeEqual(Buffer.from(digest,'hex'),scryptSync(password,salt,64)); };
const publicUser = user => ({id:user.id,name:user.name,email:user.email,role:user.role});
if (!find('settings','clinic')) {
 const seed=seedData();
 db.exec('BEGIN');
 try {for(const kind of ['patients','procedures','appointments','records']) seed[kind].forEach(item=>save(kind,item)); save('settings',{...seed.settings,id:'clinic'});
 db.prepare('INSERT INTO users(id,email,name,role,password) VALUES(?,?,?,?,?)').run('demo','demo@odontoagenda.com','Lucas Maximo','Administrador',hash('Odonto@2026'));db.exec('COMMIT');} catch(e){db.exec('ROLLBACK');throw e;}
}
db.prepare("UPDATE users SET role='Administrador' WHERE id='demo'").run();
for(const patient of list('patients')){if('insurance' in patient){delete patient.insurance;save('patients',patient);}}
const auth = req => {const token=req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('odonto_session='))?.split('=')[1]; if(!token) return null; const session=db.prepare('SELECT user_id FROM sessions WHERE token=? AND expires>?').get(token,Date.now());return session && db.prepare('SELECT * FROM users WHERE id=?').get(session.user_id);};
function session(res,user,remember=true) {const token=randomBytes(32).toString('hex'); const age=remember?7*86400:12*3600; db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(token,user.id,Date.now()+age*1000);res.setHeader('Set-Cookie','odonto_session='+token+'; HttpOnly; SameSite=Strict; Path=/'+(remember?'; Max-Age='+age:''));}
async function body(req) {let size=0; const chunks=[]; for await(const chunk of req){size+=chunk.length;if(size>100000)throw new AppError('O conteúdo enviado ? muito grande.',413);chunks.push(chunk);} try{return JSON.parse(Buffer.concat(chunks).toString()||'{}');}catch{throw new AppError('Não foi possível ler os dados enviados.');}}
const attempts = new Map();
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
 const url=new URL(req.url,'http://localhost');
 function json(data,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
 try {
 if(!url.pathname.startsWith('/api/')){
  const publicRoot=resolve(root,'dist'); const path=resolve(publicRoot,'.'+decodeURIComponent(url.pathname));
  if(path!==publicRoot && !path.startsWith(publicRoot+sep))throw new AppError('Página não encontrada.',404);
  const target=existsSync(path)&&statSync(path).isFile()?path:resolve(publicRoot,'index.html');
  if(!existsSync(target)){res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8'});res.end('API OdontoAgenda pronta. Interface: http://127.0.0.1:5173');return;}
  const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};res.writeHead(200,{'Content-Type':types[extname(target)]||'application/octet-stream'});res.end(readFileSync(target));return;
 }
 if(!['GET','HEAD'].includes(req.method) && req.headers.origin){let origin;try{origin=new URL(req.headers.origin);}catch{throw new AppError('Origem inválida.',403);}if(!['localhost','127.0.0.1'].includes(origin.hostname))throw new AppError('Origem não autorizada.',403);}
 if(req.method==='GET'&&url.pathname==='/api/health') return json({ok:true});
 if(req.method==='POST'&&['/api/auth/login','/api/auth/register'].includes(url.pathname)){
  const key=req.socket.remoteAddress;const state=attempts.get(key)||{count:0,at:Date.now()};if(Date.now()-state.at>600000){state.count=0;state.at=Date.now();}if(state.count>=20)throw new AppError('Muitas tentativas. Aguarde alguns minutos.',429);state.count++;attempts.set(key,state);
  const data=await body(req);const email=String(data.email||'').trim().toLowerCase();let user;
  if(url.pathname.endsWith('register')){
   if(!data.name?.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||String(data.password||'').length<8)throw new AppError('Preencha seu nome, um e-mail válido e uma senha com pelo menos 8 caracteres.');
   if(data.password!==data.confirmPassword||!data.terms)throw new AppError('Confirme a senha e aceite os termos para continuar.');
   if(data.role && !['Secretária','Recepcionista'].includes(data.role))throw new AppError('Selecione seu cargo.');
   if(db.prepare('SELECT id FROM users WHERE email=?').get(email))throw new AppError('Este e-mail já possui uma conta. Entre com sua senha.',409);
   user={id:randomUUID(),name:data.name.trim(),email,role:'Secretária',password:hash(data.password)};db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(user.id,email,user.name,user.role,user.password);
  }else{
   user=db.prepare('SELECT * FROM users WHERE email=?').get(email);
   if(!user||!check(String(data.password||''),user.password))throw new AppError('E-mail ou senha incorretos. Confira os dados e tente de novo.',401);
  }
  state.count=0;session(res,user,data.remember!==false);return json(publicUser(user));
 }
 const user=auth(req);if(!user)throw new AppError('Entre na sua conta para continuar.',401);
 if(req.method==='GET'&&url.pathname==='/api/auth/me')return json(publicUser(user));
 if(req.method==='POST'&&url.pathname==='/api/auth/logout'){const token=req.headers.cookie?.match(/odonto_session=([^;]+)/)?.[1];if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(token);res.setHeader('Set-Cookie','odonto_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return json({ok:true});}
 const admin=user.role==='Administrador';
 if((url.pathname.startsWith('/api/procedures')||url.pathname.startsWith('/api/records')||url.pathname==='/api/dashboard'||url.pathname==='/api/settings'||(req.method==='DELETE'&&url.pathname.startsWith('/api/patients')))&&!admin)throw new AppError('Acesso exclusivo da administradora.',403);
 if(req.method==='GET'&&url.pathname==='/api/bootstrap')return json({user:publicUser(user),patients:list('patients'),procedures:admin?list('procedures'):[],appointmentOptions:list('procedures').map(({id,name,duration})=>({id,name,duration})),appointments:admin?list('appointments'):list('appointments').map(({price,discount,...item})=>item),records:admin?list('records'):[],settings:find('settings','clinic')});
 if(req.method==='PUT'&&url.pathname==='/api/settings'){
  const data=await body(req);if(!data.clinicName?.trim())throw new AppError('Informe o nome da clínica.');
  if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.openTime)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.closeTime)||data.openTime>=data.closeTime)throw new AppError('Confira o horário de funcionamento.');
  return json(save('settings',{...find('settings','clinic'),clinicName:data.clinicName.trim(),phone:data.phone||'',email:data.email||'',address:data.address||'',openTime:data.openTime,closeTime:data.closeTime}));
 }
 if(req.method==='PUT'&&url.pathname==='/api/account'){
  const data=await body(req);if(!data.name?.trim())throw new AppError('Informe seu nome.');
  let password=user.password;if(data.newPassword){if(!check(data.currentPassword||'',user.password))throw new AppError('A senha atual está incorreta.');if(data.newPassword.length<8)throw new AppError('Use pelo menos 8 caracteres na nova senha.');password=hash(data.newPassword);}
  db.prepare('UPDATE users SET name=?,password=? WHERE id=?').run(data.name.trim(),password,user.id);return json(publicUser({...user,name:data.name.trim()}));
 }
 const match=url.pathname.match(/^\/api\/(patients|procedures|appointments|records)(?:\/([^/]+))?$/);
 if(!match)throw new AppError('Recurso não encontrado.',404);
 const [,kind,id]=match;const existing=id?find(kind,id):null;
 if(id&&!existing)throw new AppError('Este registro não foi encontrado.',404);
 if(req.method==='GET'){const visible=item=>{if(!admin&&kind==='appointments'){const {price,discount,...rest}=item;return rest;}return item;};return json(id?visible(existing):list(kind).map(visible));}
 if(req.method==='DELETE'){
  if(!id)throw new AppError('Selecione o registro.');
  if(kind==='procedures'&&list('appointments').some(a=>a.procedureId===id))throw new AppError('Este procedimento possui consultas vinculadas. Edite seus dados para manter o histórico.',409);
  db.exec('BEGIN');try{if(kind==='patients')for(const related of ['appointments','records'])list(related).filter(a=>a.patientId===id).forEach(a=>remove(related,a.id));remove(kind,id);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
  return json({ok:true});
 }
 if(!['POST','PUT'].includes(req.method)||(req.method==='PUT'&&!id))throw new AppError('Operação não permitida.',405);
 const data=await body(req);let item={...data,id:id||randomUUID()};
 if(kind==='patients')item={...cleanPatient(data),id:item.id};
 if(kind==='procedures'){
  if(!data.name?.trim()||!['Prevenção','Estética','Dentística','Endodontia','Cirurgia','Implantes','Ortodontia'].includes(data.category)||!Number.isFinite(Number(data.price))||Number(data.price)<0||!Number.isInteger(Number(data.duration))||Number(data.duration)<5||Number(data.duration)>480)throw new AppError('Confira o nome, a categoria, o valor e a duração (5 a 480 minutos).');
  item={id:item.id,name:data.name.trim(),category:data.category,description:String(data.description||''),price:Number(data.price),duration:Number(data.duration)};
 }
 if(kind==='appointments'){
  if(!find('settings','clinic').dentists.includes(data.dentist))throw new AppError('Selecione um dentista.');
  validateAppointment(item,list('appointments'),list('patients'),list('procedures'),find('settings','clinic'));
  const procedure=find('procedures',data.procedureId);const price=existing&&existing.procedureId===data.procedureId?existing.price:procedure.price;
  const discount=Number(admin?data.discount||0:existing?.discount||0);if(!Number.isFinite(discount)||discount<0||discount>price)throw new AppError('O desconto deve estar entre zero e o valor da consulta.');
  if(!['Pix','Dinheiro','Cartão de crédito','Cartão de débito'].includes(data.payment))throw new AppError('Selecione uma forma de pagamento.');
  item={id:item.id,patientId:data.patientId,procedureId:data.procedureId,date:data.date,time:data.time,status:data.status,dentist:data.dentist,duration:procedure.duration,price,discount,payment:data.payment,notes:String(data.notes||'')};
 }
 if(kind==='records'){
  if(!find('patients',data.patientId)||!data.title?.trim()||!data.notes?.trim())throw new AppError('Selecione um paciente e preencha o título e a descrição do atendimento.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date||'')||(Number.isNaN(new Date(data.date+'T12:00:00').getTime()) || dateKey(new Date(data.date+'T12:00:00'))!==data.date))throw new AppError('Informe uma data válida.');
  if(data.tooth&&!/^(1[1-8]|2[1-8]|3[1-8]|4[1-8])$/.test(data.tooth))throw new AppError('Informe um dente válido (11–48).');
  if(!['Sadio','Tratado','Em tratamento','Cárie','Ausente'].includes(data.condition))throw new AppError('Selecione uma condição válida.');
  item={id:item.id,patientId:data.patientId,title:data.title.trim(),notes:data.notes.trim(),date:data.date,dentist:user.name,tooth:data.tooth||'',condition:data.condition,anamnesis:data.anamnesis||'',category:data.category||'Evolução'};
 }
 const saved=save(kind,item);if(!admin&&kind==='appointments'){const {price,discount,...visible}=saved;return json(visible,req.method==='POST'?201:200);}return json(saved,req.method==='POST'?201:200);
 }catch(error){if(!(error instanceof AppError))console.error(error);if(!res.headersSent)json({message:error instanceof AppError?error.message:'Não foi possível concluir a operação. Tente novamente.'},error.status||500);else res.end();}
});
if(process.argv[1]===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log('API OdontoAgenda: http://127.0.0.1:'+(process.env.PORT||3001)));
export {server,db};
