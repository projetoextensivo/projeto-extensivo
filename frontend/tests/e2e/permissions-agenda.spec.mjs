import { test, expect } from '@playwright/test';

test('secretária: permissões, atendimento particular e arrastar consultas com persistência',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Explorar demonstração'}).click();
 await expect(page.getByRole('heading',{name:'Nossa agenda'})).toBeVisible();
 const patientResponse=await page.request.post('/api/patients',{data:{name:'Paciente Arrastar',age:30,phone:'11999998888',status:'Ativo'}});
 expect(patientResponse.status()).toBe(201);const patient=await patientResponse.json();
 const procedureResponse=await page.request.post('/api/procedures',{data:{name:'Consulta Arrastar',category:'Prevenção',duration:30,price:100}});
 expect(procedureResponse.status()).toBe(201);const procedure=await procedureResponse.json();
 const current=new Date();const days=[];
 for(let n=1;days.length<3;n++){const d=new Date(current.getFullYear(),current.getMonth(),n);if(d.getDay()!==0)days.push([d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'));}
 const body={patientId:patient.id,procedureId:procedure.id,date:days[0],time:'17:00',status:'Confirmada',dentist:'Lucas Maximo',payment:'Pix',discount:0};
 const created=await page.request.post('/api/appointments',{data:body});expect(created.status()).toBe(201);const appointment=await created.json();
 expect((await page.request.post('/api/appointments',{data:{...body,date:days[2]}})).status()).toBe(201);
 await page.request.post('/api/auth/logout');
 expect((await page.request.post('/api/auth/register',{data:{name:'Secretária Agenda',email:'agenda-'+Date.now()+'@example.com',password:'Senha@2026',confirmPassword:'Senha@2026',terms:true,role:'Administrador'}})).status()).toBeGreaterThanOrEqual(400);
 const signup=await page.request.post('/api/auth/register',{data:{name:'Secretária Agenda',email:'agenda-'+Date.now()+'@example.com',password:'Senha@2026',confirmPassword:'Senha@2026',terms:true,role:'Secretária'}});expect(signup.status()).toBe(200);
 await page.reload();
 await expect(page.getByRole('link',{name:'Dashboard',exact:true})).toHaveCount(0);
 await expect(page.getByRole('link',{name:'Procedimentos',exact:true})).toHaveCount(0);
 for(const route of ['procedures','records','dashboard'])expect((await page.request.get('/api/'+route)).status()).toBe(403);
 const bootstrap=await (await page.request.get('/api/bootstrap')).json();expect(bootstrap.procedures).toEqual([]);expect(bootstrap.records).toEqual([]);expect(bootstrap.appointments[0]).not.toHaveProperty('price');
 await page.goto('/#procedimentos');await expect(page.getByRole('heading',{name:'Nossa agenda'})).toBeVisible();
 const card=page.locator('[data-appointment-id="'+appointment.id+'"]');
 await expect(card).toHaveCount(1);
 await card.dragTo(page.locator('.month-cell[data-date="'+days[1]+'"]'));
 await expect(page.getByRole('status').filter({hasText:'Alterações salvas'})).toBeVisible();
 expect((await (await page.request.get('/api/appointments/'+appointment.id)).json()).date).toBe(days[1]);
 await page.reload();await expect(page.locator('.month-cell[data-date="'+days[1]+'"] .calendar-event').filter({hasText:'Paciente Arrastar'})).toHaveCount(1);
 await card.dragTo(page.locator('.month-cell[data-date="'+days[2]+'"]'));
 await expect(page.getByRole('alert')).toContainText('Este horário já está ocupado');
 expect((await (await page.request.get('/api/appointments/'+appointment.id)).json()).date).toBe(days[1]);
 await page.getByRole('link',{name:'Pacientes',exact:true}).click();await page.getByRole('button',{name:'Novo paciente',exact:true}).click();
 await expect(page.getByLabel('Convênio',{exact:true})).toHaveCount(0);
});
