import type { Endereco } from "./api";

export type StatusPedido =
  | "AGUARDANDO_PAGAMENTO"
  | "PAGO"
  | "PREPARANDO"
  | "ENVIADO"
  | "ENTREGUE"
  | "CANCELADO"
  | "DEVOLVIDO";

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
  status: StatusPedido;
  codigo_rastreio?: string;
  observacoes?: string;
  itens: ItemPedido[];
  created_at: string;
  updated_at: string;
}
