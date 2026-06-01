import api from './api';

export const getRanking = () => api.get('/ranking').then((r) => r.data);
