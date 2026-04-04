import React, { createContext, useContext, useState, useEffect } from 'react';

type WeightUnit = 'lbs' | 'kg';

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

interface UnitContextValue {
  unit: WeightUnit;
  setUnit: (u: WeightUnit) => void;
  /** Convert a stored-lbs value for display */
  display: (lbs: number) => number;
  /** Convert user-entered value back to lbs for storage */
  toLbs: (val: number) => number;
  label: string;
  /** Round-trip safe increment: lbs increments converted for current unit */
  weightIncrements: number[];
}

const UnitContext = createContext<UnitContextValue>({
  unit: 'lbs',
  setUnit: () => {},
  display: v => v,
  toLbs: v => v,
  label: 'lbs',
  weightIncrements: [2.5, 5, 10],
});

export const UnitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unit, setUnitState] = useState<WeightUnit>(() => {
    return (localStorage.getItem('weightUnit') as WeightUnit) || 'lbs';
  });

  const setUnit = (u: WeightUnit) => {
    localStorage.setItem('weightUnit', u);
    setUnitState(u);
  };

  const display = (lbs: number) =>
    unit === 'kg' ? Math.round(lbs * LBS_TO_KG * 4) / 4 : lbs; // round to nearest 0.25 kg

  const toLbs = (val: number) =>
    unit === 'kg' ? Math.round(val * KG_TO_LBS * 10) / 10 : val;

  const label = unit;

  const weightIncrements = unit === 'kg' ? [1.25, 2.5, 5] : [2.5, 5, 10];

  return (
    <UnitContext.Provider value={{ unit, setUnit, display, toLbs, label, weightIncrements }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => useContext(UnitContext);
