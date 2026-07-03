import api from '../api/axios';

export const getCourses = async (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await api.get(`/courses/${query}`);
  return response.data?.results ?? [];
};

export const getOwnedCourses = async () => {
  const response = await api.get('/courses/?owned=true');
  return response.data?.results ?? [];
};

export const getCourseById = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/`);
  return response.data;
};

export const createCourse = async (data) => {
  const response = await api.post('/courses/', data);
  return response.data;
};

export const updateCourse = async (courseId, data) => {
  const response = await api.patch(`/courses/${courseId}/`, data);
  return response.data;
};

export const deleteCourse = async (courseId) => {
  await api.delete(`/courses/${courseId}/`);
};

export const getLessonById = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/`);
  return response.data;
};

export const createLesson = async (data) => {
  const response = await api.post('/lessons/', data);
  return response.data;
};

export const updateLesson = async (lessonId, data) => {
  const response = await api.patch(`/lessons/${lessonId}/`, data);
  return response.data;
};

export const deleteLesson = async (lessonId) => {
  await api.delete(`/lessons/${lessonId}/`);
};

export const getLessonQuiz = async (lessonId) => {
  const response = await api.get(`/lessons/${lessonId}/quiz/`);
  return response.data;
};

export const retryLessonTranscription = async (lessonId) => {
  const response = await api.post(`/lessons/${lessonId}/retry-transcription/`);
  return response.data;
};
