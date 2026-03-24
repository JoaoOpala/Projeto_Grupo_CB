"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema, type ProdutoFormData } from "@/lib/validations/produto";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: { estoque_disponivel: 0 },
  });

  const onSubmit = async (data: ProdutoFormData) => {
    setError("");
    try {
      await apiClient.post(ENDPOINTS.FORNECEDOR.PRODUTOS, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      router.push("/fornecedor/produtos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar produto");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
      <p className="mt-2 text-muted-foreground">
        Cadastre um novo produto no catálogo
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">SKU</label>
            <input
              {...register("sku")}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="EX-001"
            />
            {errors.sku && (
              <p className="mt-1 text-xs text-destructive">{errors.sku.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Nome</label>
            <input
              {...register("nome")}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            {...register("descricao")}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Preço Base (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register("preco_base")}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {errors.preco_base && (
              <p className="mt-1 text-xs text-destructive">{errors.preco_base.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Preço Venda Sugerido (R$)</label>
            <input
              type="number"
              step="0.01"
              {...register("preco_venda_sugerido")}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {errors.preco_venda_sugerido && (
              <p className="mt-1 text-xs text-destructive">
                {errors.preco_venda_sugerido.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Estoque Inicial</label>
            <input
              type="number"
              {...register("estoque_disponivel")}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            {errors.estoque_disponivel && (
              <p className="mt-1 text-xs text-destructive">
                {errors.estoque_disponivel.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Peso (kg) - opcional</label>
          <input
            type="number"
            step="0.001"
            {...register("peso_kg")}
            className="mt-1 w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
