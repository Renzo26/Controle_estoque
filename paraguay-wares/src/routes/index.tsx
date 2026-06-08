import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Package, Boxes, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from "recharts";
import { StatCard } from "@/components/StatCard";
import { MovementCard } from "@/components/MovementCard";
import { PageHeader } from "@/components/PageHeader";
import { formatBRL } from "@/lib/store";
import { useDashboard, useEstoqueBaixo, useMovimentacoes } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Início — Controle de Estoque Paraguay" },
    { name: "description", content: "Visão geral do estoque com valor total, movimentos recentes e alertas." },
  ]}),
  component: Dashboard,
});

function Dashboard() {
  const { data: dashboard } = useDashboard();
  const { data: baixos = [] } = useEstoqueBaixo();
  const { data: movimentacoes = [] } = useMovimentacoes({ limit: 50 });

  const chartData = useMemo(() => {
    const dias = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return { dia: d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3), key: k, entradas: 0, saidas: 0 };
    });
    movimentacoes.forEach((m) => {
      const k = m.data_movimentacao.slice(0, 10);
      const slot = dias.find((d) => d.key === k);
      if (!slot) return;
      if (m.tipo === "entrada") slot.entradas += m.quantidade;
      else slot.saidas += m.quantidade;
    });
    return dias;
  }, [movimentacoes]);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-7xl mx-auto w-full">
      <PageHeader title="Olá 👋" subtitle="Veja o estado do seu estoque hoje." />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="col-span-2 lg:col-span-3">
          <StatCard label="Valor total do estoque" value={formatBRL(dashboard?.valor_total_estoque ?? 0)} icon={Wallet} tone="primary" hint="Calculado pelo custo médio dos produtos" />
        </div>
        <StatCard label="Produtos cadastrados" value={dashboard?.total_produtos ?? 0} icon={Package} />
        <StatCard label="Itens em estoque" value={dashboard?.total_unidades_estoque ?? 0} icon={Boxes} />
        <StatCard label="Vendas (mês)" value={formatBRL(dashboard?.vendas_mes_valor ?? 0)} icon={ArrowUpFromLine} />
        <StatCard label="Vendas (qtd mês)" value={`${dashboard?.vendas_mes_quantidade ?? 0} un.`} icon={ArrowDownToLine} />
        <StatCard label="Estoque baixo" value={dashboard?.produtos_estoque_baixo ?? 0} icon={AlertTriangle} tone={(dashboard?.produtos_estoque_baixo ?? 0) > 0 ? "warning" : "default"} />
      </div>

      <section className="mt-6 rounded-2xl border bg-card p-4 lg:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base">Entradas e saídas (7 dias)</h2>
        </div>
        <div className="h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="entradas" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="saidas" fill="var(--color-warning)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {baixos.length > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base">Produtos com estoque baixo</h2>
            <Link to="/produtos" className="text-xs font-medium text-primary">Ver todos</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {baixos.map((p) => (
              <div key={p.id} className="rounded-2xl border bg-card p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{p.nome}</div>
                  <div className="text-xs text-muted-foreground">{p.categoria}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-destructive">{p.quantidade_atual}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">min {p.estoque_minimo}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-base">Últimas movimentações</h2>
          <Link to="/movimentacoes" className="text-xs font-medium text-primary">Histórico</Link>
        </div>
        <div className="space-y-2.5">
          {movimentacoes.slice(0, 6).map((m) => <MovementCard key={m.id} m={m} />)}
          {movimentacoes.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Sem movimentações ainda.</div>
          )}
        </div>
      </section>
    </div>
  );
}
