"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useUpdateProdutoLoja, useRemoverProdutoLoja } from "@/lib/api/hooks/use-vendedor";

export default function DetalhesProdutoLojaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const update = useUpdateProdutoLoja(accessToken);
  const remover = useRemoverProdutoLoja(accessToken);

  const [precoVenda, setPrecoVenda] = useState("");
  const [visivel, setVisivel] = useState(true);
  const [destaque, setDestaque] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await update.mutateAsync({
        id,
        data: {
          ...(precoVenda ? { preco_venda: Number(precoVenda) } : {}),
          visivel,
          destaque,
        },
      });
      setSuccess("Produto atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar");
    }
  };

  const handleRemover = async () => {
    if (!confirm("Remover este produto da sua loja?")) return;
    await remover.mutateAsync(id);
    router.push("/vendedor/loja/produtos");
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Editar Produto da Loja</h1>

      <form onSubmit={handleSalvar} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium">Preço de Venda (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={precoVenda}
            onChange={(e) => setPrecoVenda(e.target.value)}
            placeholder="Deixe vazio para manter o atual"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={visivel}
              onChange={(e) => setVisivel(e.target.checked)}
            />
            Visível na loja
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={destaque}
              onChange={(e) => setDestaque(e.target.checked)}
            />
            Destaque
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={update.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {update.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button
            type="button"
            onClick={handleRemover}
            disabled={remover.isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Remover da Loja
          </button>
        </div>
      </form>
    </div>
  );
}
