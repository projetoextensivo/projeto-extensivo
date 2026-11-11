import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/shared/services/api';
import { deleteClinicEntity, loadClinic, logoutClinicUser, saveClinicEntity } from '@/app/services/clinic-service';
import { isAdmin } from '@/shared/model';

export function useAppViewModel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [path, setPath] = useState(window.location.hash.slice(1) || 'agenda');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  const refresh = useCallback(async () => {
    try {
      const result = await loadClinic();
      setData(result);
      setLoadError('');
      return result;
    } catch (cause) {
      if (cause.response?.status === 401) {
        setData(null);
        setModal(null);
        return null;
      }
      setLoadError(errorMessage(cause));
      throw cause;
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {}).finally(() => setLoading(false));
    const listener = () => setPath(window.location.hash.slice(1) || 'agenda');
    window.addEventListener('hashchange', listener);
    return () => window.removeEventListener('hashchange', listener);
  }, [refresh]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const navigate = route => { window.location.hash = route; };
  const requestedRoute = path.split('/')[0];
  const route = data && !isAdmin(data.user) && ['dashboard', 'procedimentos', 'prontuarios'].includes(requestedRoute)
    ? 'agenda'
    : requestedRoute;

  async function save(kind, item) {
    await saveClinicEntity(kind, item);
    await refresh();
    setToast(item.id ? 'Alterações salvas com sucesso.' : kind === 'appointments' ? 'Consulta agendada com sucesso.' : 'Registro salvo com sucesso.');
  }

  async function authenticated() {
    setLoading(true);
    navigate('agenda');
    try { await refresh(); } catch {} finally { setLoading(false); }
  }

  async function confirmAction(currentModal) {
    if (currentModal.type === 'logout') {
      await logoutClinicUser();
      setData(null);
      navigate('login');
      return;
    }
    await deleteClinicEntity(currentModal.kind, currentModal.item.id);
    await refresh();
    setToast('Registro excluído.');
  }

  return {
    data, setData, loading, setLoading, loadError, path, modal, setModal, toast, setToast,
    refresh, navigate, save, authenticated, route, confirmAction,
  };
}
