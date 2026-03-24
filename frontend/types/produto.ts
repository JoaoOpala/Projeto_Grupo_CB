export type StatusProduto =
  | "RASCUNHO"
  | "MODERACAO"
  | "ATIVO"
  | "INATIVO"
  | "REJEITADO";

export interface Produto {
  id: string;
  fornecedor_id: string;
  categoria_id?: string;
  sku: string;
  nome: string;
  descricao?: string;
  preco_base: number;
  preco_venda_sugerido: number;
  estoque_disponivel: number;
  imagens: string[];
  atributos: Record<string, unknown>;
  status: StatusProduto;
  peso_kg?: number;
  created_at: string;
  updated_at: string;
}

export interface ProdutoLoja {
  id: string;
  produto_id: string;
  loja_id: string;
  preco_venda: number;
  margem: number;
  visivel: boolean;
  destaque: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  categoria_pai_id?: string;
  ativa: boolean;
}
