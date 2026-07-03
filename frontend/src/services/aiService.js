import api from '../api/axios';

export const explainText = async ({ text, lesson_title, course_title, context, lesson_id, language, difficulty, follow_up_action }) => {
  const response = await api.post('/ai/explain/', {
    course_title,
    lesson_title,
    text,
    context,
    lesson_id,
    language,
    difficulty,
    follow_up_action,
  });
  return response.data;
};
