import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import LessonPage from '../pages/LessonPage';
import ProtectedRoute from '../components/ProtectedRoute';
import ProfessorDashboardPage from '../pages/ProfessorDashboardPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import PuzzleZonePage from '../pages/PuzzleZonePage';
import CertificatePage from '../pages/CertificatePage';
import AchievementDashboardPage from '../pages/AchievementDashboardPage';

export default function AppRoutes() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/professor" element={<ProtectedRoute>{profile?.role === 'professor' ? <ProfessorDashboardPage /> : <DashboardPage />}</ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute>{profile?.role === 'admin' ? <AdminDashboardPage /> : <DashboardPage />}</ProtectedRoute>} />
      <Route path="/courses/:id" element={<ProtectedRoute><CourseDetailsPage /></ProtectedRoute>} />
      <Route path="/lesson/:id" element={<ProtectedRoute><LessonPage /></ProtectedRoute>} />
      <Route path="/puzzles" element={<ProtectedRoute><PuzzleZonePage /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><AchievementDashboardPage /></ProtectedRoute>} />
      <Route path="/certificate/:courseId" element={<ProtectedRoute><CertificatePage /></ProtectedRoute>} />
      <Route path="*" element={<div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft">Page not found.</div>} />
    </Routes>
  );
}
