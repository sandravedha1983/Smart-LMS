import api from '../api/axios';

export const getProgress = async () => {
  const response = await api.get('/progress/');
  return response.data;
};

export const recordProgress = async ({ lesson, watched_percentage = 0, completed = false }) => {
  const response = await api.post('/progress/', { lesson, watched_percentage, completed });
  return response.data;
};
