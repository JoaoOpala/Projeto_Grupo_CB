"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useProdutoFornecedor, useUpdateProdutoFornecedor } from "@/lib/api/hooks/use-fornecedor";

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { data: produto, isLoading } = useProdutoFornecedor(accessToken, id);
  const updateProduto = useUpdateProdutoFornecedor(accessToken);

  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco_base: "",
    preco_venda_sugerido: "",
    peso_kg: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (produto && !loaded) {
      setForm({
        nome: produto.nome,
        descricao: produto.descricao || "",
        preco_base: String(produto.preco_base),
        preco_venda_sugerido: String(produto.preco_venda_sugerido),
        peso_kg: produto.peso_kg ? String(produto.peso_kg) : "",
      });
      setLoaded(true);
    }
  }, [produto, loaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await updateProduto.mutateAsync({
        id,
        data: {
          nome: form.nome,
          descricao: form.descricao || undefined,
          preco_base: Number(form.preco_base),
          preco_venda_sugerido: Number(form.preco_venda_sugerido),
          peso_kg: form.peso_kg ? Number(form.peso_kg) : undefined,
        },
      });
      setSuccess("Produto atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Editar Produto</h1>
      <p className="mt-1 text-sm text-muted-foreground font-mono">
        SKU: {produto?.sku}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            required
            minLength={3}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Preço Base (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={form.preco_base}
              onChange={(e) => setForm({ ...form, preco_base: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Preço Sugerido (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={form.preco_venda_sugerido}
              onChange={(e) => setForm({ ...form, preco_venda_sugerido: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Peso (kg)</label>
            <input
              type="number"
              step="0.001"
              value={form.peso_kg}
              onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateProduto.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {updateProduto.isPending ? "Salvando..." : "Salvar Alterações"}
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
