import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnit } from '../contexts/UnitContext';

// Standard plate denominations
const PLATE_SIZES_LBS = [45, 35, 25, 10, 5, 2.5] as const;
const PLATE_SIZES_KG  = [20, 15, 10, 5, 2.5, 1.25] as const;

const PLATE_STYLES_LBS: Record<number, { color: string; width: string; height: string }> = {
  45:  { color: '#ef4444', width: 'w-6',  height: 'h-20' },
  35:  { color: '#3b82f6', width: 'w-5',  height: 'h-16' },
  25:  { color: '#f59e0b', width: 'w-5',  height: 'h-14' },
  10:  { color: '#22c55e', width: 'w-4',  height: 'h-10' },
  5:   { color: '#a855f7', width: 'w-3',  height: 'h-8'  },
  2.5: { color: '#94a3b8', width: 'w-2',  height: 'h-6'  },
};

const PLATE_STYLES_KG: Record<number, { color: string; width: string; height: string }> = {
  20:   { color: '#ef4444', width: 'w-6',  height: 'h-20' },
  15:   { color: '#3b82f6', width: 'w-5',  height: 'h-16' },
  10:   { color: '#f59e0b', width: 'w-5',  height: 'h-14' },
  5:    { color: '#22c55e', width: 'w-4',  height: 'h-10' },
  2.5:  { color: '#a855f7', width: 'w-3',  height: 'h-8'  },
  1.25: { color: '#94a3b8', width: 'w-2',  height: 'h-6'  },
};

function calcPlates(targetWeight: number, barWeight: number, sizes: readonly number[]): { plate: number; count: number }[] {
  const perSide = (targetWeight - barWeight) / 2;
  if (perSide < 0) return [];
  const result: { plate: number; count: number }[] = [];
  let remaining = perSide;
  for (const plate of sizes) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      result.push({ plate, count });
      remaining -= count * plate;
      remaining = Math.round(remaining * 100) / 100;
    }
  }
  return result;
}

interface PlateCalculatorProps {
  onClose: () => void;
}

const PlateCalculator: React.FC<PlateCalculatorProps> = ({ onClose }) => {
  const { unit, display, toLbs } = useUnit();
  const isKg = unit === 'kg';

  // Bar weights in current unit
  const barOptions = isKg
    ? ([20, 15, 10] as const)
    : ([45, 35, 15] as const);

  const [targetWeight, setTargetWeight] = useState('');
  const [barWeight, setBarWeight] = useState<number>(barOptions[0]);

  // Keep bar weight valid when unit switches — reset to first option
  const validBar = (barOptions as readonly number[]).includes(barWeight) ? barWeight : barOptions[0];

  const target = parseFloat(targetWeight) || 0;
  const sizes = isKg ? PLATE_SIZES_KG : PLATE_SIZES_LBS;
  const styles = isKg ? PLATE_STYLES_KG : PLATE_STYLES_LBS;
  const fallbackStyle = isKg ? PLATE_STYLES_KG[1.25] : PLATE_STYLES_LBS[2.5];

  const plates = useMemo(() => calcPlates(target, validBar, sizes), [target, validBar, sizes]);

  const loadable = target >= validBar;
  const actualTotal = validBar + plates.reduce((s, p) => s + p.plate * p.count * 2, 0);
  const isExact = Math.abs(actualTotal - target) < 0.05;
  const visualPlates = plates.flatMap(p => Array(p.count).fill(p.plate));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[62] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="text-white font-bold text-lg">Plate Calculator</h3>
            <p className="text-white/40 text-xs">How to load the bar ({unit})</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Target weight input */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">
              Target Weight ({unit})
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder={isKg ? 'e.g. 100' : 'e.g. 225'}
              value={targetWeight}
              onChange={e => setTargetWeight(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-3 text-white text-lg font-bold text-center focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* Bar weight selector */}
          <div>
            <label className="text-white/50 text-xs uppercase tracking-wider block mb-1.5">Bar Weight</label>
            <div className="flex gap-2">
              {(barOptions as readonly number[]).map(w => (
                <button
                  key={w}
                  onClick={() => setBarWeight(w)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    validBar === w
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {w} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          {target > 0 && (
            <>
              {!loadable ? (
                <div className="text-center py-3 text-red-400 text-sm">
                  Target weight is less than bar weight ({validBar} {unit})
                </div>
              ) : (
                <>
                  {/* Barbell visual */}
                  <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3 text-center">Per side</p>
                    <div className="flex items-center justify-center gap-1 min-h-[88px]">
                      <div className="w-3 h-6 bg-white/30 rounded-sm flex-shrink-0" />
                      {visualPlates.map((plateSize, i) => {
                        const style = styles[plateSize] || fallbackStyle;
                        return (
                          <div
                            key={i}
                            title={`${plateSize} ${unit}`}
                            className={`${style.width} ${style.height} rounded-sm flex-shrink-0`}
                            style={{ backgroundColor: style.color }}
                          />
                        );
                      })}
                      <div className="flex-1 h-3 bg-white/20 rounded-full" style={{ minWidth: 24 }} />
                      {[...visualPlates].reverse().map((plateSize, i) => {
                        const style = styles[plateSize] || fallbackStyle;
                        return (
                          <div
                            key={`r-${i}`}
                            className={`${style.width} ${style.height} rounded-sm flex-shrink-0`}
                            style={{ backgroundColor: style.color }}
                          />
                        );
                      })}
                      <div className="w-3 h-6 bg-white/30 rounded-sm flex-shrink-0" />
                    </div>
                  </div>

                  {/* Plate list */}
                  {plates.length > 0 ? (
                    <div className="space-y-2">
                      {plates.map(({ plate, count }) => {
                        const style = styles[plate] || fallbackStyle;
                        return (
                          <div key={plate} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-6 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: style.color }}
                              />
                              <span className="text-white font-semibold">{plate} {unit}</span>
                            </div>
                            <span className="text-white/60 text-sm">
                              {count} per side <span className="text-white/30">({count * 2} total)</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-white/40 text-sm py-2">Bar only — no plates needed</p>
                  )}

                  {/* Total */}
                  <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
                    isExact ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
                  }`}>
                    <span className={`text-sm font-semibold ${isExact ? 'text-green-400' : 'text-amber-400'}`}>
                      {isExact ? '✓ Exact match' : '≈ Closest loadable'}
                    </span>
                    <span className={`text-lg font-bold ${isExact ? 'text-green-400' : 'text-amber-400'}`}>
                      {actualTotal} {unit}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlateCalculator;
