import { useMemo, useState } from 'react';
import { addDays, dateKey, mondayOf, normalize, parseDate } from '@/shared/model';
import { categoryGroup, enrichAppointments } from '@/features/agenda/model/appointment.js';

export function useAgendaViewModel(data, onReschedule) {
  const [dragged, setDragged] = useState(null);
  const [dropTarget, setDropTarget] = useState('');
  const [moving, setMoving] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [view, setView] = useState('month');
  const [anchor, setAnchor] = useState(dateKey());
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(false);
  const [dentist, setDentist] = useState('');
  const [status, setStatus] = useState('');

  const appointments = useMemo(() => enrichAppointments(data.appointments, data.patients, data.procedures.length ? data.procedures : data.appointmentOptions)
    .filter(item => item.status !== 'Cancelada' && (!dentist || item.dentist === dentist) && (!status || item.status === status) && normalize(item.patient?.name).includes(normalize(search)))
    .sort((a, b) => a.time.localeCompare(b.time)), [data, search, dentist, status]);

  const date = parseDate(anchor);
  const monday = mondayOf(date);
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const weekStart = mondayOf(monthStart);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const monthDays = [];
  for (let day = new Date(weekStart); day <= addDays(mondayOf(last), 5); day = addDays(day, 1)) {
    if (day.getDay() !== 0) monthDays.push(dateKey(day));
  }
  const days = view === 'month' ? monthDays : view === 'day' ? [anchor] : Array.from({ length: 6 }, (_, i) => dateKey(addDays(monday, i)));
  function move(amount) {
    if (view === 'month') setAnchor(dateKey(new Date(date.getFullYear(), date.getMonth() + amount, 1)));
    else setAnchor(dateKey(addDays(date, amount * (view === 'week' ? 7 : 1))));
  }
  const title = view === 'month'
    ? date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : view === 'day'
      ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : `${monday.toLocaleDateString('pt-BR', { day: '2-digit' })} – ${addDays(monday, 5).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  const periodAppointments = appointments.filter(item => days.includes(item.date) && (view !== 'month' || parseDate(item.date).getMonth() === date.getMonth()));
  const startHour = Number(data.settings.openTime.split(':')[0]);
  const endHour = Number(data.settings.closeTime.split(':')[0]);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  async function drop(event, targetDate, time) {
    event.preventDefault(); event.stopPropagation(); setDropTarget('');
    const id = event.dataTransfer.getData('text/plain') || dragged;
    setDragged(null);
    if (moving || !id) return;
    const item = data.appointments.find(appointment => appointment.id === id);
    if (!item || (item.date === targetDate && (!time || item.time === time))) return;
    setMoving(true); setMoveError('');
    try { await onReschedule(item, targetDate, time); }
    catch (cause) { setMoveError(cause.response?.data?.message || 'Não foi possível reagendar. Tente novamente.'); }
    finally { setMoving(false); }
  }
  function target(targetDate, time) {
    return {
      onDragOver: event => { if (!moving) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropTarget(targetDate + (time || '')); } },
      onDrop: event => drop(event, targetDate, time),
    };
  }
  function clearFilters() { setDentist(''); setStatus(''); setSearch(''); }
  return { dragged, setDragged, dropTarget, setDropTarget, moving, moveError, setMoveError, view, setView, anchor, setAnchor, search, setSearch, filters, setFilters, dentist, setDentist, status, setStatus, appointments, date, monday, monthDays, days, move, title, periodAppointments, startHour, endHour, hours, drop, target, clearFilters };
}
