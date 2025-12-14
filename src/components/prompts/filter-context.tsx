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
  if (!context) {
    throw new Error("useFilterContext must be used within FilterProvider");
  }
  return context;
}
