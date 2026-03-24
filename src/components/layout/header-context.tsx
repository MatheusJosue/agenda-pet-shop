"use client";

import { useState, createContext, useContext, ReactNode } from "react";

interface HeaderContextType {
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode | null>(null);

  return (
    <HeaderContext.Provider value={{ action, setAction }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderAction() {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeaderAction must be used within HeaderProvider");
  }
  return context;
}
