import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard, Button, TierBackgroundWrapper } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useProgram } from '../contexts/ProgramContext';
import { useToastContext } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import {
  aiWorkoutService,
  WorkoutQuestionnaire,
  GeneratedWorkoutPlan,
  StoredCustomWorkout,
  MAX_CUSTOM_WORKOUTS,
  ChatMessage,
} from '../services/aiWorkoutService';
import { workoutService } from '../services/workoutService';
import { programService } from '../services/programService';

interface CustomWorkoutProps {
  onNavigate?: (page: 'workout' | 'progress' | 'program' | 'achievements' | 'settings' | 'custom') => void;
}

type Mode = 'home' | 'chat' | 'import';
type GeneratingState = 'idle' | 'generating' | 'done';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const CustomWorkout: React.FC<CustomWorkoutProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { setProgram } = useProgram();
  const toast = useToastContext();

  // Subscription / workouts state
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [existingWorkouts, setExistingWorkouts] = useState<StoredCustomWorkout[]>([]);
  const [canCreateMore, setCanCreateMore] = useState(true);

  // Navigation
  const [mode, setMode] = useState<Mode>('home');

  // Result state (shared between chat + import flows)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [generatedWorkoutId, setGeneratedWorkoutId] = useState<string | null>(null);
  const [generatingState, setGeneratingState] = useState<GeneratingState>('idle');

  // ── Chat mode state ─────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatReadyToGenerate, setChatReadyToGenerate] = useState(false);
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState<WorkoutQuestionnaire | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // ── Import mode state ───────────────────────────────────────────────────
  const [importText, setImportText] = useState('');
  const [isImportLoading, setIsImportLoading] = useState(false);

  // ── Load existing workouts + subscription status ────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!user) return;
      const workouts = await aiWorkoutService.getAllCustomWorkouts(user.id);
      setExistingWorkouts(workouts);
      setCanCreateMore(workouts.length < MAX_CUSTOM_WORKOUTS);

      if (supabase) {
        try {
          const { data } = await supabase
            .from('users')
            .select('subscription_status')
            .eq('id', user.id)
            .single();
          setIsSubscribed(data?.subscription_status === 'active');
        } catch {
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
      }
    };
    init();
  }, [user]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Kick off the conversation when entering chat mode
  useEffect(() => {
    if (mode === 'chat' && chatMessages.length === 0) {
      startConversation();
    }
  }, [mode]);

  // ── Subscription / paywall helpers ──────────────────────────────────────
  const handleSubscribe = async () => {
    if (!supabase) { toast.error('Supabase is not configured.'); return; }
    const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_1T88JpQURNn6byUhLgxdtdzq';
    setIsCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/?subscription=success`,
          cancelUrl: `${window.location.origin}/?subscription=cancelled`,
        },
      });
      if (error || !data?.url) { toast.error('Failed to start checkout. Please try again.'); return; }
      window.location.href = data.url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // ── Chat helpers ────────────────────────────────────────────────────────
  const startConversation = async () => {
    setIsChatLoading(true);
    try {
      const response = await aiWorkoutService.chatWithCoach(user!.id, []);
      setChatMessages([{ role: 'assistant', content: response.reply }]);
    } catch (err: any) {
      if (err?.message === 'SUBSCRIPTION_REQUIRED') { setIsSubscribed(false); setMode('home'); }
      else toast.error('Could not start conversation. Please try again.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || isChatLoading || !user) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await aiWorkoutService.chatWithCoach(user.id, updatedMessages);
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);

      if (response.readyToGenerate && response.questionnaire) {
        setChatReadyToGenerate(true);
        setPendingQuestionnaire(response.questionnaire);
      }
    } catch (err: any) {
      if (err?.message === 'SUBSCRIPTION_REQUIRED') { setIsSubscribed(false); setMode('home'); }
      else {
        toast.error('Something went wrong. Please try again.');
        setChatMessages(prev => [
          ...prev,
          { role: 'assistant', content: "Sorry, I hit a snag. Could you repeat that?" },
        ]);
      }
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleChatGenerate = async () => {
    if (!user || !pendingQuestionnaire) return;
    if (!canCreateMore) {
      toast.error(`Slots full (${MAX_CUSTOM_WORKOUTS}/${MAX_CUSTOM_WORKOUTS}). Delete a workout in Settings first.`);
      return;
    }
    setGeneratingState('generating');
    try {
      const response = await aiWorkoutService.generateWorkout(user.id, pendingQuestionnaire, {});
      if (response.success && response.workoutPlan) {
        setGeneratedPlan(response.workoutPlan);
        setGeneratedWorkoutId(response.workoutId || null);
        setGeneratingState('done');
        const workouts = await aiWorkoutService.getAllCustomWorkouts(user.id);
        setExistingWorkouts(workouts);
        setCanCreateMore(workouts.length < MAX_CUSTOM_WORKOUTS);
      } else if (response.error === 'SUBSCRIPTION_REQUIRED') {
        setIsSubscribed(false);
        setMode('home');
        setGeneratingState('idle');
      } else {
        toast.error(response.error || 'Failed to generate plan');
        setGeneratingState('idle');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setGeneratingState('idle');
    }
  };

  // ── Import helpers ──────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!user || !importText.trim()) { toast.warning('Please paste some workout content first.'); return; }
    if (!canCreateMore) {
      toast.error(`Slots full (${MAX_CUSTOM_WORKOUTS}/${MAX_CUSTOM_WORKOUTS}). Delete a workout in Settings first.`);
      return;
    }

    setIsImportLoading(true);
    setGeneratingState('generating');

    // Build a minimal questionnaire from the import (Claude fills in the blanks)
    const fallbackQuestionnaire: WorkoutQuestionnaire = {
      fitnessGoal: 'general_fitness',
      experienceLevel: 'intermediate',
      daysPerWeek: 4,
      sessionDuration: 60,
      equipment: ['barbell', 'dumbbells'],
      injuries: [],
      preferences: ['imported program'],
    };

    try {
      const response = await aiWorkoutService.importWorkout(user.id, importText, fallbackQuestionnaire);
      if (response.success && response.workoutPlan) {
        setGeneratedPlan(response.workoutPlan);
        setGeneratedWorkoutId(response.workoutId || null);
        setGeneratingState('done');
        const workouts = await aiWorkoutService.getAllCustomWorkouts(user.id);
        setExistingWorkouts(workouts);
        setCanCreateMore(workouts.length < MAX_CUSTOM_WORKOUTS);
      } else if (response.error === 'SUBSCRIPTION_REQUIRED') {
        setIsSubscribed(false);
        setMode('home');
        setGeneratingState('idle');
      } else {
        toast.error(response.error || 'Failed to import workout');
        setGeneratingState('idle');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
      setGeneratingState('idle');
    } finally {
      setIsImportLoading(false);
    }
  };

  // ── Shared result helpers ───────────────────────────────────────────────
  const handleStartTraining = async () => {
    if (!user || !generatedWorkoutId) return;
    const programType = programService.createCustomProgramType(generatedWorkoutId);
    setProgram(programType, user.id);
    await workoutService.updateProgression(user.id, { currentWeek: 1, completedDays: [] });
    toast.success('Switched to your new program! Starting Week 1.');
    onNavigate?.('workout');
  };

  const handleReset = () => {
    setGeneratedPlan(null);
    setGeneratedWorkoutId(null);
    setGeneratingState('idle');
    setChatMessages([]);
    setChatInput('');
    setChatReadyToGenerate(false);
    setPendingQuestionnaire(null);
    setImportText('');
    setMode('home');
  };

  // ── Loading skeleton while checking subscription ────────────────────────
  if (isSubscribed === null) {
    return (
      <TierBackgroundWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-sm">Checking access...</p>
          </div>
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Paywall ─────────────────────────────────────────────────────────────
  if (isSubscribed === false) {
    return (
      <TierBackgroundWrapper>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <GlassCard>
              <div className="text-center py-4">
                <div className="text-6xl mb-4">🧠</div>
                <h2 className="text-3xl font-bold text-white mb-2">AI Custom Workouts</h2>
                <p className="text-white/60 mb-6">
                  Chat with your AI coach to build a personalized program, or import any existing workout.
                </p>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-6 text-left space-y-3">
                  {[
                    'Conversational AI coach that gets to know you',
                    'Fully personalized to your goals and equipment',
                    'Import any workout from a spreadsheet or doc',
                    'AI-generated 8-week progressive program',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <span className="text-amber-400 text-lg">✓</span>
                      <span className="text-amber-100/90 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">$9.99</span>
                  <span className="text-white/50 text-lg">/month</span>
                </div>
                <Button variant="primary" onClick={handleSubscribe} disabled={isCheckoutLoading} className="w-full text-lg py-3">
                  {isCheckoutLoading ? 'Redirecting to checkout...' : 'Subscribe to Unlock'}
                </Button>
                <p className="text-white/30 text-xs mt-4">Cancel anytime. Redirects to Stripe's secure checkout.</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Generating overlay (shared) ─────────────────────────────────────────
  if (generatingState === 'generating') {
    return (
      <TierBackgroundWrapper>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <GlassCard>
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-6 inline-block"
              >
                🧠
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'import' ? 'Analyzing & Converting Your Program' : 'Building Your Program'}
              </h2>
              <p className="text-white/60 mb-6">
                {mode === 'import'
                  ? 'Claude is parsing your workout and structuring it into 8 progressive weeks...'
                  : 'Claude is designing your personalized 8-week plan...'}
              </p>
              <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 20, ease: 'linear' }}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Result view (shared) ────────────────────────────────────────────────
  if (generatingState === 'done' && generatedPlan) {
    return (
      <TierBackgroundWrapper>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">✨</div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {generatedPlan.programName}
                </h2>
                <p className="text-white/60 mt-2 text-sm">{generatedPlan.description}</p>
                <p className="text-amber-400 text-sm mt-1">
                  {generatedPlan.daysPerWeek} days/week • {generatedPlan.weeks.length} weeks
                </p>
              </div>

              {/* Week 1 preview */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <p className="text-white/40 text-xs uppercase tracking-wider">Week 1 Preview</p>
                {generatedPlan.weeks[0]?.days.map((day, di) => (
                  <div key={di} className="bg-white/5 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="text-white font-semibold">{day.name}</p>
                        <p className="text-white/50 text-xs">{day.focus}</p>
                      </div>
                      <span className="text-amber-400 text-xs font-medium">Day {di + 1}</span>
                    </div>
                    <div className="space-y-2">
                      {day.exercises.map((ex, ei) => (
                        <div key={ei} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="text-white">{ex.name}</p>
                            {ex.notes && <p className="text-white/40 text-xs">{ex.notes}</p>}
                          </div>
                          <div className="text-right ml-4 shrink-0">
                            <p className="text-amber-400 font-semibold">{ex.workingSets} × {ex.reps}</p>
                            <p className="text-white/40 text-xs">RPE {ex.lastSetRPE} · {ex.rest}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-center text-white/40 text-xs">
                  {existingWorkouts.length}/{MAX_CUSTOM_WORKOUTS} custom workout slots used
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" onClick={handleReset} className="flex-1">
                    {canCreateMore ? 'Create Another' : 'Slots Full — Delete in Settings'}
                  </Button>
                  <Button variant="primary" onClick={handleStartTraining} className="flex-1" disabled={!generatedWorkoutId}>
                    Use This Program →
                  </Button>
                </div>
                <p className="text-center text-white/30 text-xs">Switch between programs anytime in Settings</p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Chat mode ───────────────────────────────────────────────────────────
  if (mode === 'chat') {
    return (
      <TierBackgroundWrapper>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col h-[calc(100vh-80px)]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setMode('home')} className="text-white/50 hover:text-white transition-colors text-sm">
              ← Back
            </button>
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg">AI Coach</h2>
              <p className="text-white/40 text-xs">Chatting with Claude to build your program</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">🧠</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-2 pr-1">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-amber-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {isChatLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white/50 rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Ready-to-generate banner */}
          <AnimatePresence>
            {chatReadyToGenerate && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl p-4"
              >
                <p className="text-amber-200 text-sm font-medium mb-3">
                  ✅ Coach has everything needed to build your program!
                </p>
                <Button variant="primary" onClick={handleChatGenerate} className="w-full">
                  Generate My Program →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input bar */}
          {!chatReadyToGenerate && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                placeholder="Type your answer..."
                disabled={isChatLoading}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 text-sm outline-none focus:border-amber-400 disabled:opacity-50"
              />
              <button
                onClick={sendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 font-semibold text-sm transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Import mode ─────────────────────────────────────────────────────────
  if (mode === 'import') {
    return (
      <TierBackgroundWrapper>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard>
              <div className="mb-6">
                <button onClick={() => setMode('home')} className="text-white/50 hover:text-white transition-colors text-sm mb-4 block">
                  ← Back
                </button>
                <div className="text-4xl mb-3">📋</div>
                <h2 className="text-2xl font-bold text-white mb-1">Import a Workout</h2>
                <p className="text-white/60 text-sm">
                  Paste any workout — from a spreadsheet, Google Doc, Reddit post, or anywhere else.
                  Claude will analyze it, fix any issues, and build it into a structured 8-week program.
                </p>
              </div>

              <div className="mb-2">
                <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Paste your workout here</label>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={`Example formats work great:\n\nDay 1 – Push\nBench Press: 4x8-10\nOHP: 3x10-12\nTricep Dips: 3x8\n\nOr paste a spreadsheet copy (tab-separated),\na Google Doc export, or plain text list.`}
                  rows={12}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white/90 placeholder-white/25 text-sm outline-none focus:border-amber-400 resize-none leading-relaxed"
                />
              </div>
              <p className="text-white/30 text-xs mb-6">
                Supports any format: plain text, CSV, tab-separated, or structured lists.
                Claude will figure it out.
              </p>

              <Button
                variant="primary"
                onClick={handleImport}
                disabled={isImportLoading || !importText.trim()}
                className="w-full"
              >
                {isImportLoading ? 'Analyzing...' : 'Analyze & Import →'}
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </TierBackgroundWrapper>
    );
  }

  // ── Home (mode selector + existing workouts) ────────────────────────────
  return (
    <TierBackgroundWrapper>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Existing workouts */}
        {existingWorkouts.length > 0 && (
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard>
              <h3 className="text-white font-bold text-lg mb-4">Your Custom Programs</h3>
              <div className="space-y-3">
                {existingWorkouts.map((w) => (
                  <div key={w.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white font-medium text-sm">{w.workoutPlan.programName}</p>
                      <p className="text-white/40 text-xs">
                        {w.workoutPlan.daysPerWeek} days/week · {w.workoutPlan.weeks.length} weeks ·{' '}
                        {new Date(w.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-amber-400 text-xs font-medium px-2 py-1 bg-amber-500/10 rounded-lg">AI</span>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-3">
                {existingWorkouts.length}/{MAX_CUSTOM_WORKOUTS} slots used · Manage in Settings
              </p>
            </GlassCard>
          </motion.div>
        )}

        {/* Create new section */}
        {canCreateMore ? (
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">✨</div>
                <h2 className="text-2xl font-bold text-white mb-1">Create a New Program</h2>
                <p className="text-white/50 text-sm">Choose how you want to build it</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chat with AI Coach */}
                <button
                  onClick={() => setMode('chat')}
                  className="group p-5 rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400 transition-all text-left"
                >
                  <div className="text-4xl mb-3">🧠</div>
                  <h3 className="text-white font-bold text-base mb-1">Chat with AI Coach</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Have a natural conversation. Claude asks you questions and builds a fully personalized program.
                  </p>
                  <p className="text-amber-400 text-xs mt-3 font-medium group-hover:underline">Start chatting →</p>
                </button>

                {/* Import from spreadsheet */}
                <button
                  onClick={() => setMode('import')}
                  className="group p-5 rounded-2xl border-2 border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left"
                >
                  <div className="text-4xl mb-3">📋</div>
                  <h3 className="text-white font-bold text-base mb-1">Import a Workout</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Paste from a spreadsheet, Google Doc, or any other source. Claude analyzes and structures it.
                  </p>
                  <p className="text-white/40 text-xs mt-3 font-medium group-hover:text-white/60">Import content →</p>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        ) : (
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <GlassCard>
              <div className="text-center py-4">
                <div className="text-4xl mb-3">📦</div>
                <h3 className="text-white font-bold text-lg mb-2">All Slots Used</h3>
                <p className="text-white/60 text-sm mb-4">
                  You have {MAX_CUSTOM_WORKOUTS}/{MAX_CUSTOM_WORKOUTS} custom programs. Delete one in Settings to create a new one.
                </p>
                <Button variant="secondary" onClick={() => onNavigate?.('settings')}>
                  Go to Settings
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </TierBackgroundWrapper>
  );
};

export default CustomWorkout;
