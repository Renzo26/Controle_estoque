import { useState } from "react";
import { toast } from "sonner";
import { useProdutos, useRegistrarMovimentacao } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, Field } from "./FormShell";
import { ProdutoSelect } from "./ProdutoSelect";
import { parseDecimal } from "@/lib/utils";

export function EntradaForm({ onDone, produtoId }: { onDone: () => void; produtoId?: string }) {
  const { data: produtos = [] } = useProdutos();
  const registrar = useRegistrarMovimentacao();
  const [f, setF] = useState({
    produto_id: produtoId ?? "",
    quantidade: "1",
    valor_unitario: "",
    cotacao_dolar: "",
    data: new Date().toISOString().slice(0, 10),
    fornecedor: "",
    observacoes: "",
  });
  const submit = async () => {
    if (!f.produto_id) return toast.error("Selecione um produto.");
    const q = Number(f.quantidade);
    const v = parseDecimal(f.valor_unitario);
    if (!q || q <= 0) return toast.error("Quantidade inválida.");
    if (!v || v <= 0) return toast.error("Informe o valor pago.");
    try {
      await registrar.mutateAsync({
        produto_id: f.produto_id,
        tipo: "entrada",
        quantidade: q,
        valor_unitario: v,
        cotacao_dolar: parseDecimal(f.cotacao_dolar) || undefined,
        data_movimentacao: new Date(f.data).toISOString(),
        fornecedor: f.fornecedor || undefined,
        observacoes: f.observacoes || undefined,
      });
      toast.success("Entrada registrada!");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao registrar entrada.");
    }
  };

  return (
    <FormShell
      title="Registrar Entrada"
      subtitle="Adicione produtos ao estoque"
      onClose={onDone}
      footer={<Button className="w-full h-12 text-base" disabled={registrar.isPending} onClick={submit}>{registrar.isPending ? "Salvando…" : "Salvar Entrada"}</Button>}
    >
      <div>
        <span className="text-sm font-medium block mb-1.5">Produto</span>
        <ProdutoSelect produtos={produtos} value={f.produto_id} onChange={(v) => setF({ ...f, produto_id: v })} />
      </div>
      <Field label="Quantidade adicionada">
        <Input className="h-12" inputMode="numeric" value={f.quantidade} onChange={(e) => setF({ ...f, quantidade: e.target.value })} />
      </Field>
      <Field label="Valor pago unitário (R$)">
        <Input className="h-12" inputMode="decimal" value={f.valor_unitario} onChange={(e) => setF({ ...f, valor_unitario: e.target.value })} placeholder="0,00" />
      </Field>
      <Field label="Cotação do dólar" hint="Opcional">
        <Input className="h-12" inputMode="decimal" value={f.cotacao_dolar} onChange={(e) => setF({ ...f, cotacao_dolar: e.target.value })} />
      </Field>
      <Field label="Data da entrada">
        <Input className="h-12" type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} />
      </Field>
      <Field label="Fornecedor / local de compra" hint="Opcional">
        <Input className="h-12" value={f.fornecedor} onChange={(e) => setF({ ...f, fornecedor: e.target.value })} placeholder="Ex: CDE - Paraguay" />
      </Field>
      <Field label="Observações" hint="Opcional">
        <Textarea value={f.observacoes} onChange={(e) => setF({ ...f, observacoes: e.target.value })} />
      </Field>
    </FormShell>
  );
}
