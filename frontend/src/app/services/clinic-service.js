import { api } from '@/shared/services/api';

export async function loadClinic() {
  return (await api.get('/bootstrap')).data;
}

export async function saveClinicEntity(kind, item) {
  const { id, ...body } = item;
  return id ? api.put(`/${kind}/${id}`, body) : api.post(`/${kind}`, body);
}

export function deleteClinicEntity(kind, id) {
  return api.delete(`/${kind}/${id}`);
}

export function logoutClinicUser() {
  return api.post('/auth/logout');
}
