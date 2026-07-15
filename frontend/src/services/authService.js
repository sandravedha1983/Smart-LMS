import api from '../api/axios';

export const login = async ({ username, password }) => {
  const response = await api.post('/auth/login/', { username, password });
  return response.data;
};

export const refreshToken = async ({ refresh }) => {
  const response = await api.post('/auth/refresh/', { refresh });
  return response.data;
};

export const register = async (payload) => {
  const response = await api.post('/auth/register/', payload);
  return response.data;
};
