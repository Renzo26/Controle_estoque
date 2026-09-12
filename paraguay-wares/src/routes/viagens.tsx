import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Fuel, BedDouble, UtensilsCrossed, Milestone, Trash2, Plane } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Field } from "@/components/forms/FormShell";
import { useCustosViagem, useCriarCustoViagem, useRemoverCustoViagem } from "@/lib/queries";
import { formatBRL } from "@/lib/store";
import type { CustoViagem } from "@/lib/types";
import { parseDecimal } from "@/lib/utils";

export const Route = createFileRoute("/viagens")({
  head: () => ({ meta: [
    { title: "Custos de Viagem — Controle Paraguay" },
    { name: "description", content: "Cadastro dos custos da viagem de compras: combustível, passagem, hospedagem, alimentação e pedágio." },
  ]}),
  component: ViagensPage,
});

const campos = [
  { key: "combustivel_passagem", label: "Combustível / Passagem", icon: Fuel },
  { key: "hospedagem", label: "Hospedagem", icon: BedDouble },
  { key: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { key: "pedagio", label: "Pedágio", icon: Milestone },
] as const;

type CampoKey = (typeof campos)[number]["key"];

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// "2026-09-10" -> "10/09/2026" (sem conversão de fuso)
const formatData = (iso: string) => iso.split("-").reverse().join("/");

const valor = (v: string) => {
  const n = parseDecimal(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

function ViagensPage() {
  const { data: custos = [], isLoading } = useCustosViagem();
  const totalGeral = custos.reduce((s, c) => s + c.total, 0);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-3xl mx-auto w-full">
      <PageHeader
        title="Custos de Viagem"
        subtitle={`${custos.length} ${custos.length === 1 ? "viagem" : "viagens"} · ${formatBRL(totalGeral)} no total`}
      />
      <NovoCustoForm />

      <h2 className="font-display font-bold text-base mt-8 mb-3">Viagens registradas</h2>
      <div className="rounded-2xl border bg-card divide-y overflow-hidden">
        {isLoading && <div className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando…</div>}
        {!isLoading && custos.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhum custo de viagem registrado ainda.</div>
        )}
        {custos.map((c) => <CustoRow key={c.id} custo={c} />)}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Os custos aparecem no card "Custos de viagem" da aba Relatórios, pelo mês da viagem.
      </p>
    </div>
  );
}

function NovoCustoForm() {
  const criar = useCriarCustoViagem();
  const vazio = { data: hoje(), descricao: "", combustivel_passagem: "", hospedagem: "", alimentacao: "", pedagio: "" };
  const [f, setF] = useState(vazio);

  const total = campos.reduce((s, c) => s + valor(f[c.key]), 0);

  const salvar = async () => {
    const invalido = campos.find((c) => f[c.key].trim() && !Number.isFinite(parseDecimal(f[c.key])));
    if (invalido) return toast.error(`Valor inválido em ${invalido.label}.`);
    if (total <= 0) return toast.error("Informe ao menos um valor.");
    try {
      await criar.mutateAsync({
        data: f.data || hoje(),
        descricao: f.descricao.trim() || undefined,
        combustivel_passagem: valor(f.combustivel_passagem),
        hospedagem: valor(f.hospedagem),
        alimentacao: valor(f.alimentacao),
        pedagio: valor(f.pedagio),
      });
      toast.success("Custos da viagem registrados!");
      setF({ ...vazio, data: f.data });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar custos.");
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Plane className="size-4 text-primary" />
        <h2 className="font-display font-bold text-base">Nova viagem</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Data da viagem">
          <Input className="h-12" type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
        </Field>
        <Field label="Descrição" hint="Opcional">
          <Input className="h-12" value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Ex: Viagem CDE setembro" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3 items-end">
        {campos.map((c) => (
          <Field key={c.key} label={`${c.label} (R$)`}>
            <Input
              className="h-12"
              inputMode="decimal"
              placeholder="0,00"
              value={f[c.key]}
              onChange={(e) => setF({ ...f, [c.key as CampoKey]: e.target.value })}
            />
          </Field>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-primary-soft px-4 py-3">
        <span className="text-sm font-medium text-primary">Total da viagem</span>
        <span className="font-display font-bold text-lg text-primary">{formatBRL(total)}</span>
      </div>

      <Button className="w-full h-12 text-base" disabled={criar.isPending} onClick={salvar}>
        {criar.isPending ? "Salvando…" : "Salvar custos"}
      </Button>
    </section>
  );
}

function CustoRow({ custo }: { custo: CustoViagem }) {
  const remover = useRemoverCustoViagem();
  const [confirmar, setConfirmar] = useState(false);

  const excluir = async () => {
    try {
      await remover.mutateAsync(custo.id);
      toast.success("Custo de viagem removido.");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover.");
    }
  };

  const partes = campos.filter((c) => custo[c.key] > 0);

  return (
    <div className="px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{custo.descricao || "Viagem"}</div>
          <div className="text-xs text-muted-foreground">{formatData(custo.data)}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold">{formatBRL(custo.total)}</span>
          <button
            onClick={() => setConfirmar(true)}
            disabled={remover.isPending}
            aria-label="Remover custo de viagem"
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition disabled:opacity-50"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {partes.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            <c.icon className="size-3" /> {c.label}: <strong className="text-foreground font-medium">{formatBRL(custo[c.key])}</strong>
          </span>
        ))}
      </div>

      <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover custo de viagem?</AlertDialogTitle>
            <AlertDialogDescription>
              {custo.descricao || "Viagem"} de {formatData(custo.data)} ({formatBRL(custo.total)}) será removida e deixa de contar nos relatórios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluir} className="bg-destructive text-white hover:bg-destructive/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
