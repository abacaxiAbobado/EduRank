import api from './api';

export const getConteudos = () => api.get('/content').then((r) => r.data);
export const getConteudo = (id) => api.get(`/content/${id}`).then((r) => r.data);
