import axios from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from '../utils/token';

let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';
// Aggressively strip trailing literal spaces, "%20", and slashes which can cause 404s
const API_BASE_URL = rawBaseUrl.replace(/(%20|\s|\/)+$/, '');

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
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      } else {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }
  }

  // Debugging: Log the final URL being requested
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`);

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

    // Debugging: Log the error response
    console.error(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.baseURL || ''}${originalRequest?.url}`, error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default api;
