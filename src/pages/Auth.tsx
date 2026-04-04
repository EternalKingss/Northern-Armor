import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../components';
import { useAuth } from '../contexts/AuthContext';

type ViewMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthProps {
  isPasswordRecovery?: boolean;
  initialMode?: 'login' | 'signup';
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ isPasswordRecovery = false, initialMode = 'login', onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>(isPasswordRecovery ? 'reset-password' : initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, signInWithGoogle, signup, resetPassword, updatePassword, logout } = useAuth();

  const showMessage = (text: string, type: 'success' | 'error' | 'warning') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Show message on password recovery
  useEffect(() => {
    if (isPasswordRecovery) {
      setMessage({ text: 'Enter your new password below', type: 'success' });
    }
  }, [isPasswordRecovery]);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      if (!result.success && result.message) {
        showMessage(result.message, 'error');
        setIsGoogleLoading(false);
      }
    } catch (error) {
      showMessage('An unexpected error occurred with Google sign-in', 'error');
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        showMessage('Login successful!', 'success');
      } else {
        if (result.attemptsLeft !== undefined && result.attemptsLeft > 0) {
          showMessage(
            `${result.message || 'Invalid credentials'}. ${result.attemptsLeft} attempts remaining.`,
            'warning'
          );
        } else {
          showMessage(result.message || 'Login failed', 'error');
        }
      }
    } catch (error) {
      showMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showMessage('Please enter your name', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password, name);

      if (success) {
        showMessage('Account created successfully!', 'success');
      } else {
        showMessage('Failed to create account. Email may already be registered.', 'error');
      }
    } catch (error) {
      showMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.success) {
        showMessage(result.message, 'success');
        // Go back to login after 3 seconds
        setTimeout(() => setViewMode('login'), 3000);
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await updatePassword(password);

      if (result.success) {
        showMessage('Password updated successfully! Logging out...', 'success');

        // Wait a moment to show the message, then logout and reload
        setTimeout(() => {
          logout();
          // Completely reload the page to clear all state and URL hash
          window.location.href = window.location.origin + window.location.pathname;
        }, 1500);
      } else {
        showMessage(result.message, 'error');
        setIsLoading(false);
      }
    } catch (error) {
      showMessage('An unexpected error occurred', 'error');
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (viewMode === 'login') {
      handleLogin(e);
    } else if (viewMode === 'signup') {
      handleSignup(e);
    } else if (viewMode === 'forgot-password') {
      handleForgotPassword(e);
    } else {
      handleUpdatePassword(e);
    }
  };

  return (
    <div
      className="fixed inset-0"
      style={{
        background: 'linear-gradient(135deg, #1a1410 0%, #2d1f0d 25%, #1f1610 50%, #0f0a05 100%)',
      }}
    >
      {/* Background glows - Golden/Amber theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 87, 0.25) 0%, rgba(255, 179, 71, 0.1) 40%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, rgba(249, 115, 22, 0.15) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Scrollable content area — handles keyboard-open on mobile */}
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-white text-4xl sm:text-5xl font-bold mb-2">💪</h1>
          <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-wide font-['Inter_Tight',sans-serif]">NORTHERN ARMOR</h2>
          <p className="text-white/60 mt-2 text-sm sm:text-base">Engineered for Performance</p>
        </div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 p-4 rounded-xl border-2 ${
                message.type === 'success'
                  ? 'bg-green-500/20 border-green-400 text-green-300'
                  : message.type === 'warning'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-red-500/20 border-red-400 text-red-300'
              }`}
            >
              <p className="text-sm font-semibold">{message.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <GlassCard>
          <div className="space-y-6">
            {/* Tab Selector - Only show for login/signup */}
            {viewMode !== 'forgot-password' && viewMode !== 'reset-password' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('login')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    viewMode === 'login'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-amber-950/40 text-amber-200/60 border-2 border-amber-500/20 hover:border-amber-400/40'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setViewMode('signup')}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    viewMode === 'signup'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-amber-950/40 text-amber-200/60 border-2 border-amber-500/20 hover:border-amber-400/40'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Back button for forgot password */}
            {viewMode === 'forgot-password' && (
              <button
                onClick={() => setViewMode('login')}
                className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>←</span>
                <span>Back to Login</span>
              </button>
            )}

            {/* Form Title */}
            <div className="text-center">
              <h3 className="text-white text-lg sm:text-xl font-bold">
                {viewMode === 'login' && 'Welcome Back'}
                {viewMode === 'signup' && 'Create Account'}
                {viewMode === 'forgot-password' && 'Reset Password'}
                {viewMode === 'reset-password' && 'Set New Password'}
              </h3>
              {viewMode === 'forgot-password' && (
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  Enter your email and we'll send you a password reset link
                </p>
              )}
              {viewMode === 'reset-password' && (
                <p className="text-white/60 text-xs sm:text-sm mt-2">
                  Choose a strong password for your account
                </p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {viewMode === 'signup' && (
                <div>
                  <label className="text-white/80 text-sm block mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20 transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              {viewMode !== 'reset-password' && (
                <div>
                  <label className="text-white/80 text-sm block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20 transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              )}

              {viewMode !== 'forgot-password' && (
                <>
                  <div>
                    <label className="text-white/80 text-sm block mb-2">
                      {viewMode === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20 transition-all"
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                    {(viewMode === 'signup' || viewMode === 'reset-password') && (
                      <p className="text-white/50 text-xs mt-1">Minimum 6 characters</p>
                    )}
                  </div>

                  {viewMode === 'reset-password' && (
                    <div>
                      <label className="text-white/80 text-sm block mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-amber-950/30 border-2 border-amber-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 focus:shadow-lg focus:shadow-amber-500/20 transition-all"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing...
                  </span>
                ) : (
                  <>
                    {viewMode === 'login' && 'Login'}
                    {viewMode === 'signup' && 'Create Account'}
                    {viewMode === 'forgot-password' && 'Send Reset Link'}
                    {viewMode === 'reset-password' && 'Update Password'}
                  </>
                )}
              </button>
            </form>

            {/* Google Sign-In - Only show for login/signup */}
            {(viewMode === 'login' || viewMode === 'signup') && (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full bg-white/10 hover:bg-white/15 border-2 border-white/20 hover:border-white/30 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Signing in...
                    </span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </>
            )}

            {/* Forgot Password Link */}
            {viewMode === 'login' && (
              <div className="text-center">
                <button
                  onClick={() => setViewMode('forgot-password')}
                  className="text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Toggle between login/signup */}
            {viewMode !== 'forgot-password' && (
              <div className="text-center text-sm text-white/60">
                {viewMode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      onClick={() => setViewMode('signup')}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Sign up
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      onClick={() => setViewMode('login')}
                      className="text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      Login
                    </button>
                  </p>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        <div className="text-center text-white/40 text-xs mt-6 space-y-1">
          <p>🔒 Your data is securely encrypted</p>
          <p>Account locked after 5 failed login attempts</p>
        </div>
      </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
