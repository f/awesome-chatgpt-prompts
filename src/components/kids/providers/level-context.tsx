"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LevelContextType {
  levelSlug: string;
  setLevelSlug: (slug: string) => void;
}

const LevelContext = createContext<LevelContextType>({
  levelSlug: "",
  setLevelSlug: () => {},
});

export function LevelProvider({ 
  children, 
  levelSlug: initialSlug = ""
}: { 
  children: ReactNode; 
  levelSlug?: string;
}) {
  const [levelSlug, setLevelSlug] = useState(initialSlug);
  
  // Update if initialSlug changes
  useEffect(() => {
    if (initialSlug) {
      setLevelSlug(initialSlug);
    }
  }, [initialSlug]);

  return (
    <LevelContext.Provider value={{ levelSlug, setLevelSlug }}>
      {children}
    </LevelContext.Provider>
  );
}

export function useLevelSlug(): string {
  const context = useContext(LevelContext);
  return context.levelSlug;
}

export function useSetLevelSlug(): (slug: string) => void {
  const context = useContext(LevelContext);
  return context.setLevelSlug;
}
