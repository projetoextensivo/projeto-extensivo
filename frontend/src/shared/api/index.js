import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', timeout: 15000, withCredentials: true });
export const errorMessage = error => error.response?.data?.message || (error.code === 'ECONNABORTED' ? 'A conexão demorou mais que o esperado. Tente novamente.' : 'Não foi possível conectar. Confira se a API está em execução e tente novamente.');
