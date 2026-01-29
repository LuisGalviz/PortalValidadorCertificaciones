import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type SidebarState = 'expanded' | 'collapsed';

interface SidebarContextType {
  state: SidebarState;
  isMobileOpen: boolean;
  toggle: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const STORAGE_KEY = 'sidebar-preference';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SidebarState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as SidebarState) || 'expanded';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, state);
  }, [state]);

  const toggle = () => {
    setState((prev) => (prev === 'expanded' ? 'collapsed' : 'expanded'));
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <SidebarContext.Provider
      value={{
        state,
        isMobileOpen,
        toggle,
        toggleMobile,
        closeMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
