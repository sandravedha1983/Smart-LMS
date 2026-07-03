import React from 'react';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Context-aware AI Doubts',
    description: 'Highlight transcript text and receive a tailored explanation with examples and summaries.',
    icon: '🧠',
    color: 'from-indigo-500/20 to-violet-500/10',
    border: 'border-indigo-500/20',
  },
  {
    title: 'Transcript-first Learning',
    description: 'Follow every lesson with synchronized transcript support and inline interactions.',
    icon: '📖',
    color: 'from-sky-500/20 to-cyan-500/10',
    border: 'border-sky-500/20',
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor completed lessons and watch progress in an intuitive student dashboard.',
    icon: '📈',
    color: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/20',
  },
  {
    title: 'Gamified Learning',
    description: 'Earn XP, unlock achievements, and solve daily puzzles to stay motivated.',
    icon: '🏆',
    color: 'from-amber-500/20 to-orange-500/10',
    border: 'border-amber-500/20',
  },
  {
    title: 'Multilingual AI',
    description: 'Get AI explanations in English, Telugu, Hindi, Tamil, or Kannada.',
    icon: '🌐',
    color: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/20',
  },
  {
    title: 'Smart Quizzes',
    description: 'Practice with professor-built quizzes and receive instant feedback per answer.',
    icon: '✅',
    color: 'from-purple-500/20 to-violet-500/10',
    border: 'border-purple-500/20',
  },
];

const pipelineSteps = [
  { step: '1', title: 'Highlight Text', desc: 'Select any sentence in the lesson transcript' },
  { step: '2', title: 'Context Builder', desc: 'Backend aggregates Course, Lesson & Text context' },
  { step: '3', title: 'OpenAI Prompting', desc: 'Generates personalized explanations & examples' },
  { step: '4', title: 'Inline Popup', desc: 'Displays answer without leaving the lesson screen' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    // NOTE: No <Dolphy /> here — App.jsx renders it only when authenticated
    <div className="space-y-10 sm:space-y-16">
      <HeroSection />

      {/* Features Grid */}
      <section className="space-y-5 sm:space-y-8">
        <div className="mx-auto max-w-3xl text-center px-2">
          <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-sky-400/80">What makes it smart</p>
          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-semibold text-white lg:text-5xl leading-tight">
            Designed for learners who want to stay in the flow.
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base leading-7 sm:leading-8 text-white/60">
            A premium learning experience that blends video lessons, transcripts, quizzes, and AI insights into one seamless interface.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl sm:rounded-3xl border ${feature.border} bg-gradient-to-br ${feature.color} glass-card p-5 sm:p-6 hover:shadow-glass transition-all duration-300`}
            >
              <div className="mb-3 sm:mb-4 inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10 text-xl sm:text-2xl border border-white/10">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 sm:mt-3 text-sm text-white/60 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* AI Pipeline Visualizer */}
      <section className="rounded-2xl sm:rounded-[2.5rem] glass-card p-5 sm:p-8 shadow-glass md:p-12">
        <div className="mx-auto max-w-3xl text-center mb-6 sm:mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-sky-400">Dynamic Pipeline</p>
          <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-white lg:text-4xl leading-tight">
            How the AI Context Solver Works
          </h2>
          <p className="mt-2 sm:mt-3 text-white/60 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Our smart context system preserves your learning flow. When you request help, it parses Course, Lesson, and nearby transcript data for pinpoint accuracy.
          </p>
        </div>

        <div className="flex flex-col items-stretch justify-center gap-3 sm:gap-5 lg:flex-row lg:items-center">
          {pipelineSteps.map((node, i) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                viewport={{ once: true }}
                className="flex-1 flex flex-col items-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/8 transition duration-250"
              >
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-sky-600 text-white font-bold text-xs sm:text-sm mb-2 sm:mb-3">
                  {node.step}
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm">{node.title}</h4>
                <p className="text-[10px] sm:text-xs text-white/50 mt-1 sm:mt-2 leading-relaxed">{node.desc}</p>
              </motion.div>
              {i < 3 && (
                <>
                  <div className="hidden lg:block text-white/30 text-2xl font-bold px-2 select-none animate-pulse">➔</div>
                  <div className="lg:hidden text-white/30 text-xl font-bold text-center select-none animate-pulse">↓</div>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-2xl sm:rounded-[2.5rem] glass-card border-indigo-500/20 px-4 sm:px-6 py-8 sm:py-12 text-white shadow-glass md:px-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_50%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-xs sm:text-sm uppercase tracking-[0.32em] text-sky-300">A smarter way to learn</p>
          <h2 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-semibold lg:text-5xl leading-tight">
            AI help that lives inside the lesson.
          </h2>
          <p className="mt-3 sm:mt-5 text-sm sm:text-base leading-7 sm:leading-8 text-white/60 max-w-2xl mx-auto">
            No more switching tools or losing context. Highlight transcript content, get a clear explanation, and continue learning within the same screen.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full btn-gradient px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-glow transition hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
              ✨ Start Learning Free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold text-white transition hover:bg-white/10 active:scale-95"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
