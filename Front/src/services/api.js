import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    if (err.response?.status === 403 && err.response?.data?.suspensa) {
      const { motivo, ate } = err.response.data;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const params = new URLSearchParams({ motivo: motivo || '' });
      if (ate) params.set('ate', ate);
      window.location.href = `/suspensa?${params.toString()}`;
    }
    return Promise.reject(err);
  }
);

export default api;
