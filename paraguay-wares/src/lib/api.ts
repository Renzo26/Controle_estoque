import type {
  Produto,
  Movimentacao,
  TipoMovimentacao,
  Dashboard,
  VendasPeriodo,
} from "./types";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { query?: Record<string, string | number | boolean | undefined | null> }
): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (init?.query) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body && !(init.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...init, headers });
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) ||
      `Erro ${res.status} ao acessar ${path}`;
    const msg = Array.isArray(detail)
      ? detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ")
      : String(detail);
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

const num = (v: unknown): number => (typeof v === "string" ? Number(v) : (v as number) ?? 0);

const normalizeProduto = (p: any): Produto => ({
  ...p,
  quantidade_atual: Number(p.quantidade_atual ?? 0),
  estoque_minimo: Number(p.estoque_minimo ?? 0),
  custo_medio: num(p.custo_medio),
  ultimo_valor_pago: num(p.ultimo_valor_pago),
});

const normalizeMov = (m: any): Movimentacao => ({
  ...m,
  quantidade: Number(m.quantidade ?? 0),
  valor_unitario: num(m.valor_unitario),
  valor_total: num(m.valor_total),
  cotacao_dolar: m.cotacao_dolar != null ? num(m.cotacao_dolar) : null,
  produto_nome: m.produto_nome ?? "",
});

// ---------- Produtos ----------

export interface ProdutoCreate {
  nome: string;
  categoria: string;
  sku?: string;
  descricao?: string;
  estoque_minimo: number;
  quantidade_inicial?: number;
  valor_unitario_inicial?: number;
  cotacao_dolar_inicial?: number;
  fornecedor_inicial?: string;
}

export interface ProdutoUpdate {
  nome?: string;
  categoria?: string;
  sku?: string;
  descricao?: string;
  estoque_minimo?: number;
}

export const api = {
  // Produtos
  listarProdutos: async (filters?: { q?: string; categoria?: string; estoque_baixo?: boolean }) => {
    const list = await request<any[]>("/produtos", { query: filters });
    return list.map(normalizeProduto);
  },
  getProduto: async (id: string) => normalizeProduto(await request<any>(`/produtos/${id}`)),
  criarProduto: async (body: ProdutoCreate) =>
    normalizeProduto(await request<any>("/produtos", { method: "POST", body: JSON.stringify(body) })),
  atualizarProduto: async (id: string, body: ProdutoUpdate) =>
    normalizeProduto(await request<any>(`/produtos/${id}`, { method: "PUT", body: JSON.stringify(body) })),
  removerProduto: (id: string) => request<void>(`/produtos/${id}`, { method: "DELETE" }),

  // Movimentações
  listarMovimentacoes: async (filters?: {
    produto_id?: string;
    tipo?: TipoMovimentacao;
    de?: string;
    ate?: string;
    limit?: number;
  }) => {
    const list = await request<any[]>("/movimentacoes", { query: filters });
    return list.map(normalizeMov);
  },
  registrarMovimentacao: async (body: {
    produto_id: string;
    tipo: TipoMovimentacao;
    quantidade: number;
    valor_unitario?: number;
    cotacao_dolar?: number;
    data_movimentacao?: string;
    fornecedor?: string;
    observacoes?: string;
  }) =>
    normalizeMov(
      await request<any>("/movimentacoes", { method: "POST", body: JSON.stringify(body) })
    ),

  // Relatórios
  dashboard: async (): Promise<Dashboard> => {
    const d = await request<any>("/relatorios/dashboard");
    return {
      total_produtos: Number(d.total_produtos ?? 0),
      total_unidades_estoque: Number(d.total_unidades_estoque ?? 0),
      valor_total_estoque: num(d.valor_total_estoque),
      produtos_estoque_baixo: Number(d.produtos_estoque_baixo ?? 0),
      vendas_mes_quantidade: Number(d.vendas_mes_quantidade ?? 0),
      vendas_mes_valor: num(d.vendas_mes_valor),
    };
  },
  estoqueBaixo: async () => {
    const list = await request<any[]>("/relatorios/estoque-baixo");
    return list.map(normalizeProduto);
  },
  vendasPeriodo: async (de?: string, ate?: string): Promise<VendasPeriodo> => {
    const d = await request<any>("/relatorios/vendas", { query: { de, ate } });
    return {
      de: d.de ?? null,
      ate: d.ate ?? null,
      quantidade_total: Number(d.quantidade_total ?? 0),
      valor_total: num(d.valor_total),
      itens: (d.itens ?? []).map((i: any) => ({
        data: i.data,
        quantidade_total: Number(i.quantidade_total ?? 0),
        valor_total: num(i.valor_total),
      })),
    };
  },

  // Upload
  uploadFotoProduto: async (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return normalizeProduto(
      await request<any>(`/produtos/${id}/foto`, { method: "POST", body: form })
    );
  },
};
