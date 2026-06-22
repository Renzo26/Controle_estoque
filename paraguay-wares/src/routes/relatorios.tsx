import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet, Package, Boxes, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { formatBRL } from "@/lib/store";
import { valorTotalEstoque } from "@/lib/types";
import { useDashboard, useEstoqueBaixo, useProdutos, useVendasPeriodo, useLucroPeriodo } from "@/lib/queries";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

      <LucroSection />

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

const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

function monthRange(inicio: string, fim: string) {
  const de = `${inicio}-01T00:00:00`;
  const [fy, fm] = fim.split("-").map(Number);
  const lastDay = new Date(fy, fm, 0).getDate();
  const ate = `${fim}-${String(lastDay).padStart(2, "0")}T23:59:59`;
  return { de, ate };
}

// "2026-06-01T00:00:00+00:00" -> "06/2026" (lê direto da string, sem conversão de fuso)
function formatMes(iso: string) {
  const [ano, mes] = iso.slice(0, 7).split("-");
  return `${mes}/${ano}`;
}

function LucroSection() {
  const { data: produtos = [] } = useProdutos();
  const now = new Date();
  const [inicio, setInicio] = useState(ym(new Date(now.getFullYear(), now.getMonth() - 5, 1)));
  const [fim, setFim] = useState(ym(now));
  const [produtoId, setProdutoId] = useState<string | undefined>(undefined);

  const valido = inicio <= fim;
  const { de, ate } = monthRange(inicio, fim);
  const { data, isLoading } = useLucroPeriodo(valido ? { de, ate, produto_id: produtoId } : undefined);

  const lucroTotal = data?.lucro_total ?? 0;

  return (
    <section className="mt-6">
      <h2 className="font-display font-bold text-base mb-1">Investido × Vendas × Lucro</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Lucro = Vendas − Investido (compras/entradas) no período selecionado.
      </p>

      <div className="grid sm:grid-cols-3 gap-2 mb-3">
        <label className="block">
          <span className="text-xs text-muted-foreground block mb-1">Produto</span>
          <Select value={produtoId ?? "all"} onValueChange={(v) => setProdutoId(v === "all" ? undefined : v)}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os produtos</SelectItem>
              {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground block mb-1">De (mês)</span>
          <input type="month" value={inicio} max={fim} onChange={(e) => setInicio(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted-foreground block mb-1">Até (mês)</span>
          <input type="month" value={fim} min={inicio} onChange={(e) => setFim(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <TotalCard label="Investido" value={formatBRL(data?.investido_total ?? 0)} />
        <TotalCard label="Vendas" value={formatBRL(data?.vendas_total ?? 0)} />
        <TotalCard
          label="Lucro"
          value={formatBRL(lucroTotal)}
          tone={lucroTotal > 0 ? "positive" : lucroTotal < 0 ? "negative" : "default"}
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-4 py-2.5 bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
          <span>Mês</span>
          <span className="text-right">Investido</span>
          <span className="text-right">Vendas</span>
          <span className="text-right">Lucro</span>
        </div>
        <div className="divide-y">
          {!valido && (
            <div className="px-4 py-6 text-center text-sm text-destructive">O mês inicial não pode ser depois do final.</div>
          )}
          {valido && isLoading && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando…</div>
          )}
          {valido && !isLoading && (data?.itens.length ?? 0) === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">Sem movimentações no período.</div>
          )}
          {valido && data?.itens.map((it) => (
            <div key={it.mes} className="grid grid-cols-4 gap-2 px-4 py-3 text-sm">
              <span className="font-medium">{formatMes(it.mes)}</span>
              <span className="text-right text-muted-foreground">{formatBRL(it.investido)}</span>
              <span className="text-right text-muted-foreground">{formatBRL(it.vendas)}</span>
              <span className={cn("text-right font-semibold",
                it.lucro > 0 ? "text-primary" : it.lucro < 0 ? "text-destructive" : "text-foreground")}>
                {formatBRL(it.lucro)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TotalCard({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "positive" | "negative" }) {
  return (
    <div className={cn("rounded-xl border p-3",
      tone === "positive" ? "bg-primary-soft border-transparent" : tone === "negative" ? "bg-destructive/10 border-transparent" : "bg-card")}>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
        {tone === "positive" && <TrendingUp className="size-3 text-primary" />}
        {tone === "negative" && <TrendingDown className="size-3 text-destructive" />}
        {label}
      </div>
      <div className={cn("font-bold mt-1 text-sm sm:text-base",
        tone === "positive" ? "text-primary" : tone === "negative" ? "text-destructive" : "text-foreground")}>
        {value}
      </div>
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
