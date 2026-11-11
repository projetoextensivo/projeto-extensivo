import { useMemo, useState } from 'react';
import { normalize } from '@/shared/model';

export function usePatientsViewModel(data, pageSize = 6) {
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => data.patients
    .filter(patient => normalize(`${patient.name} ${patient.phone} ${patient.email}`).includes(normalize(search)) && (!status || patient.status === status))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')), [data.patients, search, status]);
  const maxPage = Math.max(0, Math.ceil(filtered.length / pageSize) - 1);
  const currentPage = Math.min(page, maxPage);
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const patient = data.patients.find(item => item.id === selected);
  const visits = patient ? data.appointments.filter(item => item.patientId === patient.id && item.status === 'Concluída').sort((a, b) => b.date.localeCompare(a.date)) : [];
  const lastVisit = id => data.appointments.filter(item => item.patientId === id && item.status === 'Concluída').map(item => item.date).sort().at(-1);
  const clearFilters = () => { setStatus(''); setSearch(''); setPage(0); };
  const changeSearch = value => { setSearch(value); setPage(0); };
  return { pageSize, search, changeSearch, filterOpen, setFilterOpen, status, setStatus, clearFilters, selected, setSelected, page, setPage, filtered, maxPage, currentPage, visible, patient, visits, lastVisit };
}
