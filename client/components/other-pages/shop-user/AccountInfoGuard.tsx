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
import { useBusyLock } from "@platform/react-busy";

type SectionState = {
  busy: boolean;
  dirty: boolean;
};

type AccountInfoGuardContextValue = {
  isAnyBusy: boolean;
  isAnyDirty: boolean;
  reportSectionState: (sectionId: string, state: SectionState) => void;
  clearSectionState: (sectionId: string) => void;
};

const AccountInfoGuardContext =
  createContext<AccountInfoGuardContextValue | null>(null);

type AccountInfoGuardProviderProps = {
  children: ReactNode;
};

export function AccountInfoGuardProvider({
  children,
}: AccountInfoGuardProviderProps) {
  const [sections, setSections] = useState<Record<string, SectionState>>({});

  const reportSectionState = useCallback(
    (sectionId: string, state: SectionState) => {
      setSections((current) => ({
        ...current,
        [sectionId]: state,
      }));
    },
    []
  );

  const clearSectionState = useCallback((sectionId: string) => {
    setSections((current) => {
      if (!(sectionId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[sectionId];
      return next;
    });
  }, []);

  const isAnyBusy = useMemo(
    () => Object.values(sections).some((section) => section.busy),
    [sections]
  );
  const isAnyDirty = useMemo(
    () => Object.values(sections).some((section) => section.dirty),
    [sections]
  );

  useBusyLock(isAnyBusy);

  useEffect(() => {
    if (!isAnyBusy && !isAnyDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isAnyBusy, isAnyDirty]);

  const value = useMemo(
    () => ({
      isAnyBusy,
      isAnyDirty,
      reportSectionState,
      clearSectionState,
    }),
    [clearSectionState, isAnyBusy, isAnyDirty, reportSectionState]
  );

  return (
    <AccountInfoGuardContext.Provider value={value}>
      {children}
    </AccountInfoGuardContext.Provider>
  );
}

export function useOptionalAccountInfoGuard() {
  const context = useContext(AccountInfoGuardContext);

  return {
    isAnyBusy: context?.isAnyBusy ?? false,
    isAnyDirty: context?.isAnyDirty ?? false,
    actionsDisabled: context?.isAnyBusy ?? false,
  };
}

export function useAccountInfoGuard(sectionId?: string) {
  const context = useContext(AccountInfoGuardContext);
  if (!context) {
    throw new Error(
      "useAccountInfoGuard must be used within AccountInfoGuardProvider"
    );
  }

  const { isAnyBusy, isAnyDirty, reportSectionState, clearSectionState } =
    context;

  useEffect(() => {
    if (!sectionId) {
      return;
    }

    return () => {
      clearSectionState(sectionId);
    };
  }, [clearSectionState, sectionId]);

  const reportState = useCallback(
    (state: SectionState) => {
      if (!sectionId) {
        return;
      }

      reportSectionState(sectionId, state);
    },
    [reportSectionState, sectionId]
  );

  const actionsDisabled = isAnyBusy;

  return {
    isAnyBusy,
    isAnyDirty,
    actionsDisabled,
    reportState,
  };
}
