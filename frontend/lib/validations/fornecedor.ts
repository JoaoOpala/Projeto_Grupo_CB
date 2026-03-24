import { z } from "zod";

export const registroFornecedorSchema = z.object({
  razao_social: z.string().min(3, "Razão social deve ter no mínimo 3 caracteres"),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  tipo: z.enum(["INDUSTRIA", "DISTRIBUIDOR"]),
  senha: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
  confirmar_senha: z.string(),
}).refine((data) => data.senha === data.confirmar_senha, {
  message: "As senhas não coincidem",
  path: ["confirmar_senha"],
});

export type RegistroFornecedorFormData = z.infer<typeof registroFornecedorSchema>;
