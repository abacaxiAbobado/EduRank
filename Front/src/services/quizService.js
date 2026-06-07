import api from './api';
export const getQuizzes = () => api.get('/quizzes').then(r => r.data);
export const getQuiz = (id) => api.get(`/quizzes/${id}`).then(r => r.data);
export const responderQuiz = (id, respostas) => api.post(`/quizzes/${id}/responder`, { respostas }).then(r => r.data);
export const createQuiz = (data) => api.post('/quizzes', data).then(r => r.data);
export const updateQuiz = (id, data) => api.put(`/quizzes/${id}`, data).then(r => r.data);
