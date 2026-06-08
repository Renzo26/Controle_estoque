import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Package, Boxes, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatBRL } from "@/lib/store";
import { valorTotalEstoque } from "@/lib/types";
import { useDashboard, useEstoqueBaixo, useProdutos, useVendasPeriodo } from "@/lib/queries";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios — Controle Paraguay" },
    { name: "description", content: "Relatórios de valor do estoque, produtos mais valiosos e alertas." },
  ]}),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const { data: dashboard } = useDashboard();
  const { data: produtos = [] } = useProdutos();
  const { data: baixos = [] } = useEstoqueBaixo();
  const { data: vendas } = useVendasPeriodo();

  const maisValiosos = [...produtos].sort((a, b) => valorTotalEstoque(b) - valorTotalEstoque(a)).slice(0, 5);
  const maiorQtd = [...produtos].sort((a, b) => b.quantidade_atual - a.quantidade_atual).slice(0, 5);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-5xl mx-auto w-full">
      <PageHeader title="Relatórios" subtitle="Visão financeira do estoque" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="col-span-2 lg:col-span-2">
          <StatCard label="Valor total do estoque" value={formatBRL(dashboard?.valor_total_estoque ?? 0)} icon={Wallet} tone="primary" />
        </div>
        <StatCard label="Total de produtos" value={dashboard?.total_produtos ?? 0} icon={Package} />
        <StatCard label="Itens em estoque" value={dashboard?.total_unidades_estoque ?? 0} icon={Boxes} />
        <StatCard label="Vendas (mês)" value={formatBRL(dashboard?.vendas_mes_valor ?? 0)} icon={Wallet} />
        <StatCard label="Vendas (30 dias)" value={formatBRL(vendas?.valor_total ?? 0)} icon={Wallet} hint={`${vendas?.quantidade_total ?? 0} un.`} />
        <div className="col-span-2 lg:col-span-2">
          <StatCard label="Estoque baixo" value={baixos.length} icon={AlertTriangle} tone={baixos.length ? "warning" : "default"} hint="Produtos abaixo do mínimo" />
        </div>
      </div>

      <Section title="Produtos mais valiosos">
        {maisValiosos.length === 0 && <EmptyRow />}
        {maisValiosos.map((p) => (
          <Row key={p.id} primary={p.nome} secondary={p.categoria} valueLabel={formatBRL(valorTotalEstoque(p))} valueHint={`${p.quantidade_atual} un.`} />
        ))}
      </Section>

      <Section title="Produtos com maior quantidade">
        {maiorQtd.length === 0 && <EmptyRow />}
        {maiorQtd.map((p) => (
          <Row key={p.id} primary={p.nome} secondary={p.categoria} valueLabel={`${p.quantidade_atual} un.`} valueHint={formatBRL(valorTotalEstoque(p))} />
        ))}
      </Section>

      {baixos.length > 0 && (
        <Section title="Estoque baixo">
          {baixos.map((p) => (
            <Row key={p.id} primary={p.nome} secondary={p.categoria} valueLabel={`${p.quantidade_atual}`} valueHint={`min ${p.estoque_minimo}`} accent="destructive" />
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="font-display font-bold text-base mb-3">{title}</h2>
      <div className="rounded-2xl border bg-card divide-y overflow-hidden">{children}</div>
    </section>
  );
}

function EmptyRow() {
  return <div className="px-4 py-6 text-center text-sm text-muted-foreground">Sem dados ainda.</div>;
}

function Row({ primary, secondary, valueLabel, valueHint, accent }: { primary: string; secondary: string; valueLabel: string; valueHint: string; accent?: "destructive" }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="font-semibold text-sm truncate">{primary}</div>
        <div className="text-xs text-muted-foreground">{secondary}</div>
      </div>
      <div className="text-right shrink-0">
        <div className={`font-bold ${accent === "destructive" ? "text-destructive" : "text-foreground"}`}>{valueLabel}</div>
        <div className="text-[10px] text-muted-foreground uppercase">{valueHint}</div>
      </div>
    </div>
  );
}
