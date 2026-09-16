import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search, Plus, Camera, ImagePlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProductCard } from "@/components/ProductCard";
import { formatBRL } from "@/lib/store";
import { valorTotalEstoque, type Produto } from "@/lib/types";
import { useProdutos, useAtualizarProduto, useRemoverProduto, useUploadFoto } from "@/lib/queries";
import { parseDecimal } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductForm } from "@/components/forms/ProductForm";
import { EntradaForm } from "@/components/forms/EntradaForm";
import { SaidaForm } from "@/components/forms/SaidaForm";
import { CategoriaSelect } from "@/components/forms/CategoriaSelect";

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
  const [modal, setModal] = useState<null | { kind: "new" } | { kind: "entrada"; produtoId: string } | { kind: "saida"; produtoId: string } | { kind: "edit"; produtoId: string } | { kind: "delete"; produtoId: string }>(null);
  const remover = useRemoverProduto();
  const produtoExcluir = modal?.kind === "delete" ? produtos.find((p) => p.id === modal.produtoId) : undefined;

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
            onDelete={() => setModal({ kind: "delete", produtoId: p.id })}
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

      <AlertDialog open={modal?.kind === "delete"} onOpenChange={(o) => !o && setModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <span className="font-medium text-foreground">{produtoExcluir?.nome}</span>?
              Essa ação não pode ser desfeita e o histórico de movimentações do produto também será removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remover.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remover.isPending}
              onClick={async (e) => {
                e.preventDefault();
                if (modal?.kind !== "delete") return;
                try {
                  await remover.mutateAsync(modal.produtoId);
                  toast.success("Produto excluído!");
                  setModal(null);
                } catch (err: any) {
                  toast.error(err.message ?? "Erro ao excluir.");
                }
              }}
            >
              {remover.isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EditProduto({ id, onDone }: { id: string; onDone: () => void }) {
  const { data: produtos = [], isLoading } = useProdutos();
  const p = produtos.find((x) => x.id === id);
  // Só monta o formulário com o produto carregado; senão os campos iniciam vazios
  if (!p) {
    return <div className="p-8 text-center text-sm text-muted-foreground">{isLoading ? "Carregando…" : "Produto não encontrado."}</div>;
  }
  return <EditProdutoForm p={p} onDone={onDone} />;
}

function EditProdutoForm({ p, onDone }: { p: Produto; onDone: () => void }) {
  const id = p.id;
  const atualizar = useAtualizarProduto();
  const upload = useUploadFoto();
  const [f, setF] = useState({
    nome: p?.nome ?? "", categoria: p?.categoria ?? "",
    descricao: p?.descricao ?? "", sku: p?.sku ?? "",
    estoque_minimo: String(p?.estoque_minimo ?? 0),
    preco_venda: p?.preco_venda != null ? p.preco_venda.toFixed(2).replace(".", ",") : "",
    exibir_catalogo: p?.exibir_catalogo ?? true,
  });

  const enviarFoto = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("A foto precisa ter até 5 MB.");
    try {
      await upload.mutateAsync({ id, file });
      toast.success("Foto atualizada!");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao enviar a foto.");
    }
  };

  const salvar = async () => {
    const preco = f.preco_venda.trim() ? parseDecimal(f.preco_venda) : null;
    if (preco !== null && (!Number.isFinite(preco) || preco < 0)) return toast.error("Preço de venda inválido.");
    try {
      await atualizar.mutateAsync({
        id, body: {
          nome: f.nome, categoria: f.categoria,
          sku: f.sku || undefined,
          descricao: f.descricao.trim() || null,
          estoque_minimo: Number(f.estoque_minimo) || 0,
          preco_venda: preco,
          exibir_catalogo: f.exibir_catalogo,
        }
      });
      toast.success("Produto atualizado!");
      onDone();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao atualizar.");
    }
  };

  return (
    <div className="flex flex-col h-full sm:max-h-[90vh]">
      <header className="px-5 py-4 border-b">
        <div className="font-display font-bold text-lg">Editar produto</div>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        <div>
          <span className="text-sm font-medium block mb-1.5">Foto</span>
          <div className="flex items-center gap-3">
            <div className="size-20 shrink-0 rounded-xl border bg-muted overflow-hidden grid place-items-center">
              {p.foto_url
                ? <img src={p.foto_url} alt={p.nome} className="size-full object-cover" />
                : <ImagePlus className="size-6 text-muted-foreground" />}
            </div>
            <label className="flex-1">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                disabled={upload.isPending}
                onChange={(e) => { enviarFoto(e.target.files?.[0]); e.target.value = ""; }} />
              <span className="h-11 w-full inline-flex items-center justify-center gap-2 rounded-md border text-sm font-medium cursor-pointer hover:bg-muted">
                <Camera className="size-4" />
                {upload.isPending ? "Enviando…" : p.foto_url ? "Trocar foto" : "Adicionar foto"}
              </span>
              <span className="text-xs text-muted-foreground mt-1 block">JPG, PNG ou WEBP até 5 MB. Aparece no catálogo.</span>
            </label>
          </div>
        </div>
        <label className="block"><span className="text-sm font-medium block mb-1.5">Nome</span>
          <Input className="h-12" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} /></label>
        <CategoriaSelect value={f.categoria} onChange={(v) => setF({ ...f, categoria: v })} />
        <label className="block"><span className="text-sm font-medium block mb-1.5">Preço de venda (R$)</span>
          <Input className="h-12" inputMode="decimal" placeholder="Ex: 189,90" value={f.preco_venda} onChange={(e) => setF({ ...f, preco_venda: e.target.value })} />
          <span className="text-xs text-muted-foreground mt-1 block">Preço mostrado no catálogo. Em branco aparece "Consulte o valor". Custo pago: {formatBRL(p.custo_medio)}.</span></label>
        <label className="block"><span className="text-sm font-medium block mb-1.5">Descrição</span>
          <Textarea value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} placeholder="Notas olfativas, tamanho, cor… (aparece no catálogo)" /></label>
        <div className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
          <div>
            <div className="text-sm font-medium">Mostrar no catálogo</div>
            <div className="text-xs text-muted-foreground">Desligue para esconder este produto dos clientes.</div>
          </div>
          <Switch checked={f.exibir_catalogo} onCheckedChange={(v) => setF({ ...f, exibir_catalogo: v })} />
        </div>
        <label className="block"><span className="text-sm font-medium block mb-1.5">SKU</span>
          <Input className="h-12" value={f.sku ?? ""} onChange={(e) => setF({ ...f, sku: e.target.value })} /></label>
        <label className="block"><span className="text-sm font-medium block mb-1.5">Estoque mínimo</span>
          <Input className="h-12" inputMode="numeric" value={f.estoque_minimo} onChange={(e) => setF({ ...f, estoque_minimo: e.target.value })} /></label>
      </div>
      <footer className="px-5 py-4 border-t pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
        <Button variant="outline" className="flex-1 h-12" onClick={onDone}>Cancelar</Button>
        <Button className="flex-1 h-12" disabled={atualizar.isPending} onClick={salvar}>Salvar</Button>
      </footer>
    </div>
  );
}
