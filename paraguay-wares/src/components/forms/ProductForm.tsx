import { useState } from "react";
import { toast } from "sonner";
import { useCriarProduto } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, Field } from "./FormShell";
import { CategoriaSelect } from "./CategoriaSelect";

export function ProductForm({ onDone }: { onDone: () => void }) {
  const criar = useCriarProduto();
  const [f, setF] = useState({
    nome: "", categoria: "", descricao: "", sku: "",
    quantidade_inicial: "0", valor_unitario: "0", cotacao_dolar: "",
    estoque_minimo: "1", fornecedor: "",
  });
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async () => {
    if (!f.nome.trim() || !f.categoria.trim()) {
      toast.error("Preencha nome e categoria.");
      return;
    }
    try {
      await criar.mutateAsync({
        nome: f.nome.trim(),
        categoria: f.categoria.trim(),
        descricao: f.descricao || undefined,
        sku: f.sku || undefined,
        estoque_minimo: Number(f.estoque_minimo) || 0,
        quantidade_inicial: Number(f.quantidade_inicial) || 0,
        valor_unitario_inicial: Number(f.valor_unitario) || 0,
        cotacao_dolar_inicial: f.cotacao_dolar ? Number(f.cotacao_dolar) : undefined,
        fornecedor_inicial: f.fornecedor || undefined,
      });
      toast.success("Produto cadastrado com sucesso!");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao cadastrar produto.");
    }
  };

  return (
    <FormShell
      title="Novo Produto"
      subtitle="Cadastre um novo item no estoque"
      onClose={onDone}
      footer={<Button className="w-full h-12 text-base" disabled={criar.isPending} onClick={submit}>{criar.isPending ? "Salvando…" : "Salvar Produto"}</Button>}
    >
      <Field label="Nome do produto">
        <Input className="h-12" value={f.nome} onChange={upd("nome")} placeholder="Ex: Perfume Importado" />
      </Field>
      <CategoriaSelect value={f.categoria} onChange={(v) => setF({ ...f, categoria: v })} />
      <Field label="Descrição" hint="Opcional">
        <Textarea value={f.descricao} onChange={upd("descricao")} placeholder="Detalhes do produto" />
      </Field>
      <Field label="Código / SKU" hint="Opcional">
        <Input className="h-12" value={f.sku} onChange={upd("sku")} placeholder="Ex: PRF-001" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantidade inicial">
          <Input className="h-12" inputMode="numeric" value={f.quantidade_inicial} onChange={upd("quantidade_inicial")} />
        </Field>
        <Field label="Estoque mínimo">
          <Input className="h-12" inputMode="numeric" value={f.estoque_minimo} onChange={upd("estoque_minimo")} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor pago unitário (R$)">
          <Input className="h-12" inputMode="decimal" value={f.valor_unitario} onChange={upd("valor_unitario")} />
        </Field>
        <Field label="Cotação do dólar" hint="Opcional">
          <Input className="h-12" inputMode="decimal" value={f.cotacao_dolar} onChange={upd("cotacao_dolar")} placeholder="Ex: 5.20" />
        </Field>
      </div>
      <Field label="Fornecedor" hint="Opcional">
        <Input className="h-12" value={f.fornecedor} onChange={upd("fornecedor")} placeholder="Ex: CDE - Paraguay" />
      </Field>
    </FormShell>
  );
}
