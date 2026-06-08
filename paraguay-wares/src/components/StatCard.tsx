import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label, value, hint, icon: Icon, tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "primary" | "warning" | "destructive";
}) {
  const tones = {
    default: "bg-card border",
    primary: "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground border-transparent",
    warning: "bg-warning/15 border-warning/30",
    destructive: "bg-destructive/10 border-destructive/30",
  };
  const iconBg = {
    default: "bg-primary-soft text-primary",
    primary: "bg-white/20 text-primary-foreground",
    warning: "bg-warning/30 text-warning-foreground",
    destructive: "bg-destructive/20 text-destructive",
  };

  return (
    <div className={cn("rounded-2xl p-4 flex flex-col gap-3", tones[tone])}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn("text-xs font-medium", tone === "primary" ? "text-primary-foreground/80" : "text-muted-foreground")}>
          {label}
        </span>
        <div className={cn("size-9 rounded-xl grid place-items-center shrink-0", iconBg[tone])}>
          <Icon className="size-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-display font-bold leading-none break-words">{value}</div>
        {hint && (
          <div className={cn("text-xs mt-1.5", tone === "primary" ? "text-primary-foreground/75" : "text-muted-foreground")}>
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
