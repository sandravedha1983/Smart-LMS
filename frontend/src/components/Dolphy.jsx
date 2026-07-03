import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import DolphyGreeting from './DolphyGreeting';
import { useLocation } from 'react-router-dom';

/**
 * Dolphy AI Assistant
 * A context-aware floating 3D dolphin mascot.
 * Context is derived from the current route.
 */

function getContext(pathname) {
  if (pathname.includes('/lesson/')) return 'lesson';
  if (pathname.includes('/quiz')) return 'quiz';
  if (pathname.includes('/dashboard') && !pathname.includes('professor') && !pathname.includes('admin')) return 'student';
  if (pathname.includes('/professor')) return 'professor';
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/achievements')) return 'achievements';
  if (pathname.includes('/puzzles')) return 'puzzles';
  return 'default';
}

export default function Dolphy() {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState('default');
  const [showBadge, setShowBadge] = useState(false);
  const location = useLocation();

  // Update context on route change
  useEffect(() => {
    const newContext = getContext(location.pathname);
    setContext(newContext);
  }, [location.pathname]);

  // Show greeting auto-popup on first visit (session-scoped)
  useEffect(() => {
    const hasSeen = sessionStorage.getItem('hasSeenDolphyGreeting');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('hasSeenDolphyGreeting', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (context === 'lesson') {
      setShowBadge(true);
      const timer = setTimeout(() => setShowBadge(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [context]);

  const handleClick = useCallback(() => {
    setOpen(true);
    setShowBadge(false);
  }, []);

  return (
    <>
      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 18, stiffness: 280, delay: 0.3 }}
        whileHover={{ y: -6, scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="dolphy fixed bottom-5 right-5 z-50 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-glow transition hover:shadow-xl"
        aria-label="Open Dolphy AI Assistant"
        id="dolphy-assistant-btn"
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white/8">
          {/* Improved SVG dolphin */}
          <svg viewBox="0 0 100 100" className="pointer-events-none w-12 h-12 sm:w-14 sm:h-14 drop-shadow">
            {/* Body */}
            <ellipse cx="50" cy="58" rx="26" ry="20" fill="white" opacity="0.95" />
            {/* Head */}
            <circle cx="52" cy="38" r="18" fill="white" opacity="0.95" />
            {/* Snout */}
            <ellipse cx="65" cy="38" rx="11" ry="7" fill="white" opacity="0.95" />
            {/* Dorsal fin */}
            <path d="M 50 32 Q 46 20 49 12 Q 51 10 53 12 Q 56 20 50 32" fill="white" opacity="0.9" />
            {/* Left eye */}
            <circle className="eye" cx="45" cy="34" r="2.8" fill="#0F172A" />
            <circle cx="45.8" cy="33.2" r="0.9" fill="white" opacity="0.9" />
            {/* Smile */}
            <path d="M 62 40 Q 67 42 65 44" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            {/* Tail flukes */}
            <path d="M 27 65 Q 17 56 12 50 Q 10 58 17 67 Z" fill="white" opacity="0.85" />
            <path d="M 27 65 Q 17 74 12 80 Q 10 72 17 63 Z" fill="white" opacity="0.85" />
          </svg>

          {/* Context badge */}
          <AnimatePresence>
            {showBadge && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="badge-pop absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[9px] font-bold shadow"
                aria-label="Dolphy tip available"
              >
                !
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.button>

      <DolphyGreeting open={open} onClose={() => setOpen(false)} context={context} />
    </>
  );
}
