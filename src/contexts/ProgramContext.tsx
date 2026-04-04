import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { programService, ProgramType } from '../services/programService';

interface ProgramContextType {
  selectedProgram: ProgramType;
  setProgram: (program: ProgramType, userId: string) => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

interface ProgramProviderProps {
  children: ReactNode;
  userId: string | null;
}

export const ProgramProvider: React.FC<ProgramProviderProps> = ({ children, userId }) => {
  const [selectedProgram, setSelectedProgram] = useState<ProgramType>('bodybuilding');

  // On login, load the authoritative value from Supabase (falls back to localStorage cache)
  useEffect(() => {
    if (!userId) return;

    programService.loadFromSupabase(userId).then(program => {
      setSelectedProgram(program);
    });
  }, [userId]);

  const setProgram = (program: ProgramType, uid: string) => {
    programService.setSelectedProgram(uid, program);
    setSelectedProgram(program);
  };

  return (
    <ProgramContext.Provider value={{ selectedProgram, setProgram }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = (): ProgramContextType => {
  const context = useContext(ProgramContext);
  if (!context) throw new Error('useProgram must be used within a ProgramProvider');
  return context;
};
