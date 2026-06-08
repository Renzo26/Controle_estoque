import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useProdutos, useRegistrarMovimentacao } from "@/lib/queries";
import type { TipoMovimentacao } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormShell, Field } from "./FormShell";

const tipos: { value: TipoMovimentacao; label: string }[] = [
  { value: "venda", label: "Venda" },
  { value: "perda", label: "Perda" },
  { value: "uso_pessoal", label: "Uso pessoal" },
  { value: "ajuste", label: "Ajuste manual" },
];

export function SaidaForm({ onDone, produtoId }: { onDone: () => void; produtoId?: string }) {
  const { data: produtos = [] } = useProdutos();
  const registrar = useRegistrarMovimentacao();
  const [f, setF] = useState({
    produto_id: produtoId ?? "",
    quantidade: "1",
    tipo: "venda" as TipoMovimentacao,
    valor_unitario: "",
    data: new Date().toISOString().slice(0, 10),
    observacoes: "",
  });

  const prod = produtos.find((p) => p.id === f.produto_id);
  const qtd = Number(f.quantidade) || 0;
  const excede = prod && f.tipo !== "ajuste" && qtd > prod.quantidade_atual;

  const submit = async () => {
    if (!f.produto_id) return toast.error("Selecione um produto.");
    if (qtd <= 0) return toast.error("Quantidade inválida.");
    try {
      await registrar.mutateAsync({
        produto_id: f.produto_id,
        tipo: f.tipo,
        quantidade: qtd,
        valor_unitario: f.valor_unitario ? Number(f.valor_unitario) : undefined,
        data_movimentacao: new Date(f.data).toISOString(),
        observacoes: f.observacoes || undefined,
      });
      toast.success("Saída registrada!");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar saída.");
    }
  };

  return (
    <FormShell
      title="Registrar Saída"
      subtitle="Venda, perda ou ajuste de estoque"
      onClose={onDone}
      footer={<Button className="w-full h-12 text-base" disabled={!!excede || registrar.isPending} onClick={submit}>{registrar.isPending ? "Salvando…" : "Salvar Saída"}</Button>}
    >
      <Field label="Produto">
        <Select value={f.produto_id} onValueChange={(v) => setF({ ...f, produto_id: v })}>
          <SelectTrigger className="h-12 w-full"><SelectValue placeholder="Escolha um produto" /></SelectTrigger>
          <SelectContent>
            {produtos.map((p) => <SelectItem key={p.id} value={p.id}>{p.nome} ({p.quantidade_atual} em estoque)</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      {prod && (
        <div className="rounded-xl bg-primary-soft text-primary px-4 py-3 text-sm font-medium">
          Disponível em estoque: <strong>{prod.quantidade_atual}</strong> un.
        </div>
      )}

      <Field label="Tipo de saída">
        <Select value={f.tipo} onValueChange={(v: TipoMovimentacao) => setF({ ...f, tipo: v })}>
          <SelectTrigger className="h-12 w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            {tipos.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>

      <Field label={f.tipo === "ajuste" ? "Nova quantidade total" : "Quantidade"}>
        <Input className="h-12" inputMode="numeric" value={f.quantidade} onChange={(e) => setF({ ...f, quantidade: e.target.value })} />
      </Field>

      {excede && (
        <div className="rounded-xl bg-destructive/10 text-destructive px-4 py-3 text-sm flex items-start gap-2">
          <AlertTriangle className="size-4 mt-0.5 shrink-0" />
          <span>A quantidade da saída é maior que o estoque disponível.</span>
        </div>
      )}

      <Field label="Valor de venda unitário (R$)" hint="Opcional">
        <Input className="h-12" inputMode="decimal" value={f.valor_unitario} onChange={(e) => setF({ ...f, valor_unitario: e.target.value })} placeholder="0,00" />
      </Field>

      <Field label="Data da saída">
        <Input className="h-12" type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
      </Field>

      <Field label="Observações" hint="Opcional">
        <Textarea value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} />
      </Field>
    </FormShell>
  );
}
