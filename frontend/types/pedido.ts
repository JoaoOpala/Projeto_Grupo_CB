import type { Endereco } from "./api";

export type StatusPedido =
  | "AGUARDANDO_PAGAMENTO"
  | "PAGO"
  | "NOTA_FISCAL_EMITIDA"
  | "ETIQUETA_GERADA"
  | "DESPACHADO"
  | "EM_ENTREGA"
  | "ENTREGUE"
  | "EM_DEVOLUCAO"
  | "CANCELADO";

export interface HistoricoStatus {
  status: StatusPedido;
  data_hora: string;
  observacoes?: string;
}

export interface ItemPedido {
  id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  produto_nome: string;
  produto_sku: string;
}

export interface Pedido {
  id: string;
  numero_pedido: string;
  loja_id: string;
  fornecedor_id: string;
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone?: string;
  endereco_entrega: Endereco;
  valor_produtos: number;
  valor_frete: number;
  valor_desconto: number;
  valor_total: number;
  valor_comissao_plataforma: number;
  valor_comissao_vendedor: number;
  /** Valor calculado com base no preço base do fornecedor */
  valor_base_fornecedor?: number;
  /** Valor já pago ao fornecedor */
  valor_pago_fornecedor: number;
  status: StatusPedido;
  codigo_rastreio?: string;
  observacoes?: string;
  historico_status?: HistoricoStatus[];
  itens: ItemPedido[];
  created_at: string;
  updated_at: string;
}
