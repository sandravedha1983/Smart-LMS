import api from '../api/axios';

export const submitQuizAttempt = async (quizId, scoreData) => {
  const response = await api.post(`/quizzes/${quizId}/attempt/`, scoreData);
  return response.data;
};

export const addQuizQuestion = async (lessonId, data) => {
  const response = await api.post(`/lessons/${lessonId}/quiz/`, data);
  return response.data;
};

export const updateQuizQuestion = async (questionId, data) => {
  const response = await api.patch(`/quizzes/questions/${questionId}/`, data);
  return response.data;
};

export const deleteQuizQuestion = async (questionId) => {
  await api.delete(`/quizzes/questions/${questionId}/`);
};
