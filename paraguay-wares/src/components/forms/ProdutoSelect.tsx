import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import type { Produto } from "@/lib/types";
import { cn } from "@/lib/utils";

// Ignora acentos e maiúsculas: "lencol" encontra "Lençol"
const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Seletor de produto com busca por nome. A lista abre dentro do próprio formulário
 * (sem popover), para rolar bem no celular e dentro de modais.
 */
export function ProdutoSelect({
  produtos, value, onChange, detalhe,
}: {
  produtos: Produto[];
  value: string;
  onChange: (id: string) => void;
  detalhe?: (p: Produto) => string;
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const selecionado = produtos.find((p) => p.id === value);

  useEffect(() => {
    if (aberto) inputRef.current?.focus();
  }, [aberto]);

  const termo = normalizar(busca.trim());
  const filtrados = termo
    ? produtos.filter((p) => normalizar(`${p.nome} ${p.categoria} ${p.sku ?? ""}`).includes(termo))
    : produtos;

  const escolher = (id: string) => {
    onChange(id);
    setAberto(false);
    setBusca("");
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="h-12 w-full flex items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm"
      >
        <span className={cn("truncate", !selecionado && "text-muted-foreground")}>
          {selecionado ? selecionado.nome : "Escolha um produto"}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 opacity-50 transition-transform", aberto && "rotate-180")} />
      </button>

      {aberto && (
        <div className="mt-2 rounded-md border bg-popover">
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="size-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtrados.length > 0) {
                  e.preventDefault();
                  escolher(filtrados[0].id);
                }
                if (e.key === "Escape") setAberto(false);
              }}
              placeholder="Buscar pelo nome…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-64 overflow-y-auto overscroll-contain py-1">
            {filtrados.length === 0 && (
              <li className="px-3 py-4 text-center text-sm text-muted-foreground">Nenhum produto encontrado.</li>
            )}
            {filtrados.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => escolher(p.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted",
                    p.id === value && "bg-primary-soft text-primary",
                  )}
                >
                  <Check className={cn("size-4 shrink-0", p.id === value ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1 truncate">{p.nome}</span>
                  {detalhe && <span className="shrink-0 text-xs text-muted-foreground">{detalhe(p)}</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
