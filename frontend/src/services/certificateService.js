import api from '../api/axios';

export const getCertificate = async (courseId) => {
  const response = await api.get(`/certificates/${courseId}/`);
  return response.data;
};
