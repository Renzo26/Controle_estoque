import { X } from "lucide-react";
import type { ReactNode } from "react";

export function FormShell({
  title, subtitle, children, footer, onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full sm:max-h-[90vh] bg-background">
      <header className="flex items-center justify-between px-5 py-4 border-b shrink-0">
        <div>
          <div className="font-display font-bold text-lg leading-tight">{title}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
        <button onClick={onClose} className="size-9 rounded-lg hover:bg-muted grid place-items-center" aria-label="Fechar">
          <X className="size-5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">{children}</div>
      <footer className="px-5 py-4 border-t shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>
    </div>
  );
}

export function Field({ label, children, hint, error }: { label: string; children: ReactNode; hint?: string; error?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {children}
      {error ? <span className="text-xs text-destructive mt-1 block">{error}</span>
        : hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}
