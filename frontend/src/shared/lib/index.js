export const dateKey = (date = new Date()) => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export const parseDate = value => new Date(value+'T12:00:00');
export const formatDate = value => value ? parseDate(value).toLocaleDateString('pt-BR') : '—';
export const money = value => Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export const initials = value => (value||'').trim().split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase();
export const normalize = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const formValues = event => Object.fromEntries(new FormData(event.currentTarget));
export const addDays = (value,days) => { const date = typeof value === 'string' ? parseDate(value) : new Date(value); date.setDate(date.getDate()+days); return date; };
export const mondayOf = value => { const date = typeof value === 'string' ? parseDate(value) : new Date(value); return addDays(date,-((date.getDay()+6)%7)); };

export const isAdmin = user => user?.role === 'Administrador';
