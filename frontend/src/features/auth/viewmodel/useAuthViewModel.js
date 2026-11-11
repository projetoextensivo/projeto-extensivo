import { useState } from 'react';
import { errorMessage } from '@/shared/services/api';
import { authenticate } from '@/features/auth/services/auth-service';

export function useAuthViewModel({ mode, onAuthenticated }) {
  const register = mode === 'register';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function login(credentials) {
    setError('');
    setBusy(true);
    try {
      const user = await authenticate(mode, credentials);
      onAuthenticated(user);
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (register && values.password !== values.confirmPassword) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }
    await login({ ...values, role: 'Secretária', remember: form.elements.remember?.checked, terms: form.elements.terms?.checked });
  }

  return { register, busy, error, setError, login, submit };
}
