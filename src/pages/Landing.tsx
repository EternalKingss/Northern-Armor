import React from 'react';
import { motion } from 'framer-motion';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0d1117 0%, #0a0f1a 40%, #0d1117 100%)' }}
    >
      {/* Background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(31,111,235,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-200px] right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(31,111,235,0.3) 0%, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="text-white font-bold text-lg tracking-widest font-['Inter_Tight',sans-serif]">
          NORTHERN ARMOR
        </div>
        <button
          onClick={onSignIn}
          className="text-white/70 hover:text-white text-sm transition-colors"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#1f6feb] text-sm font-semibold tracking-widest uppercase mb-4">
            AI-Powered Gym Tracker
          </p>
          <h1 className="text-white text-5xl sm:text-6xl md:text-7xl font-bold leading-tight mb-6 font-['Inter_Tight',sans-serif]">
            Train Without Guilt.
          </h1>
          <p className="text-white/60 text-lg sm:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            The only gym app that doesn't punish you for being human. Skip a session, change your mind,
            come back when you're ready — your progress is always waiting.
          </p>
          <p className="text-white/40 text-base max-w-xl mx-auto mb-10">
            Northern Armor combines AI-generated workout programs with a zero-shame philosophy so you
            actually stick with training long-term.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: '#1f6feb', boxShadow: '0 0 30px rgba(31,111,235,0.4)' }}
            >
              Start Free Trial — 7 Days Free
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white/70 text-base border border-white/10 hover:border-white/30 hover:text-white transition-all"
            >
              Sign In
            </button>
          </div>
          <p className="text-white/30 text-sm mt-4">
            7-day free trial · then $9.99/month · cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Problem / Contrast */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-white text-3xl sm:text-4xl font-bold text-center mb-4 font-['Inter_Tight',sans-serif]">
            Other apps make you feel like a failure.
          </h2>
          <p className="text-white/50 text-center text-base sm:text-lg max-w-2xl mx-auto mb-12">
            Missed three workouts? Red streak. Skipped leg day? Notification guilt-trip. Most fitness
            apps are designed around shame and pressure — and that's exactly why people quit them.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-red-400 font-bold mb-3 text-sm uppercase tracking-wide">
                Traditional apps
              </h3>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>Broken streak? You failed.</li>
                <li>Skipped today? Guilt notification.</li>
                <li>Missed a week? Start over.</li>
                <li>Not in the mood? Discipline lecture.</li>
              </ul>
            </div>
            <div
              className="border rounded-2xl p-6"
              style={{
                background: 'rgba(31,111,235,0.08)',
                borderColor: 'rgba(31,111,235,0.3)',
              }}
            >
              <h3 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: '#1f6feb' }}>
                Northern Armor
              </h3>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>Skipped today? That's a valid choice.</li>
                <li>Not feeling that workout? Pick a different one.</li>
                <li>Took a break? Welcome back, no questions.</li>
                <li>Training on your terms, always.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-white text-3xl sm:text-4xl font-bold text-center mb-4 font-['Inter_Tight',sans-serif]">
          Built for real people, not perfect athletes
        </h2>
        <p className="text-white/50 text-center text-base max-w-xl mx-auto mb-12">
          Every feature is designed to remove friction and keep you moving forward — even when life
          gets in the way.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Skip freely, zero penalty',
              desc: "Not feeling today's session? Skip it. There are no streaks to break, no shame triggers, no punishment. Just come back when you're ready.",
            },
            {
              title: 'AI-generated workout programs',
              desc: 'Get a personalized training plan built by AI around your goals, available equipment, and any injuries. Programs that adapt to you — not the other way around.',
            },
            {
              title: 'Workout logging & history',
              desc: 'Log every set, rep, and weight with a fast, distraction-free interface. Your full workout history is always available to review.',
            },
            {
              title: 'Progress tracking & analytics',
              desc: 'See your strength gains over time with clean charts and honest stats. Progress without the toxic metrics — no calorie shaming, no weight obsession.',
            },
            {
              title: 'XP & achievement system',
              desc: 'Earn XP and unlock achievements as you train. The system rewards showing up consistently — whether that means daily sessions or three times a week.',
            },
            {
              title: 'Custom workout builder',
              desc: 'Not into the AI program today? Build your own workout from scratch with our full exercise library, and log it just like any other session.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors"
            >
              <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-white text-3xl sm:text-4xl font-bold text-center mb-4 font-['Inter_Tight',sans-serif]">
          How it works
        </h2>
        <p className="text-white/50 text-center text-base max-w-xl mx-auto mb-12">
          Getting started with Northern Armor takes less than two minutes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create your account',
              desc: 'Sign up in seconds. No credit card required to start your 7-day free trial.',
            },
            {
              step: '02',
              title: 'Get your AI program',
              desc: 'Answer a few quick questions about your goals and equipment. Your personalized workout program is generated instantly.',
            },
            {
              step: '03',
              title: 'Train on your schedule',
              desc: 'Log workouts when you want. Skip when you need to. The app works around your life, not against it.',
            },
            {
              step: '04',
              title: 'Watch the long game',
              desc: 'Consistent, guilt-free training adds up. Track your strength gains and see real progress over weeks and months.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div
                className="text-3xl font-bold mb-3 font-['Inter_Tight',sans-serif]"
                style={{ color: '#1f6feb' }}
              >
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 px-6 py-16 max-w-lg mx-auto text-center">
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4 font-['Inter_Tight',sans-serif]">
          Simple pricing
        </h2>
        <p className="text-white/50 text-base mb-10">
          One plan. Full access. Cancel anytime — no questions asked.
        </p>

        <div
          className="border rounded-2xl p-8"
          style={{
            background: 'rgba(31,111,235,0.06)',
            borderColor: 'rgba(31,111,235,0.25)',
          }}
        >
          <div className="text-white/40 text-sm line-through mb-1">$9.99/month</div>
          <div className="text-white text-5xl font-bold mb-1 font-['Inter_Tight',sans-serif]">Free</div>
          <div className="text-white/50 text-sm mb-2">for your first 7 days</div>
          <div className="text-white/40 text-sm mb-8">then $9.99/month — cancel anytime</div>

          <ul className="space-y-3 text-left mb-8">
            {[
              'AI-generated personalized workout programs',
              'Unlimited workout logging & history',
              'Progress tracking & analytics',
              'XP & achievement progression system',
              'Custom workout builder',
              'Mobile-friendly PWA — works offline',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-white/70 text-sm">
                <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={onGetStarted}
            className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: '#1f6feb', boxShadow: '0 0 24px rgba(31,111,235,0.4)' }}
          >
            Start Free Trial
          </button>
          <p className="text-white/30 text-xs mt-3">No credit card required to start</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-white/30 text-sm font-semibold tracking-widest">NORTHERN ARMOR</div>
          <div className="flex gap-6 text-white/30 text-sm">
            <a href="/privacy-policy.html" className="hover:text-white/60 transition-colors">
              Privacy Policy
            </a>
            <button
              onClick={onSignIn}
              className="hover:text-white/60 transition-colors"
            >
              Sign In
            </button>
          </div>
          <div className="text-white/20 text-xs">
            © {new Date().getFullYear()} Northern Armor. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
