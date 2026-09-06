"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BusyContextValue = {
  busy: boolean;
  registerBusy: () => () => void;
};

const BusyContext = createContext<BusyContextValue | null>(null);

export function BusyProvider({ children }: { children: ReactNode }) {
  const [busyCount, setBusyCount] = useState(0);

  const registerBusy = useCallback(() => {
    setBusyCount((current) => current + 1);
    return () => setBusyCount((current) => Math.max(0, current - 1));
  }, []);

  const value = useMemo(
    () => ({
      busy: busyCount > 0,
      registerBusy,
    }),
    [busyCount, registerBusy]
  );

  return (
    <BusyContext.Provider value={value}>{children}</BusyContext.Provider>
  );
}

export function useBusy() {
  const context = useContext(BusyContext);
  if (!context) {
    throw new Error("useBusy must be used within BusyProvider");
  }
  return context;
}

export function useOptionalBusy() {
  return useContext(BusyContext);
}

export function useBusyLock(active: boolean) {
  const { registerBusy } = useBusy();

  useEffect(() => {
    if (!active) {
      return;
    }

    return registerBusy();
  }, [active, registerBusy]);
}

export const CrudBusyProvider = BusyProvider;
export const useCrudBusy = useBusy;
export const useCrudBusyLock = useBusyLock;
