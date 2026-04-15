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
  ean?: string;
  nome: string;
  marca?: string;
  modelo?: string;
  descricao?: string;
  preco_base: number;
  /** Preço de venda definido pelo Admin */
  preco_venda?: number;
  estoque_disponivel: number;
  imagens: string[];
  videos?: string[];
  atributos: Record<string, unknown>;
  status: StatusProduto;
  comprimento_cm?: number;
  largura_cm?: number;
  altura_cm?: number;
  peso_kg?: number;
  local_origem?: string;
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
