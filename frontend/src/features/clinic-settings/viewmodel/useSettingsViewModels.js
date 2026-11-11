import { useState } from 'react';
import { errorMessage } from '@/shared/services/api';
import { updateAccount, updateClinicSettings } from '@/features/clinic-settings/services/settings-service';

export function useClinicSettingsViewModel({ onUpdated, onNotify }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await updateClinicSettings(Object.fromEntries(new FormData(event.currentTarget))); await onUpdated(); onNotify('Configurações salvas.'); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }
  return { busy, error, submit };
}

export function useAccountViewModel({ onUpdated, onNotify }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setError('');
    try {
      await updateAccount(Object.fromEntries(new FormData(form))); await onUpdated();
      form.elements.currentPassword.value = ''; form.elements.newPassword.value = ''; onNotify('Dados da conta atualizados.');
    } catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }
  return { busy, error, submit };
}
