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

// --- Live Classes ---
export const getLiveClasses = async (owned = true) => {
  const query = owned ? '?owned=true' : '';
  const response = await api.get(`/live-classes/${query}`);
  return response.data?.results ?? [];
};

export const createLiveClass = async (data) => {
  const response = await api.post('/live-classes/', data);
  return response.data;
};

export const deleteLiveClass = async (id) => {
  await api.delete(`/live-classes/${id}/`);
};

// --- Assignments ---
export const getAssignments = async (owned = true) => {
  const query = owned ? '?owned=true' : '';
  const response = await api.get(`/assignments/${query}`);
  return response.data?.results ?? [];
};

export const createAssignment = async (data) => {
  // Use FormData if file uploads are included
  const response = await api.post('/assignments/', data);
  return response.data;
};

export const deleteAssignment = async (id) => {
  await api.delete(`/assignments/${id}/`);
};

// --- Analytics ---
export const getProfessorAnalytics = async () => {
  const response = await api.get('/professor/analytics/');
  return response.data;
};
