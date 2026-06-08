import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import type { Movimentacao } from "@/lib/types";
import { formatBRL, formatDate } from "@/lib/store";
import { cn } from "@/lib/utils";

const labels: Record<Movimentacao["tipo"], string> = {
  entrada: "Entrada",
  venda: "Venda",
  perda: "Perda",
  uso_pessoal: "Uso pessoal",
  ajuste: "Ajuste",
};

export function MovementCard({ m }: { m: Movimentacao }) {
  const isIn = m.tipo === "entrada";
  return (
    <div className="rounded-xl border bg-card p-3.5 flex items-start gap-3">
      <div className={cn("size-10 rounded-xl grid place-items-center shrink-0",
        isIn ? "bg-primary-soft text-primary" : "bg-warning/20 text-warning-foreground")}>
        {isIn ? <ArrowDownToLine className="size-5" /> : <ArrowUpFromLine className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm leading-tight truncate">{m.produto_nome}</div>
          <div className={cn("text-sm font-bold whitespace-nowrap", isIn ? "text-primary" : "text-foreground")}>
            {isIn ? "+" : "−"}{m.quantidade}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-between gap-2">
          <span>{labels[m.tipo]} · {formatDate(m.data_movimentacao)}</span>
          <span className="font-medium text-foreground/80">{formatBRL(m.valor_total)}</span>
        </div>
        {m.observacoes && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.observacoes}</div>}
      </div>
    </div>
  );
}
