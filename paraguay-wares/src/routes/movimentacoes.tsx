import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { MovementCard } from "@/components/MovementCard";
import { useMovimentacoes } from "@/lib/queries";
import type { TipoMovimentacao } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const tipoOpts: { v: TipoMovimentacao | "todos"; label: string }[] = [
  { v: "todos", label: "Todos" },
  { v: "entrada", label: "Entrada" },
  { v: "venda", label: "Venda" },
  { v: "perda", label: "Perda" },
  { v: "uso_pessoal", label: "Uso pessoal" },
  { v: "ajuste", label: "Ajuste" },
];

export const Route = createFileRoute("/movimentacoes")({
  head: () => ({ meta: [
    { title: "Movimentações — Controle Paraguay" },
    { name: "description", content: "Histórico completo de entradas e saídas do estoque." },
  ]}),
  component: MovimentacoesPage,
});

function MovimentacoesPage() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState<TipoMovimentacao | "todos">("todos");
  const { data: movimentacoes = [] } = useMovimentacoes({
    tipo: tipo === "todos" ? undefined : tipo,
    limit: 500,
  });

  const filtered = useMemo(() => movimentacoes.filter((m) => {
    if (q && !m.produto_nome.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [movimentacoes, q]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-4xl mx-auto w-full">
      <PageHeader title="Movimentações" subtitle={`${filtered.length} registros`} />

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar produto" className="h-12 pl-9" />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-12 px-4"><Filter className="size-4" /></Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetTitle>Filtrar</SheetTitle>
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Tipo</div>
              <div className="grid grid-cols-2 gap-2">
                {tipoOpts.map((o) => (
                  <button key={o.v} onClick={() => setTipo(o.v)}
                    className={`h-11 rounded-lg border text-sm font-medium ${tipo === o.v ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-2.5">
        {filtered.map((m) => <MovementCard key={m.id} m={m} />)}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Nenhuma movimentação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
