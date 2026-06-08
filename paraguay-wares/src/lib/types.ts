export type Categoria = string;

export interface Produto {
  id: string;
  nome: string;
  categoria: Categoria;
  descricao?: string | null;
  sku?: string | null;
  quantidade_atual: number;
  estoque_minimo: number;
  custo_medio: number;
  ultimo_valor_pago: number;
  foto_url?: string | null;
  criado_em: string;
  atualizado_em: string;
}

export type TipoMovimentacao = "entrada" | "venda" | "perda" | "uso_pessoal" | "ajuste";

export interface Movimentacao {
  id: string;
  produto_id: string;
  produto_nome: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
  cotacao_dolar?: number | null;
  data_movimentacao: string;
  observacoes?: string | null;
  fornecedor?: string | null;
  criado_em: string;
}

export interface Dashboard {
  total_produtos: number;
  total_unidades_estoque: number;
  valor_total_estoque: number;
  produtos_estoque_baixo: number;
  vendas_mes_quantidade: number;
  vendas_mes_valor: number;
}

export interface VendaPeriodoItem {
  data: string;
  quantidade_total: number;
  valor_total: number;
}

export interface VendasPeriodo {
  de: string | null;
  ate: string | null;
  quantidade_total: number;
  valor_total: number;
  itens: VendaPeriodoItem[];
}

export const valorTotalEstoque = (p: Produto) => p.quantidade_atual * p.custo_medio;
export const estoqueBaixo = (p: Produto) => p.quantidade_atual <= p.estoque_minimo;
