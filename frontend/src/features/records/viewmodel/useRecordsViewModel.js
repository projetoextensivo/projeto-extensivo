import { useMemo, useState } from 'react';
import { dateKey } from '@/shared/model';

export function useRecordsViewModel(data, patientId) {
  const [tab, setTab] = useState('Visão geral');
  const patient = data.patients.find(item => item.id === patientId);
  const records = useMemo(() => patient ? data.records.filter(item => item.patientId === patient.id).sort((a, b) => b.date.localeCompare(a.date)) : [], [data.records, patient]);
  const visits = useMemo(() => patient ? data.appointments.filter(item => item.patientId === patient.id && item.status !== 'Cancelada').sort((a, b) => b.date.localeCompare(a.date)) : [], [data.appointments, patient]);
  const lastVisit = visits.find(item => item.status === 'Concluída');
  const nextVisit = [...visits].reverse().find(item => item.date >= dateKey() && item.status !== 'Concluída');
  const recent = records[0];
  const treatment = visits.slice(0, 4);
  const filtered = records.filter(item => tab === 'Evoluções' ? item.category === 'Evolução' : tab === 'Anamnese' ? item.category === 'Anamnese' || item.anamnesis : tab === 'Exames' ? item.category === 'Exame' : item.category === 'Documento');
  return { tab, setTab, patient, records, visits, lastVisit, nextVisit, recent, treatment, filtered };
}
