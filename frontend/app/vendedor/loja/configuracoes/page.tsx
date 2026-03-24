"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import { lojaSchema, type LojaFormData } from "@/lib/validations/vendedor";

export default function ConfiguracoesLojaPage() {
  const { accessToken } = useAuthStore();
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LojaFormData>({
    resolver: zodResolver(lojaSchema),
  });

  const onSubmitCreate = async (data: LojaFormData) => {
    setError("");
    setSuccess("");
    try {
      await apiClient.post(ENDPOINTS.VENDEDOR.LOJA, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuccess("Loja criada com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar loja");
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações da Loja</h1>
      <p className="mt-2 text-muted-foreground">
        Crie ou gerencie sua loja
      </p>

      <form onSubmit={handleSubmit(onSubmitCreate)} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Nome da Loja</label>
          <input
            {...register("nome_loja")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.nome_loja && (
            <p className="mt-1 text-xs text-destructive">{errors.nome_loja.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            {...register("descricao")}
            rows={3}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">URL do Logo (opcional)</label>
          <input
            {...register("logo_url")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="https://..."
          />
          {errors.logo_url && (
            <p className="mt-1 text-xs text-destructive">{errors.logo_url.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : "Salvar Loja"}
        </button>
      </form>
    </div>
  );
}
