import { useMemo, useState } from 'react';
import { addDays, dateKey, mondayOf, parseDate } from '@/shared/model';
import { categoryGroup, enrichAppointments, groupNames } from '@/features/agenda/model/appointment.js';

const seriesColors = ['#4b88be', '#8eb9e0', '#bfd9ef'];
function rangeFor(anchor, period, offset = 0) {
  const date = parseDate(anchor + '-01');
  if (period === 'year') return [dateKey(new Date(date.getFullYear() + offset, 0, 1)), dateKey(new Date(date.getFullYear() + offset, 11, 31))];
  if (period === 'week') {
    const current = new Date();
    const reference = date.getMonth() === current.getMonth() && date.getFullYear() === current.getFullYear() ? current : date;
    const monday = addDays(mondayOf(reference), offset * 7);
    return [dateKey(monday), dateKey(addDays(monday, 6))];
  }
  return [dateKey(new Date(date.getFullYear(), date.getMonth() + offset, 1)), dateKey(new Date(date.getFullYear(), date.getMonth() + offset + 1, 0))];
}

export function useDashboardViewModel(data) {
  const [period, setPeriod] = useState('month');
  const [anchor, setAnchor] = useState(dateKey().slice(0, 7));
  const all = useMemo(() => enrichAppointments(data.appointments, data.patients, data.procedures), [data]);
  const [from, to] = rangeFor(anchor, period);
  const [prevFrom, prevTo] = rangeFor(anchor, period, -1);
  const current = all.filter(item => item.date >= from && item.date <= to && item.status !== 'Cancelada');
  const previous = all.filter(item => item.date >= prevFrom && item.date <= prevTo && item.status !== 'Cancelada');
  const paid = current.filter(item => item.status === 'Concluída');
  const previousPaid = previous.filter(item => item.status === 'Concluída');
  const revenue = paid.reduce((sum, item) => sum + item.price - item.discount, 0);
  const previousRevenue = previousPaid.reduce((sum, item) => sum + item.price - item.discount, 0);
  const discounts = paid.reduce((sum, item) => sum + item.discount, 0);
  const selected = parseDate(anchor + '-01');
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date(selected.getFullYear(), selected.getMonth() - 5 + i, 1);
    const key = dateKey(date).slice(0, 7);
    return { key, label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), value: all.filter(item => item.date.startsWith(key) && item.status === 'Concluída').reduce((sum, item) => sum + item.price - item.discount, 0) };
  });
  const max = Math.max(...months.map(month => month.value), 1);
  const chartTotal = months.reduce((sum, month) => sum + month.value, 0);
  const counts = groupNames.map((_, i) => current.filter(item => categoryGroup(item.procedure?.category) === i).length);
  let lastAngle = 0;
  const gradient = counts.map((count, i) => { const start = lastAngle; lastAngle += current.length ? count / current.length * 100 : 0; return seriesColors[i] + ' ' + start + '% ' + lastAngle + '%'; }).join(',');
  const dentists = [...new Set(paid.map(item => item.dentist))].map(name => ({ name, count: paid.filter(item => item.dentist === name).length, revenue: paid.filter(item => item.dentist === name).reduce((sum, item) => sum + item.price - item.discount, 0) })).sort((a, b) => b.revenue - a.revenue);
  const today = all.filter(item => item.date === dateKey() && item.status !== 'Cancelada').sort((a, b) => a.time.localeCompare(b.time));
  const popular = [...data.procedures].map(item => ({ ...item, count: current.filter(appointment => appointment.procedureId === item.id).length })).sort((a, b) => b.count - a.count)[0];
  const label = period === 'month' ? 'no mês' : period === 'week' ? 'na semana' : 'no ano';
  return { period, setPeriod, anchor, setAnchor, all, current, previous, paid, revenue, previousRevenue, discounts, selected, months, max, chartTotal, counts, gradient, dentists, today, popular, label, seriesColors };
}
