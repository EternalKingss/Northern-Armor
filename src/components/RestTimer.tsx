import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RestTimerProps {
  duration: number; // seconds
  exerciseName: string;
  onComplete: () => void;
  onSkip: () => void;
}

/**
 * Parses a rest string like "90 sec", "2 min", "60-90 sec", "2-3 min" into seconds.
 * Returns a default of 90 if parsing fails.
 */
export function parseRestDuration(restStr: string | undefined): number {
  if (!restStr) return 90;
  const lower = restStr.toLowerCase();
  // Match range like "60-90" or "2-3" — take the higher value
  const rangeMatch = lower.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const high = parseInt(rangeMatch[2]);
    return lower.includes('min') ? high * 60 : high;
  }
  const singleMatch = lower.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1]);
    return lower.includes('min') ? val * 60 : val;
  }
  return 90;
}

function playBeep(frequency = 880, duration = 200) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch {
    // Audio not available — silently skip
  }
}

const RestTimer: React.FC<RestTimerProps> = ({ duration, exerciseName, onComplete, onSkip }) => {
  const [remaining, setRemaining] = useState(duration);
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Triple beep when done
    playBeep(880, 150);
    setTimeout(() => playBeep(880, 150), 200);
    setTimeout(() => playBeep(1100, 300), 400);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setRemaining(duration);

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleComplete();
          return 0;
        }
        // Beep at 3 seconds left
        if (prev === 4) playBeep(660, 100);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, handleComplete]);

  const pct = (remaining / duration) * 100;
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const timeStr = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${remaining}`;

  // Color shifts: green → amber → red as time runs out
  const colorHex = pct > 50 ? '#22c55e' : pct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onSkip}
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#161b22] border border-white/10 rounded-3xl p-8 w-full max-w-xs text-center shadow-2xl"
      >
        {/* Label */}
        <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Rest Period</p>
        <p className="text-white/70 text-sm font-semibold mb-6 truncate">{exerciseName}</p>

        {/* SVG Ring */}
        <div className="flex justify-center mb-6">
          <div className="relative" style={{ width: size, height: size }}>
            {/* Track */}
            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius}
                stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
            </svg>
            {/* Progress */}
            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
              <circle cx={size / 2} cy={size / 2} r={radius}
                stroke={colorHex} strokeWidth={strokeWidth} fill="none"
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${colorHex}88)` }}
              />
            </svg>
            {/* Center countdown */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold tabular-nums" style={{ color: colorHex }}>{timeStr}</span>
              <span className="text-white/30 text-xs mt-1">{mins > 0 ? 'min:sec' : 'seconds'}</span>
            </div>
          </div>
        </div>

        {/* Progress bar (thin) */}
        <div className="w-full bg-white/10 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, backgroundColor: colorHex, transition: 'width 0.9s linear' }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={onSkip}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all active:scale-95"
        >
          Skip Rest
        </button>

        <p className="text-white/20 text-xs mt-3">Tap outside to skip</p>
      </motion.div>
    </motion.div>
  );
};

export default RestTimer;
