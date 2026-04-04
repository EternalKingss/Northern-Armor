import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgramProvider } from './contexts/ProgramContext';
import { TierThemeProvider, useTierTheme } from './contexts/TierThemeContext';
import { ToastProvider, useToastContext } from './contexts/ToastContext';
import { UnitProvider } from './contexts/UnitContext';
import { usePrefersReducedMotion } from './hooks/useIsMobile';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './lib/supabase';

import Auth from './pages/Auth';
import Landing from './pages/Landing';


const GymTracker = lazy(() => import('./pages/GymTracker'));
const Progress = lazy(() => import('./pages/Progress'));
const Program = lazy(() => import('./pages/Program'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Settings = lazy(() => import('./pages/Settings'));
const CustomWorkout = lazy(() => import('./pages/CustomWorkout'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#1f6feb] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <div className="text-white text-lg">Loading...</div>
    </div>
  </div>
);

function AppContent() {
  const { user, isLoading, logout } = useAuth();
  const tierTheme = useTierTheme();
  const prefersReducedMotion = usePrefersReducedMotion();
  const toast = useToastContext();

  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('signup');
  const [currentPage, setCurrentPage] = useState<
    'workout' | 'progress' | 'program' | 'achievements' | 'settings' | 'custom'
  >('program');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('type') === 'recovery') {
      setIsPasswordRecovery(true);
    }

    const searchParams = new URLSearchParams(window.location.search);
    const subscription = searchParams.get('subscription');
    const payment = searchParams.get('payment');
    if (subscription === 'success' || payment === 'success') {
      toast.success('Subscription activated! Your free trial has started.');
      window.history.replaceState({}, '', window.location.pathname);
      // Re-fetch subscription status so the wall lifts immediately
      if (user && supabase) {
        supabase.from('users').select('subscription_status').eq('id', user.id).single()
          .then(({ data }) => setSubscriptionStatus(data?.subscription_status ?? 'inactive'));
      }
    } else if (subscription === 'cancelled' || payment === 'cancelled') {
      toast.info('Subscription cancelled. You can subscribe anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!user) setShowAuth(false);
  }, [user]);

  useEffect(() => {
    if (!user || !supabase) return;
    setSubscriptionLoading(true);
    supabase
      .from('users')
      .select('subscription_status')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setSubscriptionStatus(data?.subscription_status ?? 'inactive');
        setSubscriptionLoading(false);
      });
  }, [user]);

  const handleSubscribeFromWall = async () => {
    if (!supabase || !user) return;
    setSubscribing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1T88JpQURNn6byUhLgxdtdzq';
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (error || !data?.url) {
        toast.error('Failed to start checkout. Please try again.');
      } else {
        window.location.href = data.url;
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // ── Password recovery ──────────────────────────────────────────────────────
  if (isPasswordRecovery) {
    return <Auth isPasswordRecovery={true} />;
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    if (showAuth) {
      return <Auth isPasswordRecovery={false} initialMode={authInitialMode} onBack={() => setShowAuth(false)} />;
    }
    return (
      <Landing
        onGetStarted={() => { setAuthInitialMode('signup'); setShowAuth(true); }}
        onSignIn={() => { setAuthInitialMode('login'); setShowAuth(true); }}
      />
    );
  }

  // ── Logged in but subscription not yet loaded ──────────────────────────────
  if (subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // ── Logged in but no active subscription ───────────────────────────────────
  // If Supabase isn't configured, skip the gate (localStorage-only mode).
  const isSubscribed = !supabase || subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
  if (!isSubscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🛡️</div>
          <h1 className="text-white text-3xl font-bold mb-2">NORTHERN ARMOR</h1>
          <p className="text-white/50 text-sm mb-8">Personalized AI-powered training</p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-3">
            {[
              'AI-generated personalized workout plans',
              'Adjusts for your equipment & injuries',
              'Full workout tracking & progress analytics',
              'Achievements & progression system',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/80 text-sm">
                <span className="text-green-400 text-base">✓</span>
                {feature}
              </div>
            ))}
          </div>

          <div className="mb-2">
            <span className="text-white/40 text-sm line-through">$9.99/month</span>
          </div>
          <div className="text-white font-bold text-lg mb-1">7-day free trial</div>
          <div className="text-white/50 text-sm mb-6">then $9.99/month — cancel anytime</div>

          <button
            onClick={handleSubscribeFromWall}
            disabled={subscribing}
            className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all disabled:opacity-60"
            style={{ backgroundColor: '#1f6feb', boxShadow: '0 0 20px rgba(31,111,235,0.4)' }}
          >
            {subscribing ? 'Redirecting...' : 'Start Free Trial'}
          </button>

          <button
            onClick={logout}
            className="mt-4 text-white/30 hover:text-white/60 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  // ── Logged in → main app ───────────────────────────────────────────────────
  const getButtonStyle = (page: string) => {
    if (currentPage === page) {
      return {
        backgroundColor: tierTheme.tierColors.primary,
        boxShadow: `0 0 20px ${tierTheme.tierColors.glow}`,
      };
    }
    return {};
  };

  const avatarStyle = {
    backgroundColor: tierTheme.tierColors.primary,
    boxShadow: `0 0 15px ${tierTheme.tierColors.glow}`,
  };

  const fadeVariants = prefersReducedMotion
    ? { initial: {}, animate: {}, exit: {} }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <ProgramProvider userId={user.id}>
      <motion.div
        initial={fadeVariants.initial}
        animate={fadeVariants.animate}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5 }}
      >
        {/* ── Top nav ────────────────────────────────────────────────────── */}
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10"
          style={{ transform: 'translate3d(0, 0, 0)', paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <h1 className="text-white text-lg sm:text-xl font-bold">NORTHERN ARMOR</h1>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop nav */}
              <div className="hidden md:flex gap-3">
                {(
                  [
                    { page: 'program', label: 'Program' },
                    { page: 'workout', label: 'Workout' },
                    { page: 'progress', label: 'Progress' },
                  ] as const
                ).map(({ page, label }) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-6 py-2 rounded-full text-base font-semibold transition-all ${
                      currentPage === page
                        ? 'text-white'
                        : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                    }`}
                    style={getButtonStyle(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage('achievements')}
                  className={`px-6 py-2 rounded-full text-base font-semibold transition-all ${
                    currentPage === 'achievements'
                      ? 'text-white'
                      : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                  }`}
                  style={getButtonStyle('achievements')}
                  aria-label="View achievements"
                  aria-current={currentPage === 'achievements' ? 'page' : undefined}
                  title="Achievements"
                >
                  <span role="img" aria-label="Trophy">🏆</span>
                </button>
              </div>

              {/* Desktop avatar/settings */}
              <button
                onClick={() => setCurrentPage('settings')}
                className="hidden md:flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
                aria-label="Open settings"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={avatarStyle}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white text-sm font-medium">{user.name}</span>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 transition-colors gap-1.5 p-2.5"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <span
                  className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300 origin-center"
                  style={{ transform: mobileMenuOpen ? 'rotate(45deg) translate(0, 6px)' : 'none' }}
                />
                <span
                  className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300"
                  style={{ opacity: mobileMenuOpen ? 0 : 1, transform: mobileMenuOpen ? 'scaleX(0)' : 'none' }}
                />
                <span
                  className="block w-5 h-0.5 bg-white rounded-full transition-all duration-300 origin-center"
                  style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translate(0, -6px)' : 'none' }}
                />
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden border-t border-white/10 overflow-hidden"
              >
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3 pb-3 mb-2 border-b border-white/10">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                      style={avatarStyle}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm leading-tight">{user.name}</p>
                      <p className="text-white/40 text-xs font-mono">NORTHERN ARMOR</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { page: 'program', icon: '📋', label: 'Program' },
                        { page: 'workout', icon: '💪', label: 'Workout' },
                        { page: 'progress', icon: '📊', label: 'Progress' },
                        { page: 'achievements', icon: '🏆', label: 'Achievements' },
                        { page: 'settings', icon: '⚙️', label: 'Settings' },
                      ] as const
                    ).map(({ page, icon, label }) => (
                      <button
                        key={page}
                        onClick={() => { setCurrentPage(page); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl transition-all text-left ${
                          currentPage === page
                            ? 'text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                        style={currentPage === page ? { backgroundColor: `${tierTheme.tierColors.primary}30` } : {}}
                        aria-current={currentPage === page ? 'page' : undefined}
                      >
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Mobile bottom nav ───────────────────────────────────────────── */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/80 backdrop-blur-md border-t border-white/10 safe-area-bottom"
          style={{ transform: 'translate3d(0, 0, 0)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex justify-around items-center py-2 px-2">
            {(
              [
                { page: 'program', icon: '📋', label: 'Program' },
                { page: 'workout', icon: '💪', label: 'Workout' },
                { page: 'progress', icon: '📊', label: 'Progress' },
                { page: 'achievements', icon: '🏆', label: 'Achievements' },
              ] as const
            ).map(({ page, icon, label }) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[60px] ${
                  currentPage === page ? 'text-white' : 'text-white/50'
                }`}
                style={currentPage === page ? { backgroundColor: `${tierTheme.tierColors.primary}30` } : {}}
                aria-label={label}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <div className="pt-20 sm:pt-24 pb-24 md:pb-0">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              {currentPage === 'program' ? (
                <motion.div key="program" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Program />
                </motion.div>
              ) : currentPage === 'workout' ? (
                <motion.div key="workout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <GymTracker />
                </motion.div>
              ) : currentPage === 'progress' ? (
                <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Progress />
                </motion.div>
              ) : currentPage === 'achievements' ? (
                <motion.div key="achievements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Achievements />
                </motion.div>
              ) : currentPage === 'custom' ? (
                <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <CustomWorkout onNavigate={setCurrentPage} />
                </motion.div>
              ) : (
                <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Settings onNavigate={setCurrentPage} />
                </motion.div>
              )}
            </AnimatePresence>
          </Suspense>
        </div>
      </motion.div>
    </ProgramProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <UnitProvider>
          <AuthProvider>
            <TierThemeProvider>
              <AppContent />
            </TierThemeProvider>
          </AuthProvider>
        </UnitProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
