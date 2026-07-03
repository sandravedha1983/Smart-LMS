import { motion, AnimatePresence } from 'framer-motion';

const CONTEXT_MESSAGES = {
  default: {
    headline: 'Hi there! 👋',
    intro: "I'm Dolphy, your AI learning assistant!",
    body: "✨ I'm here to help you learn smarter. Highlight any text in your lessons and I'll explain it with clear, beginner-friendly explanations and real-world examples.",
    tips: [
      { icon: '🎯', bold: 'During lessons:', text: 'Highlight text → Get instant AI help' },
      { icon: '📚', bold: 'No context switching', text: '— explanations appear right where you need them' },
      { icon: '🚀', bold: 'Learn at your pace', text: 'with real-world examples & summaries' },
    ],
    cta: "Let's learn! 🎓",
    color: 'from-sky-500 to-blue-600',
  },
  lesson: {
    headline: 'Learning time! 📖',
    intro: "I'm Dolphy — your AI concept guide.",
    body: "Need help understanding something? Highlight any sentence in the transcript below and click 'Explain with AI'. I'll break it down instantly.",
    tips: [
      { icon: '🧠', bold: 'How to use me:', text: 'Select → Explain → Understand' },
      { icon: '🌐', bold: 'Multilingual:', text: 'Choose your language for personalized explanations' },
      { icon: '📝', bold: 'Get:', text: 'Explanation + Real example + Summary in one click' },
    ],
    cta: 'Got it! 🐬',
    color: 'from-indigo-500 to-violet-600',
  },
  quiz: {
    headline: 'Great effort! 💪',
    intro: "Dolphy here — cheering you on!",
    body: "You're in the quiz zone. Take your time, read each question carefully, and apply what you've learned. You've got this!",
    tips: [
      { icon: '🎯', bold: 'Tip:', text: 'Relate each question to the lesson transcript' },
      { icon: '🔄', bold: 'No worries:', text: 'You can retake quizzes to improve your score' },
      { icon: '⭐', bold: 'Pass quizzes', text: 'to earn XP and unlock achievements!' },
    ],
    cta: 'Keep learning! 🎓',
    color: 'from-amber-500 to-orange-600',
  },
  student: {
    headline: 'Welcome back! 🌟',
    intro: "Ready to learn today?",
    body: "Your dashboard shows all available courses. Pick up where you left off or start something new. Each completed lesson earns you XP!",
    tips: [
      { icon: '📈', bold: 'Track progress:', text: 'See completion % for each course' },
      { icon: '🏆', bold: 'Earn achievements:', text: 'Complete lessons and quizzes for badges' },
      { icon: '🧩', bold: 'Puzzle Zone:', text: 'Solve daily puzzles for bonus XP' },
    ],
    cta: 'Start learning! 🚀',
    color: 'from-sky-500 to-blue-600',
  },
  professor: {
    headline: "Professor Portal 🎓",
    intro: "Create. Teach. Inspire.",
    body: "Use the professor dashboard to create courses, add lessons with transcripts and videos, and build quizzes for your students.",
    tips: [
      { icon: '📋', bold: 'Transcript is key:', text: 'Students use it for AI-powered explanations' },
      { icon: '🎬', bold: 'Add video URLs:', text: 'YouTube, Vimeo, or direct MP4 links work' },
      { icon: '✅', bold: 'Publish checklist:', text: 'Lesson + Video + Transcript + Quiz = Ready!' },
    ],
    cta: 'Create course! 📚',
    color: 'from-emerald-500 to-teal-600',
  },
  admin: {
    headline: 'Admin Control 🛡️',
    intro: "Platform management hub.",
    body: "Approve professor requests, monitor AI usage stats, and oversee platform health from the admin dashboard.",
    tips: [
      { icon: '👤', bold: 'Professor queue:', text: 'Approve pending professor registrations' },
      { icon: '📊', bold: 'Analytics:', text: 'Monitor courses, lessons, and AI interaction counts' },
      { icon: '🔐', bold: 'Security:', text: 'All routes are role-protected and JWT-secured' },
    ],
    cta: 'Got it! 🛡️',
    color: 'from-rose-500 to-pink-600',
  },
  achievements: {
    headline: 'Achievement Hunter! 🏆',
    intro: "Your badges await!",
    body: "Complete lessons, pass quizzes, and solve puzzles to unlock XP-based achievements. Track your progress to the top!",
    tips: [
      { icon: '⚡', bold: 'XP System:', text: 'Every completed lesson gives you 15 XP' },
      { icon: '🎯', bold: 'Quiz XP:', text: 'Pass a quiz for the first time to earn 20 XP' },
      { icon: '🧩', bold: 'Puzzle XP:', text: 'Solve daily puzzles for bonus rewards' },
    ],
    cta: 'Let\'s earn! 🏅',
    color: 'from-yellow-500 to-amber-600',
  },
  puzzles: {
    headline: 'Puzzle Zone! 🧩',
    intro: "Brain workout time!",
    body: "Solve memory, word, logic, and IQ puzzles to earn bonus XP. A new challenge awaits you every day!",
    tips: [
      { icon: '🧠', bold: 'Daily puzzle:', text: 'One new puzzle per day for maximum rewards' },
      { icon: '🎯', bold: 'Categories:', text: 'Memory, Word, Logic & IQ challenges' },
      { icon: '🔥', bold: 'Streak:', text: 'Solve puzzles daily to maintain your streak' },
    ],
    cta: 'Solve puzzles! 🧩',
    color: 'from-purple-500 to-violet-600',
  },
};

export default function DolphyGreeting({ open, onClose, context = 'default' }) {
  const msg = CONTEXT_MESSAGES[context] || CONTEXT_MESSAGES.default;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-sm">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="relative z-10 mx-auto w-full max-w-sm sm:max-w-md rounded-t-[2rem] sm:rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              ✕
            </button>

            {/* Mascot Image */}
            <div className="flex justify-center mb-5 overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-sky-500/10 to-indigo-600/15 border border-white/10 shadow-inner h-48 sm:h-56">
              <img
                src="/dolphy-mascot.png"
                alt="Dolphy Mascot"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Greeting text */}
            <div className="text-center">
              <motion.h2
                key={`${context}-h`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-1"
              >
                {msg.headline}
              </motion.h2>

              <motion.p
                key={`${context}-i`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="text-sm text-sky-300 font-semibold mb-3"
              >
                I'm <span className="text-white">Dolphy</span> — {msg.intro}
              </motion.p>

              <motion.p
                key={`${context}-b`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-sm text-white/70 leading-relaxed mb-5"
              >
                {msg.body}
              </motion.p>

              <motion.div
                key={`${context}-t`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="space-y-2 text-left mb-6"
              >
                {msg.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl bg-white/5 border border-white/8 px-3 py-2">
                    <span className="text-base shrink-0 mt-0.5">{tip.icon}</span>
                    <p className="text-xs text-white/70 leading-relaxed">
                      <span className="font-semibold text-white/90">{tip.bold}</span>{' '}
                      {tip.text}
                    </p>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onClose}
                className={`inline-flex rounded-full bg-gradient-to-r ${msg.color} px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl`}
              >
                {msg.cta}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
