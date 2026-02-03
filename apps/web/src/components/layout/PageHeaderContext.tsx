import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface PageHeaderConfig {
  title?: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
}

interface PageHeaderContextValue {
  header: PageHeaderConfig;
  setHeader: (config: PageHeaderConfig) => void;
  resetHeader: () => void;
}

const defaultHeader: PageHeaderConfig = {
  title: '',
  subtitle: '',
  backTo: undefined,
  backLabel: 'Volver',
};

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function PageHeaderProvider({ children }: { children: React.ReactNode }) {
  const [header, setHeaderState] = useState<PageHeaderConfig>(defaultHeader);

  const setHeader = useCallback((config: PageHeaderConfig) => {
    setHeaderState({ ...defaultHeader, ...config });
  }, []);

  const resetHeader = useCallback(() => {
    setHeaderState(defaultHeader);
  }, []);

  const value = useMemo(
    () => ({
      header,
      setHeader,
      resetHeader,
    }),
    [header, resetHeader, setHeader]
  );

  return <PageHeaderContext.Provider value={value}>{children}</PageHeaderContext.Provider>;
}

export function usePageHeader(config?: PageHeaderConfig) {
  const context = useContext(PageHeaderContext);

  if (!context) {
    throw new Error('usePageHeader must be used within PageHeaderProvider');
  }

  const { setHeader, resetHeader } = context;
  const { title, subtitle, backTo, backLabel } = config || {};
  const isEnabled = config !== undefined;

  useEffect(() => {
    if (!isEnabled) return;
    setHeader({ title, subtitle, backTo, backLabel });
    return () => resetHeader();
  }, [backLabel, backTo, isEnabled, resetHeader, setHeader, subtitle, title]);

  return context;
}
