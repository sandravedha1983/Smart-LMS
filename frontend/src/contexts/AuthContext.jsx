import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, register as registerRequest, refreshToken as refreshTokenRequest } from '../services/authService';
import { getProfile } from '../services/profileService';
import { getAccessToken, getRefreshToken, setTokens, setAccessToken, clearTokens } from '../utils/token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(getAccessToken());
  const [refreshToken, setRefreshTokenState] = useState(getRefreshToken());
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      clearTokens();
      setProfile(null);
      return;
    }
    if (!profile) {
      fetchProfile();
    }
  }, [accessToken]);

  const fetchProfile = async () => {
    try {
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (err) {
      console.warn('Failed to load profile', err);
    }
  };

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginRequest(credentials);
      setTokens(data.access, data.refresh);
      setAccessTokenState(data.access);
      setRefreshTokenState(data.refresh);
      await fetchProfile();
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.detail || 'Login failed. Check credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await registerRequest(payload);
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.username?.[0] || err?.response?.data?.email?.[0] || err?.response?.data?.password?.[0] || 'Registration failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const data = await refreshTokenRequest({ refresh: refreshToken });
      setAccessToken(data.access);
      setAccessTokenState(data.access);
      await fetchProfile();
      return data.access;
    } catch (err) {
      logout();
      throw err;
    }
  };

  const logout = () => {
    clearTokens();
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setProfile(null);
    navigate('/login');
  };

  const isAuthenticated = useMemo(() => Boolean(accessToken), [accessToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, accessToken, profile, loading, error, login, register, refreshSession, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
