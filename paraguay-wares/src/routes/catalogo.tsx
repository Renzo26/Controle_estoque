import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SprayCan, Sparkles, BedDouble, ShoppingBag, X, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCatalogo } from "@/lib/queries";
import { formatBRL } from "@/lib/store";
import type { CatalogoItem } from "@/lib/types";
import { catalogoConfig, linkWhatsApp } from "@/lib/catalogo-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [
    { title: `Catálogo — ${catalogoConfig.nome}` },
    { name: "description", content: catalogoConfig.slogan },
  ]}),
  component: CatalogoPage,
});

// Visual do espaço da foto enquanto o produto não tem imagem
const estilosCategoria: Record<string, { icon: LucideIcon; fundo: string; tinta: string }> = {
  perfumes: { icon: SprayCan, fundo: "linear-gradient(145deg, #f1e6d6, #e2cdb2)", tinta: "#8a5a2b" },
  cosmeticos: { icon: Sparkles, fundo: "linear-gradient(145deg, #f5e7e5, #e8cdc9)", tinta: "#9c4f4a" },
  "roupas de cama": { icon: BedDouble, fundo: "linear-gradient(145deg, #e8ede5, #d2dccd)", tinta: "#4f6b4a" },
};
const estiloPadrao = { icon: ShoppingBag, fundo: "linear-gradient(145deg, #ece8f1, #d9d2e4)", tinta: "#5d4f7a" };

const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const estiloDe = (categoria: string) => estilosCategoria[normalizar(categoria)] ?? estiloPadrao;

// "Perfume Yara Rose - 100ml" -> { titulo: "Perfume Yara Rose", medida: "100ml" }
function separarMedida(nome: string) {
  const m = nome.match(/^(.*?)[\s-]*(\d+(?:[.,]\d+)?\s?(?:ml|g|kg|l))$/i);
  if (!m || !m[1].trim()) return { titulo: nome, medida: null };
  return { titulo: m[1].trim(), medida: m[2].replace(/\s/g, "") };
}

function mensagemPedido(p: CatalogoItem) {
  const preco = p.preco_venda != null ? ` (${formatBRL(p.preco_venda)})` : "";
  return `Olá! Vi no catálogo e tenho interesse em: ${p.nome}${preco}. Ainda tem disponível?`;
}

