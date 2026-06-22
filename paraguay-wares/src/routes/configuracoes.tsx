import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Tag } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategorias, useCriarCategoria, useRemoverCategoria } from "@/lib/queries";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [
    { title: "Configurações — Controle Paraguay" },
    { name: "description", content: "Configurações gerais do sistema, como categorias de produtos." },
  ]}),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  return (
    <div className="px-4 lg:px-8 py-5 lg:py-8 max-w-3xl mx-auto w-full">
      <PageHeader title="Configurações" subtitle="Preferências do sistema" />
      <CategoriasSection />
    </div>
  );
}

function CategoriasSection() {
  const { data: categorias = [], isLoading } = useCategorias();
  const criar = useCriarCategoria();
  const remover = useRemoverCategoria();
  const [nome, setNome] = useState("");

  const adicionar = async () => {
    const valor = nome.trim();
    if (!valor) {
      toast.error("Digite o nome da categoria.");
      return;
    }
    try {
      await criar.mutateAsync(valor);
      toast.success("Categoria cadastrada!");
      setNome("");
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao cadastrar categoria.");
    }
  };

  const excluir = async (id: string, nomeCat: string) => {
    try {
      await remover.mutateAsync(id);
      toast.success(`Categoria "${nomeCat}" removida.`);
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao remover categoria.");
    }
  };

  return (
    <section className="mt-2">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="size-4 text-primary" />
        <h2 className="font-display font-bold text-base">Categorias de produtos</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Cadastre as categorias que aparecerão para selecionar ao criar ou editar um produto.
      </p>

      <div className="flex gap-2 mb-4">
        <Input
          className="h-12"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") adicionar(); }}
          placeholder="Ex: Perfumes, Eletrônicos…"
        />
        <Button className="h-12 px-4 shrink-0" disabled={criar.isPending} onClick={adicionar}>
          <Plus className="size-4 sm:mr-1" /> <span className="hidden sm:inline">Adicionar</span>
        </Button>
      </div>

      <div className="rounded-2xl border bg-card divide-y overflow-hidden">
        {isLoading && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">Carregando…</div>
        )}
        {!isLoading && categorias.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhuma categoria cadastrada ainda.
          </div>
        )}
        {categorias.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="font-medium text-sm truncate">{c.nome}</span>
            <button
              onClick={() => excluir(c.id, c.nome)}
              disabled={remover.isPending}
              aria-label={`Remover ${c.nome}`}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:scale-95 transition disabled:opacity-50"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Remover uma categoria não altera os produtos já cadastrados com ela.
      </p>
    </section>
  );
}
