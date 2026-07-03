import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Typewriter from './Typewriter';

const features = [
  { title: 'Inline AI Explanations', description: 'Highlight any transcript sentence and get instant contextual answers without leaving the lesson.' },
  { title: 'Smart Progress Tracking', description: 'See your course completion and lesson milestones at a glance.' },
  { title: 'Video + Transcript Learning', description: 'Watch lessons, follow transcripts, and stay in flow with a unified interface.' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl sm:rounded-[1.5rem] px-4 sm:px-6 py-14 sm:py-22 text-white md:px-12">
      {/* Section-specific video overlay (slightly less dark than App-wide) */}
      <div className="absolute inset-0 bg-[rgba(2,6,23,0.35)]" />
      {/* Radial accent glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_45%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.12),transparent_40%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 sm:gap-12 lg:flex-row lg:items-center py-4 sm:py-8">
        {/* Left: Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <p className="mb-3 sm:mb-4 inline-flex rounded-full bg-indigo-500/15 border border-indigo-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">
            AI-powered learning
          </p>
          <h1 className="mt-2 hero-title font-extrabold tracking-tight leading-tight">
            <Typewriter
              lines={['Learn Smarter.', 'Understand Faster.', 'Powered by AI.']}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl"
              cursorClassName="text-sky-400"
            />
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl hero-sub text-white/70">
            An AI-powered learning platform that helps students understand concepts through contextual explanations, real-world examples, and personalized learning assistance.
          </p>
          <div className="mt-6 sm:mt-10 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full px-5 sm:px-7 py-3 text-sm sm:text-base font-semibold text-white btn-gradient shadow-glow transition hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                ✨ Start Learning Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/6 px-5 sm:px-7 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/12"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Feature cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:flex-1"
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl sm:rounded-[1.75rem] border border-white/10 bg-white/6 p-4 sm:p-6 backdrop-blur-xl hover:bg-white/10 transition duration-250"
            >
              <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-sky-400 font-semibold">{feature.title}</p>
              <p className="mt-2 sm:mt-4 text-sm sm:text-base leading-6 sm:leading-7 text-white/70">{feature.description}</p>
            </div>
          ))}

          {/* Stats chip */}
          <div className="rounded-2xl sm:rounded-[1.75rem] border border-emerald-500/20 bg-emerald-500/8 p-4 sm:p-6 backdrop-blur-xl">
            <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-emerald-400 font-semibold">Multilingual AI</p>
            <p className="mt-2 sm:mt-4 text-sm sm:text-base leading-6 sm:leading-7 text-white/70">
              Explanations in English, Telugu, Hindi, Tamil &amp; Kannada — in your language, your way.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
