import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { formatBRL } from "@/lib/store";
import { valorTotalEstoque } from "@/lib/types";
import { useProdutos, useAtualizarProduto } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { EntradaForm } from "@/components/forms/EntradaForm";
import { SaidaForm } from "@/components/forms/SaidaForm";

export const Route = createFileRoute("/produtos")({
  head: () => ({ meta: [
    { title: "Produtos — Controle de Estoque Paraguay" },
    { name: "description", content: "Lista de produtos cadastrados com quantidade, custo e valor total em estoque." },
  ]}),
  component: ProdutosPage,
});

function ProdutosPage() {
  const [q, setQ] = useState("");
  const { data: produtos = [], isLoading } = useProdutos({ q: q || undefined });
  const [modal, setModal] = useState<null | { kind: "new" } | { kind: "entrada"; produtoId: string } | { kind: "saida"; produtoId: string } | { kind: "edit"; produtoId: string }>(null);

  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Produtos"
        subtitle={`${produtos.length} cadastrados · ${formatBRL(produtos.reduce((s, p) => s + valorTotalEstoque(p), 0))} em estoque`}
        action={
          <Dialog open={modal?.kind === "new"} onOpenChange={(o) => setModal(o ? { kind: "new" } : null)}>
            <DialogTrigger asChild>
              <Button className="hidden sm:inline-flex h-11"><Plus className="size-4 mr-1" /> Novo Produto</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
              <DialogTitle className="sr-only">Novo Produto</DialogTitle>
              <ProductForm onDone={() => setModal(null)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative mb-4">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, categoria ou SKU"
          className="h-12 pl-9" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {produtos.map((p) => (
          <ProductCard key={p.id} produto={p}
            onEntrada={() => setModal({ kind: "entrada", produtoId: p.id })}
            onSaida={() => setModal({ kind: "saida", produtoId: p.id })}
            onEdit={() => setModal({ kind: "edit", produtoId: p.id })}
          />
        ))}
        {!isLoading && produtos.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Nenhum produto encontrado.
          </div>
        )}
        {isLoading && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-10">Carregando…</div>
        )}
      </div>

      <Dialog open={modal?.kind === "entrada"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Entrada</DialogTitle>
          {modal?.kind === "entrada" && <EntradaForm produtoId={modal.produtoId} onDone={() => setModal(null)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.kind === "saida"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Saída</DialogTitle>
          {modal?.kind === "saida" && <SaidaForm produtoId={modal.produtoId} onDone={() => setModal(null)} />}
        </DialogContent>
      </Dialog>
      <Dialog open={modal?.kind === "edit"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Editar produto</DialogTitle>
          {modal?.kind === "edit" && <EditProduto id={modal.produtoId} onDone={() => setModal(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditProduto({ id, onDone }: { id: string; onDone: () => void }) {
  const { data: produtos = [] } = useProdutos();
  const atualizar = useAtualizarProduto();
  const p = produtos.find((x) => x.id === id);
  const [f, setF] = useState({
    nome: p?.nome ?? "", categoria: p?.categoria ?? "",
    descricao: p?.descricao ?? "", sku: p?.sku ?? "",
    estoque_minimo: String(p?.estoque_minimo ?? 0),
  });
  if (!p) return null;
  return (
    <div className="flex flex-col h-full sm:max-h-[90vh]">
      <header className="px-5 py-4 border-b">
        <div className="font-display font-bold text-lg">Editar produto</div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <label className="block"><span className="text-sm font-medium block mb-1.5">Nome</span>
          <Input className="h-12" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
        <label className="block"><span className="text-sm font-medium block mb-1.5">Categoria</span>
          <Input className="h-12" value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })} /></label>
        <label className="block"><span className="text-sm font-medium block mb-1.5">SKU</span>
          <Input className="h-12" value={f.sku ?? ""} onChange={(e) => setF({ ...f, sku: e.target.value })} /></label>
        <label className="block"><span className="text-sm font-medium block mb-1.5">Estoque mínimo</span>
          <Input className="h-12" inputMode="numeric" value={f.estoque_minimo} onChange={(e) => setF({ ...f, estoque_minimo: e.target.value })} /></label>
      </div>
      <footer className="px-5 py-4 border-t pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
        <Button variant="outline" className="flex-1 h-12" onClick={onDone}>Cancelar</Button>
        <Button className="flex-1 h-12" disabled={atualizar.isPending} onClick={async () => {
          try {
            await atualizar.mutateAsync({
              id, body: {
                nome: f.nome, categoria: f.categoria,
                sku: f.sku || undefined,
                descricao: f.descricao || undefined,
                estoque_minimo: Number(f.estoque_minimo) || 0,
              }
            });
            toast.success("Produto atualizado!");
            onDone();
          } catch (e: any) {
            toast.error(e.message ?? "Erro ao atualizar.");
          }
        }}>Salvar</Button>
      </footer>
    </div>
  );
}
