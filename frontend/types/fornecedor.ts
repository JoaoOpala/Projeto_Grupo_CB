export type TipoFornecedor = "INDUSTRIA" | "DISTRIBUIDOR";
export type StatusFornecedor = "PENDENTE" | "APROVADO" | "REJEITADO" | "SUSPENSO";

export interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  email: string;
  telefone?: string;
  tipo: TipoFornecedor;
  status: StatusFornecedor;
  created_at: string;
  updated_at: string;
}

export interface CondicaoComercial {
  id: string;
  fornecedor_id: string;
  margem_minima: number;
  prazo_entrega_dias: number;
  politica_devolucao?: string;
}
