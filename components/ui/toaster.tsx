"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((props: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { ...props, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(t => (
          <div key={t.id} className={cn("rounded-lg border p-4 shadow-lg transition-all", t.variant === "destructive" ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-card border-border")}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
              </div>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-muted-foreground hover:text-foreground ml-2">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
