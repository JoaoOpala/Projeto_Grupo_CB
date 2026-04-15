import { z } from "zod";

export const produtoSchema = z.object({
  sku: z.string().min(3, "SKU deve ter no mínimo 3 caracteres"),
  ean: z.string().min(8, "EAN deve ter no mínimo 8 caracteres").max(20, "EAN deve ter no máximo 20 caracteres"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  marca: z.string().min(1, "Marca é obrigatória"),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  descricao: z.string().optional(),
  categoria_id: z.string().uuid().optional().or(z.literal("")),
  preco_base: z.coerce.number().positive("Preço base deve ser positivo"),
  estoque_disponivel: z.coerce.number().int().min(0, "Estoque não pode ser negativo"),
  // Medidas da embalagem
  comprimento_cm: z.coerce.number().positive("Comprimento deve ser positivo"),
  largura_cm: z.coerce.number().positive("Largura deve ser positiva"),
  altura_cm: z.coerce.number().positive("Altura deve ser positiva"),
  peso_kg: z.coerce.number().positive("Peso deve ser positivo"),
  // Mídia
  imagens: z
    .array(z.string().url("URL inválida"))
    .min(1, "Pelo menos 1 foto é obrigatória")
    .max(15, "Máximo de 15 fotos"),
  videos: z.array(z.string().url("URL inválida")).optional(),
  local_origem: z.string().optional(),
});

export type ProdutoFormData = z.infer<typeof produtoSchema>;

export const produtoLojaSchema = z.object({
  produto_id: z.string().uuid("Selecione um produto"),
  preco_venda: z.coerce.number().positive("Preço deve ser positivo"),
});

export type ProdutoLojaFormData = z.infer<typeof produtoLojaSchema>;
