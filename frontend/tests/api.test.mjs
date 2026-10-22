import test from 'node:test';
import assert from 'node:assert/strict';
process.env.DB_PATH=':memory:';
const {server,db}=await import('../server/index.mjs');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base='http://127.0.0.1:'+server.address().port+'/api';
let cookie='';
async function request(path,method='GET',body,headers={}){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
 return {status:response.status,data:await response.json(),response};
}
test('API: autenticacao, persistencia, conflito, prontuario e exclusao',async t=>{
 try{
 await t.test('protege dados e rejeita credenciais invalidas',async()=>{
  assert.equal((await request('/bootstrap')).status,401);
  assert.equal((await request('/auth/login','POST',{email:'demo@odontoagenda.com',password:'errada'})).status,401);
  const login=await request('/auth/login','POST',{email:'demo@odontoagenda.com',password:'Odonto@2026'});
  assert.equal(login.status,200);assert.ok(login.response.headers.get('set-cookie').includes('HttpOnly'));cookie=login.response.headers.get('set-cookie').split(';')[0];assert.equal(login.data.password,undefined);
 });
 let patient,procedure,appointment;
 await t.test('cadastra e valida pacientes e procedimentos',async()=>{
  assert.equal((await request('/patients','POST',{name:'Ana',age:-1,phone:'123',status:'Ativo'})).status,400);
  const p=await request('/patients','POST',{name:'Paciente Teste',age:30,phone:'(11) 99999-1234',email:'teste@example.com',status:'Ativo'});assert.equal(p.status,201);patient=p.data;
  const pr=await request('/procedures','POST',{name:'Procedimento teste',category:'Prevenção',duration:40,price:200});assert.equal(pr.status,201);procedure=pr.data;
  assert.equal((await request('/patients/'+patient.id)).data.name,'Paciente Teste');
 });
 await t.test('bloqueia sobreposicao, permite horarios adjacentes e outro dentista',async()=>{
  const payload={patientId:patient.id,procedureId:procedure.id,date:'2030-10-21',time:'09:00',dentist:'Lucas Maximo',status:'Confirmada',payment:'Pix',discount:0};
  const a=await request('/appointments','POST',payload);assert.equal(a.status,201);appointment=a.data;
  assert.equal((await request('/appointments','POST',{...payload,time:'09:30'})).status,409);
  assert.equal((await request('/appointments','POST',{...payload,time:'09:40'})).status,201);
  assert.equal((await request('/appointments','POST',{...payload,dentist:'Ketellyn Santos'})).status,201);
  assert.equal((await request('/appointments','POST',{...payload,time:'09:99'})).status,400);
  assert.equal((await request('/appointments','POST',{...payload,date:'2030-10-20'})).status,400);
  assert.equal((await request('/appointments','POST',{...payload,time:'18:00'})).status,400);
  assert.equal((await request('/appointments','POST',{...payload,time:'12:30',discount:201})).status,400);
 });
 await t.test('remarca e cancela consultas sem perder o historico',async()=>{
  let updated=await request('/appointments/'+appointment.id,'PUT',{...appointment,time:'11:00',status:'Concluída',discount:20});assert.equal(updated.status,200);assert.equal(updated.data.price,200);
  updated=await request('/appointments/'+appointment.id,'PUT',{...updated.data,status:'Cancelada'});assert.equal(updated.status,200);
  assert.equal((await request('/procedures/'+procedure.id,'DELETE')).status,409);
 });
 await t.test('registra prontuario e rejeita dente e data invalidos',async()=>{
  const record={patientId:patient.id,date:'2030-10-21',title:'Avaliação',notes:'Sem queixas.',tooth:'26',condition:'Sadio',category:'Evolução'};
  assert.equal((await request('/records','POST',record)).status,201);
  assert.equal((await request('/records','POST',{...record,tooth:'99'})).status,400);
  assert.equal((await request('/records','POST',{...record,date:'2030-02-31'})).status,400);
  const data=(await request('/bootstrap')).data;assert.ok(data.records.some(r=>r.patientId===patient.id));assert.ok(data.appointments.some(a=>a.patientId===patient.id));
 });
 await t.test('protege contra origem externa e remove dependencias na exclusao',async()=>{
  assert.equal((await request('/patients','POST',{}, {Origin:'https://external.example'})).status,403);
  assert.equal((await request('/patients/'+patient.id,'DELETE')).status,200);
  const data=(await request('/bootstrap')).data;assert.ok(!data.appointments.some(a=>a.patientId===patient.id));assert.ok(!data.records.some(r=>r.patientId===patient.id));
  assert.equal((await request('/procedures/'+procedure.id,'DELETE')).status,200);
  assert.equal((await request('/auth/logout','POST',{})).status,200);assert.equal((await request('/bootstrap')).status,401);
 });
 }finally{await new Promise(resolve=>server.close(resolve));db.close();}
});
