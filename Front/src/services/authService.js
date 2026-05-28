import api from './api';

export const login = (username, password) =>
  api.post('/auth/login', { username, password }).then((r) => r.data);

export const register = (name, username, password) =>
  api.post('/auth/register', { name, username, password }).then((r) => r.data);
