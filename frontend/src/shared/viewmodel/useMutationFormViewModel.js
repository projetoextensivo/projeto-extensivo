import { useState } from 'react';
import { errorMessage } from '@/shared/services/api';

export function useMutationFormViewModel({ kind, item, onSave, onCancel, transform = value => value }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget));
      await onSave(kind, transform({ ...values, id: item?.id }));
      onCancel();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, setError, submit };
}
