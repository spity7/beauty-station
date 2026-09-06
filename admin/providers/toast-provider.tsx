"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AdminToastViewport } from "@/components/ui/admin-toast-viewport";

export type AdminToastVariant = "error" | "success";

export type AdminToastItem = {
  id: number;
  message: string;
  variant: AdminToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: AdminToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const showToast = useCallback(
    (message: string, variant: AdminToastVariant = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, message, variant }]);

      const timeoutId = setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
        timeoutsRef.current.delete(id);
      }, TOAST_DURATION_MS);

      timeoutsRef.current.set(id, timeoutId);
    },
    []
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AdminToastViewport toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
