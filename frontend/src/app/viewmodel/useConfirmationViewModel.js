import { useState } from 'react';
import { errorMessage } from '@/shared/services/api';

export function useConfirmationViewModel(onConfirm, onClose) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function confirm() {
    setBusy(true);
    try { await onConfirm(); onClose(); }
    catch (cause) { setError(errorMessage(cause)); }
    finally { setBusy(false); }
  }
  return { busy, error, confirm };
}
