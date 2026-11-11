import { api } from '@/shared/services/api';

export function updateClinicSettings(settings) {
  return api.put('/settings', settings);
}

export function updateAccount(account) {
  return api.put('/account', account);
}
