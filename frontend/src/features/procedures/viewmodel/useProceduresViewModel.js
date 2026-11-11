import { useMemo, useState } from 'react';
import { normalize } from '@/shared/model';

export function useProceduresViewModel(procedures) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('default');
  const filtered = useMemo(() => {
    const result = procedures.filter(item => (category === 'Todos' || category === item.category) && normalize(`${item.name} ${item.description}`).includes(normalize(search)));
    if (sort === 'price') result.sort((a, b) => a.price - b.price);
    if (sort === 'duration') result.sort((a, b) => a.duration - b.duration);
    return result;
  }, [procedures, category, search, sort]);
  const clearFilters = () => { setCategory('Todos'); setSearch(''); setSort('default'); };
  return { search, setSearch, category, setCategory, showFilters, setShowFilters, sort, setSort, filtered, clearFilters };
}
