import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registroVendedorSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf_cnpj: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .max(18, "CPF/CNPJ inválido"),
  telefone: z.string().optional(),
  tipo_pessoa: z.enum(["FISICA", "JURIDICA"]),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmar_senha: z.string(),
}).refine((data) => data.senha === data.confirmar_senha, {
  message: "As senhas não coincidem",
  path: ["confirmar_senha"],
});

export type RegistroVendedorFormData = z.infer<typeof registroVendedorSchema>;

export const lojaSchema = z.object({
  nome_loja: z.string().min(3, "Nome da loja deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  logo_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

export type LojaFormData = z.infer<typeof lojaSchema>;
