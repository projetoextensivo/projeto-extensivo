export class AppError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export const dateKey = (date = new Date()) => [date.getFullYear(), String(date.getMonth()+1).padStart(2,'0'), String(date.getDate()).padStart(2,'0')].join('-');
export function validateAppointment(item, appointments, patients, procedures, settings) {
  if (!patients.some(p => p.id === item.patientId && p.status !== 'Inativo')) throw new AppError('Selecione um paciente ativo.');
  const procedure = procedures.find(p => p.id === item.procedureId);
  if (!procedure) throw new AppError('Selecione um procedimento.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date || '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time || '')) throw new AppError('Informe uma data e um horário válidos.');
  const day = new Date(item.date + 'T12:00:00');
  if (Number.isNaN(day.getTime()) || dateKey(day) !== item.date) throw new AppError('Informe uma data válida.');
  if (day.getDay() === 0) throw new AppError('A clínica não atende aos domingos. Escolha outro dia.');
  const minutes = value => { const [h,m] = value.split(':').map(Number); return h*60+m; };
  const start = minutes(item.time);
  const duration = Number(procedure.duration);
  if (!Number.isFinite(start) || start % 60 > 59 || start < minutes(settings.openTime) || start + duration > minutes(settings.closeTime)) throw new AppError('Escolha um horário dentro do expediente da clínica.');
  if (!['Confirmada','Aguardando','Em atendimento','Concluída','Cancelada'].includes(item.status)) throw new AppError('Selecione um status válido.');
  if (item.status === 'Cancelada') return;
  const conflict = appointments.find(a => a.id !== item.id && a.date === item.date && a.status !== 'Cancelada' && a.dentist === item.dentist && start < minutes(a.time) + Number(a.duration || procedures.find(p => p.id === a.procedureId)?.duration || 30) && start + duration > minutes(a.time));
  if (conflict) throw new AppError('Este horário já está ocupado. Escolha outro horário.', 409);
}
export function cleanPatient(body) {
  if (!body.name?.trim() || body.name.trim().length < 3) throw new AppError('Informe o nome completo do paciente.');
  const age = Number(body.age);
  if (!Number.isInteger(age) || age < 0 || age > 120) throw new AppError('Informe uma idade entre 0 e 120 anos.');
  if ((body.phone || '').replace(/\D/g,'').length < 10) throw new AppError('Informe um telefone com DDD.');
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) throw new AppError('Confira o e-mail do paciente.');
  if (!['Ativo','Inativo','Em tratamento','Retorno'].includes(body.status)) throw new AppError('Selecione um status válido.');
  return { name: body.name.trim(), age, phone: body.phone, email: body.email || '', status: body.status, birthDate: body.birthDate || '', insurance: body.insurance || 'Particular', cpf: body.cpf || '', allergies: body.allergies || '', notes: body.notes || '' };
}
