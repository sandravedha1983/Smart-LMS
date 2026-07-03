import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from '../utils/token';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // When sending FormData (file uploads), remove Content-Type
  // so the browser can set the correct multipart/form-data boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = getRefreshToken();

    if (error.response?.status === 401 && !originalRequest?._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken }, {
          headers: { 'Content-Type': 'application/json' }
        });
        const newAccessToken = response.data.access;
        setAccessToken(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return axios(originalRequest);
      } catch (refreshError) {
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
