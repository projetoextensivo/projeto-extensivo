export const appointmentStatuses = ['Confirmada','Aguardando','Em atendimento','Concluída','Cancelada'];
export const paymentMethods = ['Pix','Dinheiro','Cartão de crédito','Cartão de débito'];
export const categoryGroup = category => ['Estética','Dentística','Ortodontia'].includes(category)?1:['Endodontia','Cirurgia','Implantes'].includes(category)?2:0;
export const groupNames = ['Prevenção e avaliação','Estética e dentística','Cirurgia e endodontia'];
export function enrichAppointments(appointments,patients,procedures) {return appointments.map(a=>({...a,patient:patients.find(p=>p.id===a.patientId),procedure:procedures.find(p=>p.id===a.procedureId)}));}
