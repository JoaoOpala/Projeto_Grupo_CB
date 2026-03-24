import { z } from "zod";

export const produtoSchema = z.object({
  sku: z.string().min(3, "SKU deve ter no mínimo 3 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  descricao: z.string().optional(),
  categoria_id: z.string().uuid().optional().or(z.literal("")),
  preco_base: z.coerce.number().positive("Preço base deve ser positivo"),
  preco_venda_sugerido: z.coerce.number().positive("Preço de venda deve ser positivo"),
  estoque_disponivel: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  peso_kg: z.coerce.number().positive().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;

export const produtoLojaSchema = z.object({
  produto_id: z.string().uuid("Selecione um produto"),
  preco_venda: z.coerce.number().positive("Preço deve ser positivo"),
});

export type ProdutoLojaFormData = z.infer<typeof produtoLojaSchema>;
