"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FilterContextType {
  isFilterPending: boolean;
  setFilterPending: (pending: boolean) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterPending, setFilterPending] = useState(false);

  return (
    <FilterContext.Provider value={{ isFilterPending, setFilterPending }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilterContext() {
  const context = useContext(FilterContext);
  // Return safe defaults if no provider exists (e.g., during SSR errors)
  // This prevents crashes when the component tree errors before reaching FilterProvider
  if (!context) {
    return {
      isFilterPending: false,
      setFilterPending: () => {},
    };
  }
  return context;
}
