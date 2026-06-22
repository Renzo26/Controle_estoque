import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ProdutoCreate, type ProdutoUpdate } from "./api";
import type { TipoMovimentacao } from "./types";

export const qk = {
  produtos: (filters?: object) => ["produtos", filters] as const,
  produto: (id: string) => ["produtos", id] as const,
  movimentacoes: (filters?: object) => ["movimentacoes", filters] as const,
  dashboard: () => ["dashboard"] as const,
  estoqueBaixo: () => ["estoque-baixo"] as const,
  vendasPeriodo: (de?: string, ate?: string) => ["vendas-periodo", de, ate] as const,
  categorias: () => ["categorias"] as const,
};

// ---------- Produtos ----------

export function useProdutos(filters?: { q?: string; categoria?: string; estoque_baixo?: boolean }) {
  return useQuery({
    queryKey: qk.produtos(filters),
    queryFn: () => api.listarProdutos(filters),
  });
}

export function useProduto(id: string | undefined) {
  return useQuery({
    queryKey: qk.produto(id ?? ""),
    queryFn: () => api.getProduto(id!),
    enabled: !!id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["produtos"] });
  qc.invalidateQueries({ queryKey: ["movimentacoes"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  qc.invalidateQueries({ queryKey: ["estoque-baixo"] });
  qc.invalidateQueries({ queryKey: ["vendas-periodo"] });
}

export function useCriarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ProdutoCreate) => api.criarProduto(body),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useAtualizarProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ProdutoUpdate }) =>
      api.atualizarProduto(id, body),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useRemoverProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removerProduto(id),
    onSuccess: () => invalidateAll(qc),
  });
}

// ---------- Categorias ----------

export function useCategorias() {
  return useQuery({
    queryKey: qk.categorias(),
    queryFn: api.listarCategorias,
  });
}

export function useCriarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => api.criarCategoria(nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });
}

export function useRemoverCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.removerCategoria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categorias"] }),
  });
}

// ---------- Movimentações ----------

export function useMovimentacoes(filters?: {
  produto_id?: string;
  tipo?: TipoMovimentacao;
  de?: string;
  ate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: qk.movimentacoes(filters),
    queryFn: () => api.listarMovimentacoes(filters),
  });
}

export function useRegistrarMovimentacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.registrarMovimentacao,
    onSuccess: () => invalidateAll(qc),
  });
}

// ---------- Relatórios ----------

export function useDashboard() {
  return useQuery({ queryKey: qk.dashboard(), queryFn: api.dashboard });
}

export function useEstoqueBaixo() {
  return useQuery({ queryKey: qk.estoqueBaixo(), queryFn: api.estoqueBaixo });
}

export function useVendasPeriodo(de?: string, ate?: string) {
  return useQuery({
    queryKey: qk.vendasPeriodo(de, ate),
    queryFn: () => api.vendasPeriodo(de, ate),
  });
}

export function useLucroPeriodo(params?: { de?: string; ate?: string; produto_id?: string }) {
  return useQuery({
    queryKey: ["lucro-periodo", params],
    queryFn: () => api.lucroPeriodo(params),
  });
}

// ---------- Upload ----------

export function useUploadFoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => api.uploadFotoProduto(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}
