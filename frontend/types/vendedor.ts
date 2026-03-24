export type TipoPessoa = "FISICA" | "JURIDICA";
export type StatusVendedor = "PENDENTE" | "ATIVO" | "INATIVO" | "SUSPENSO";

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  cpf_cnpj: string;
  telefone?: string;
  tipo_pessoa: TipoPessoa;
  status: StatusVendedor;
  comissao_padrao: number;
  created_at: string;
  updated_at: string;
}

export interface Loja {
  id: string;
  vendedor_id: string;
  nome_loja: string;
  slug: string;
  descricao?: string;
  logo_url?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}
