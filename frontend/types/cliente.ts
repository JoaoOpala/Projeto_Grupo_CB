export type StatusCliente = "ATIVO" | "INATIVO" | "SUSPENSO";

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  cpf?: string;
  telefone?: string;
  endereco?: string;
  status: StatusCliente;
  email_verificado: boolean;
  created_at: string;
  updated_at: string;
}
