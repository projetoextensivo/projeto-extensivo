import { api } from '@/shared/services/api';

export async function authenticate(mode, credentials) {
  return (await api.post(`/auth/${mode === 'register' ? 'register' : 'login'}`, credentials)).data;
}
