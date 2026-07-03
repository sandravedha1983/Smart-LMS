import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import Dolphy from './components/Dolphy';
import GlobalVideoBackground from './components/GlobalVideoBackground';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

// Pages that manage their own full-screen video layout
const FULL_SCREEN_PAGES = ['/login', '/register'];

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_PAGES.includes(location.pathname);

  return (
    <div className="min-h-screen text-text-primary relative">
      {/* Global video background behind everything */}
      <GlobalVideoBackground src="/hero-video.mp4" />

      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.35 }}
          className={isFullScreen
            ? 'relative z-10'
            : 'relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-10 md:px-6 md:pt-24'
          }
        >
          <AppRoutes />
        </motion.main>
      </AnimatePresence>

      {/* Dolphy AI assistant — only when authenticated (LandingPage has its own) */}
      {isAuthenticated && <Dolphy />}
    </div>
  );
}

export default App;
