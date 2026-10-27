import { dateKey } from './domain.mjs';
export function seedData() {
 const patients = [
 {id:'p1',name:'Ana Souza',age:28,phone:'(11) 98765-4321',email:'ana@example.com',status:'Em tratamento',birthDate:'1998-04-15',allergies:'Penicilina',notes:'Paciente relata sensibilidade no dente 26 ao ingerir alimentos frios.'},
 {id:'p2',name:'Bruno Oliveira',age:34,phone:'(11) 91234-5678',email:'bruno@example.com',status:'Ativo',},
 {id:'p3',name:'Carla Mendes',age:42,phone:'(11) 99876-5432',email:'carla@example.com',status:'Retorno',},
 {id:'p4',name:'Daniel Santos',age:31,phone:'(11) 93456-7890',email:'daniel@example.com',status:'Ativo',},
 {id:'p5',name:'Juliana Costa',age:26,phone:'(11) 98712-3456',email:'juliana@example.com',status:'Em tratamento',},
 {id:'p6',name:'Fernanda Rocha',age:35,phone:'(11) 97654-3210',email:'fernanda@example.com',status:'Ativo',},
 {id:'p7',name:'Carlos Lima',age:45,phone:'(11) 96543-2109',email:'carlos@example.com',status:'Em tratamento',},
 {id:'p8',name:'Thiago Martins',age:29,phone:'(11) 95432-1098',email:'thiago@example.com',status:'Ativo',}
 ];
 const procedures = [
 {id:'pr1',name:'Limpeza e Profilaxia',category:'Prevenção',description:'Remoção de tártaro e placa bacteriana, com polimento e aplicação de flúor.',duration:40,price:150},
 {id:'pr2',name:'Clareamento Dental',category:'Estética',description:'Clareamento em consultório para um sorriso mais claro e natural.',duration:60,price:800},
 {id:'pr3',name:'Restauração em Resina',category:'Dentística',description:'Tratamento de cáries com resina na cor natural do dente.',duration:45,price:200},
 {id:'pr4',name:'Tratamento de Canal',category:'Endodontia',description:'Remoção da polpa inflamada ou infectada e selamento dos canais.',duration:90,price:900},
 {id:'pr5',name:'Extração de Siso',category:'Cirurgia',description:'Remoção do dente do siso com anestesia local e acompanhamento pós-operatório.',duration:60,price:450},
 {id:'pr6',name:'Implante Dentário',category:'Implantes',description:'Pino de titânio com coroa para substituir dentes perdidos.',duration:120,price:3500},
 {id:'pr7',name:'Consulta de Avaliação',category:'Prevenção',description:'Avaliação completa da saúde bucal e planejamento do tratamento.',duration:30,price:100},
 {id:'pr8',name:'Manutenção Ortodôntica',category:'Ortodontia',description:'Acompanhamento e ajuste do aparelho para alinhar seu sorriso.',duration:30,price:180}
 ];
 const now = new Date();
 const appointments = [];
 const payments = ['Pix','Cartão de crédito','Dinheiro','Cartão de débito'];
 for(let month=5;month>=0;month--) {
  for(let n=0;n<16;n++) {
   const date = new Date(now.getFullYear(),now.getMonth()-month,2+n);
   if(date.getDay()===0) continue;
   const procedure = procedures[(n+month)%procedures.length];
   appointments.push({id:'a-'+month+'-'+n,patientId:patients[n%patients.length].id,procedureId:procedure.id,date:dateKey(date),time:n%2?'14:00':'09:00',dentist:n%2?'Ketellyn Santos':'Lucas Maximo',duration:procedure.duration,price:procedure.price,discount:n%5===0?20:0,payment:payments[n%4],status:date < new Date(dateKey(now)+'T00:00:00')?'Concluída':'Confirmada',notes:''});
  }
 }
 const monday=new Date(now); const weekday=now.getDay(); monday.setDate(now.getDate()-(weekday===0?6:weekday-1));
 const schedule = [[0,'08:00',0,0],[0,'10:00',6,3],[0,'14:00',4,2],[1,'09:00',1,6],[1,'11:00',2,1],[1,'15:00',3,5],[2,'08:30',5,0],[2,'13:00',7,4],[3,'10:00',4,2],[3,'14:30',0,0],[4,'09:00',2,1],[4,'16:00',7,6]];
 schedule.forEach(([offset,time,patient,proc],i)=>{const date=new Date(monday);date.setDate(date.getDate()+offset); const key=dateKey(date); for(let j=appointments.length-1;j>=0;j--) if(appointments[j].date===key && appointments[j].dentist==='Lucas Maximo' && !appointments[j].id.startsWith('week-')) appointments.splice(j,1); appointments.push({id:'week-'+i,patientId:patients[patient].id,procedureId:procedures[proc].id,date:key,time,dentist:'Lucas Maximo',duration:procedures[proc].duration,price:procedures[proc].price,discount:0,payment:'Pix',status:key<dateKey(now)?'Concluída':'Confirmada',notes:''});});
 if(now.getDay()!==0 && !appointments.some(a=>a.date===dateKey(now))) [0,1,2,3].forEach((_,i)=>appointments.push({id:'today-'+i,patientId:patients[[5,6,0,7][i]].id,procedureId:procedures[i].id,date:dateKey(now),time:['08:30','10:00','14:00','16:00'][i],dentist:'Lucas Maximo',duration:procedures[i].duration,price:procedures[i].price,discount:0,payment:'Pix',status:['Concluída','Em atendimento','Confirmada','Aguardando'][i],notes:''}));
 const records=[
 {id:'r1',patientId:'p1',date:dateKey(new Date(now.getFullYear(),now.getMonth(),6)),title:'Consulta de avaliação',notes:'Dor ao frio no dente 26. Solicitada radiografia periapical.',dentist:'Lucas Maximo',tooth:'26',condition:'Em tratamento',anamnesis:'Sensibilidade ao frio. Alergia ? penicilina.',category:'Evolução'},
 {id:'r2',patientId:'p1',date:dateKey(new Date(now.getFullYear(),now.getMonth()-2,18)),title:'Restauração em resina',notes:'Dente 16, restauração classe I em resina composta.',dentist:'Lucas Maximo',tooth:'16',condition:'Tratado',category:'Evolução'},
 {id:'r3',patientId:'p1',date:dateKey(new Date(now.getFullYear(),now.getMonth()-5,12)),title:'Limpeza e profilaxia',notes:'Profilaxia completa e orientações de higiene bucal.',dentist:'Lucas Maximo',tooth:'',condition:'Sadio',category:'Evolução'}
 ];
 return { patients, procedures, appointments, records, settings:{clinicName:'OdontoAgenda',phone:'(11) 3456-7890',email:'contato@example.com',address:'São Paulo, SP',openTime:'08:00',closeTime:'18:00',dentists:['Lucas Maximo','Ketellyn Santos'], demo:true} };
}
