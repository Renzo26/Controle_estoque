import { ArrowDownToLine, ArrowUpFromLine, Pencil } from "lucide-react";
import type { Produto } from "@/lib/types";
import { estoqueBaixo, valorTotalEstoque } from "@/lib/types";
import { formatBRL } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function ProductCard({
  produto, onEntrada, onSaida, onEdit,
}: {
  produto: Produto;
  onEntrada: () => void;
  onSaida: () => void;
  onEdit: () => void;
}) {
  const low = estoqueBaixo(produto);
  return (
    <div className="rounded-2xl border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display font-semibold text-base leading-tight truncate">{produto.nome}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{produto.categoria}{produto.sku ? ` · ${produto.sku}` : ""}</div>
        </div>
        <Badge variant={low ? "destructive" : "secondary"} className={cn(low ? "" : "bg-primary-soft text-primary border-transparent")}>
          {low ? "Estoque baixo" : "Normal"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Field label="Quantidade" value={String(produto.quantidade_atual)} accent />
        <Field label="Valor total" value={formatBRL(valorTotalEstoque(produto))} accent />
        <Field label="Último pago" value={formatBRL(produto.ultimo_valor_pago)} />
        <Field label="Custo médio" value={formatBRL(produto.custo_medio)} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <button onClick={onEntrada} className="h-10 rounded-lg bg-primary-soft text-primary font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-primary/15 active:scale-95 transition">
          <ArrowDownToLine className="size-3.5" /> Entrada
        </button>
        <button onClick={onSaida} className="h-10 rounded-lg bg-secondary text-secondary-foreground font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-muted active:scale-95 transition">
          <ArrowUpFromLine className="size-3.5" /> Saída
        </button>
        <button onClick={onEdit} className="h-10 rounded-lg border font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-muted active:scale-95 transition">
          <Pencil className="size-3.5" /> Editar
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg px-2.5 py-2", accent ? "bg-muted" : "")}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("font-semibold mt-0.5", accent ? "text-foreground" : "text-foreground/80")}>{value}</div>
    </div>
  );
}