function CatalogoPage() {
  const { data: itens = [], isLoading, isError } = useCatalogo();
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [aberto, setAberto] = useState<CatalogoItem | null>(null);

  const categorias = useMemo(() => {
    const cont = new Map<string, number>();
    for (const p of itens) cont.set(p.categoria, (cont.get(p.categoria) ?? 0) + 1);
    return [...cont.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [itens]);

  const termo = normalizar(busca.trim());
  const filtrados = itens.filter((p) =>
    (!categoria || p.categoria === categoria) &&
    (!termo || normalizar(`${p.nome} ${p.categoria} ${p.descricao ?? ""}`).includes(termo)),
  );

  // Agrupa por categoria; disponíveis primeiro dentro de cada grupo
  const grupos = useMemo(() => {
    const g = new Map<string, CatalogoItem[]>();
    for (const p of filtrados) g.set(p.categoria, [...(g.get(p.categoria) ?? []), p]);
    return [...g.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
      .map(([cat, lista]) => [cat, [...lista].sort((a, b) => Number(b.disponivel) - Number(a.disponivel))] as const);
  }, [filtrados]);

  return (
    <div className="catalogo min-h-screen">
      {/* Cabeçalho */}
      <header className="px-4 sm:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-[var(--c-accent)] font-medium">Catálogo</p>
        <h1 className="font-serif text-5xl sm:text-7xl font-medium tracking-tight mt-3">{catalogoConfig.nome}</h1>
        <p className="mt-3 text-[15px] sm:text-lg text-[var(--c-soft)]">{catalogoConfig.slogan}</p>
        <a
          href={linkWhatsApp("Olá! Vi o seu catálogo e gostaria de mais informações.")}
          target="_blank" rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[var(--c-wa)] text-white text-sm font-medium shadow-sm hover:brightness-110 active:scale-[.98] transition"
        >
          <MessageCircle className="size-4" /> Fale comigo no WhatsApp
        </a>
      </header>

      {/* Busca e categorias */}
      <div className="sticky top-0 z-20 bg-[var(--c-bg)]/90 backdrop-blur border-y border-[var(--c-line)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative sm:w-72 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[var(--c-soft)]" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto…"
              className="h-11 w-full rounded-full border border-[var(--c-line)] bg-[var(--c-surface)] pl-10 pr-9 text-sm outline-none focus:border-[var(--c-accent)] placeholder:text-[var(--c-soft)]"
            />
            {busca && (
              <button onClick={() => setBusca("")} aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 size-7 grid place-items-center rounded-full text-[var(--c-soft)] hover:bg-[var(--c-accent-soft)]">
                <X className="size-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 pb-0.5 [scrollbar-width:none]">
            <Chip ativo={!categoria} onClick={() => setCategoria(null)}>Todos <span className="opacity-60">{itens.length}</span></Chip>
            {categorias.map(([cat, n]) => (
              <Chip key={cat} ativo={categoria === cat} onClick={() => setCategoria(categoria === cat ? null : cat)}>
                {cat} <span className="opacity-60">{n}</span>
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* Produtos */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {isLoading && <GradeCarregando />}
        {isError && <Aviso>Não foi possível carregar o catálogo. Tente novamente em instantes.</Aviso>}
        {!isLoading && !isError && filtrados.length === 0 && (
          <Aviso>{itens.length === 0 ? "Nenhum produto no catálogo ainda." : "Nenhum produto encontrado para essa busca."}</Aviso>
        )}

        <div className="space-y-12 sm:space-y-16">
          {grupos.map(([cat, lista]) => (
            <section key={cat}>
              <div className="flex items-baseline justify-between gap-3 mb-5 sm:mb-6 border-b border-[var(--c-line)] pb-3">
                <h2 className="font-serif text-2xl sm:text-3xl font-medium">{cat}</h2>
                <span className="text-xs text-[var(--c-soft)]">{lista.length} {lista.length === 1 ? "item" : "itens"}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9">
                {lista.map((p) => <CartaoProduto key={p.id} produto={p} onAbrir={() => setAberto(p)} />)}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-[var(--c-line)] px-4 py-10 text-center">
        <p className="font-serif text-xl">{catalogoConfig.nome}</p>
        <p className="text-xs text-[var(--c-soft)] mt-1.5">Estoque atualizado em tempo real · Valores sujeitos a alteração</p>
      </footer>

      <DetalheProduto produto={aberto} onFechar={() => setAberto(null)} />
    </div>
  );
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 px-4 shrink-0 rounded-full text-sm whitespace-nowrap border transition",
        ativo
          ? "bg-[var(--c-ink)] text-[var(--c-bg)] border-[var(--c-ink)]"
          : "bg-[var(--c-surface)] border-[var(--c-line)] text-[var(--c-ink)] hover:border-[var(--c-accent)]",
      )}
    >
      {children}
    </button>
  );
}

function Foto({ produto, className, iconSize = "size-10" }: { produto: CatalogoItem; className?: string; iconSize?: string }) {
  const estilo = estiloDe(produto.categoria);
  const [erro, setErro] = useState(false);
  if (produto.foto_url && !erro) {
    return <img src={produto.foto_url} alt={produto.nome} loading="lazy" onError={() => setErro(true)}
      className={cn("size-full object-cover", className)} />;
  }
  const Icone = estilo.icon;
  return (
    <div className={cn("size-full grid place-items-center", className)} style={{ background: estilo.fundo }}>
      <Icone className={cn(iconSize, "opacity-70")} style={{ color: estilo.tinta }} strokeWidth={1.25} />
    </div>
  );
}

function Preco({ valor, grande }: { valor: number | null; grande?: boolean }) {
  if (valor == null) {
    return <span className={cn("text-[var(--c-soft)] italic", grande ? "text-base" : "text-[13px]")}>Consulte o valor</span>;
  }
  return <span className={cn("font-serif font-semibold", grande ? "text-3xl" : "text-lg")}>{formatBRL(valor)}</span>;
}

function CartaoProduto({ produto, onAbrir }: { produto: CatalogoItem; onAbrir: () => void }) {
  const { titulo, medida } = separarMedida(produto.nome);
  return (
    <button onClick={onAbrir} className="group text-left flex flex-col">
      <div className={cn(
        "relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[var(--c-surface)] ring-1 ring-[var(--c-line)]",
        !produto.disponivel && "opacity-60 grayscale",
      )}>
        <Foto produto={produto} className="transition-transform duration-500 group-hover:scale-[1.04]" />
        {!produto.disponivel && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-[var(--c-ink)] text-[var(--c-bg)] text-[10px] uppercase tracking-wider px-2.5 py-1">
            Esgotado
          </span>
        )}
        {medida && (
          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-[var(--c-surface)]/90 backdrop-blur text-[11px] font-medium px-2.5 py-1 text-[var(--c-ink)]">
            {medida}
          </span>
        )}
      </div>
      <div className="pt-3 px-0.5 flex-1 flex flex-col">
        <h3 className="text-[15px] leading-snug font-medium line-clamp-2">{titulo}</h3>
        <div className="mt-1.5"><Preco valor={produto.preco_venda} /></div>
      </div>
    </button>
  );
}

function DetalheProduto({ produto, onFechar }: { produto: CatalogoItem | null; onFechar: () => void }) {
  const p = produto;
  const { titulo, medida } = p ? separarMedida(p.nome) : { titulo: "", medida: null };
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="catalogo max-w-3xl p-0 gap-0 overflow-hidden rounded-3xl border-[var(--c-line)] max-h-[92dvh] overflow-y-auto">
        {p && (
          <div className="grid md:grid-cols-2">
            <div className="aspect-square md:aspect-auto md:min-h-[440px] bg-[var(--c-surface)]">
              <Foto produto={p} iconSize="size-16" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--c-accent)] font-medium">{p.categoria}</p>
              <DialogTitle className="font-serif text-3xl font-medium leading-tight mt-2">{titulo}</DialogTitle>
              {medida && <p className="text-sm text-[var(--c-soft)] mt-1">{medida}</p>}
              <div className="mt-5"><Preco valor={p.preco_venda} grande /></div>
              <DialogDescription className="mt-5 text-[15px] leading-relaxed text-[var(--c-soft)] whitespace-pre-line">
                {p.descricao || "Produto original, trazido direto do Paraguai. Chame no WhatsApp para saber mais detalhes."}
              </DialogDescription>
              <div className="mt-auto pt-8 space-y-2">
                {p.disponivel ? (
                  <a href={linkWhatsApp(mensagemPedido(p))} target="_blank" rel="noreferrer"
                    className="h-12 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--c-wa)] text-white font-medium hover:brightness-110 active:scale-[.98] transition">
                    <MessageCircle className="size-4" /> Quero este produto
                  </a>
                ) : (
                  <a href={linkWhatsApp(`Olá! O produto ${p.nome} vai voltar ao estoque?`)} target="_blank" rel="noreferrer"
                    className="h-12 w-full inline-flex items-center justify-center gap-2 rounded-full border border-[var(--c-ink)] font-medium hover:bg-[var(--c-ink)] hover:text-[var(--c-bg)] transition">
                    Esgotado · Avise-me quando chegar
                  </a>
                )}
                <p className="text-[11px] text-center text-[var(--c-soft)]">Abre uma conversa no WhatsApp</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function GradeCarregando() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-6 sm:gap-x-5 sm:gap-y-9">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-2xl bg-[var(--c-line)]/60" />
          <div className="h-4 w-3/4 rounded bg-[var(--c-line)]/60 mt-3" />
          <div className="h-4 w-1/3 rounded bg-[var(--c-line)]/60 mt-2" />
        </div>
      ))}
    </div>
  );
}

function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-[var(--c-soft)] py-16">{children}</p>;
}
