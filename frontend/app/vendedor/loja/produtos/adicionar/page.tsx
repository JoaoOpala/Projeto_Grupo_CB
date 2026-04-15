"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useAdicionarProdutoLoja } from "@/lib/api/hooks/use-vendedor";
import { useProdutosCatalogo } from "@/lib/api/hooks/use-produtos";

export default function AdicionarProdutoLojaPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data: catalogo, isLoading } = useProdutosCatalogo(page);
  const adicionar = useAdicionarProdutoLoja(accessToken);

  const [selectedId, setSelectedId] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [error, setError] = useState("");

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !precoVenda) return;
    setError("");
    try {
      await adicionar.mutateAsync({
        produto_id: selectedId,
        preco_venda: Number(precoVenda),
      });
      router.push("/vendedor/loja/produtos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar produto");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Adicionar Produto à Loja
      </h1>
      <p className="mt-2 text-muted-foreground">
        Selecione produtos do catálogo de fornecedores para vender na sua loja
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando catálogo...</p>}

      {catalogo && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Selecionar</th>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-right font-medium">Preço Base</th>
                  <th className="px-4 py-3 text-right font-medium">Preço Sugerido</th>
                  <th className="px-4 py-3 text-right font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {catalogo.items.map((p) => (
                  <tr
                    key={p.id}
                    className={`cursor-pointer hover:bg-muted/30 ${
                      selectedId === p.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      setSelectedId(p.id);
                      if (!precoVenda) {
                        setPrecoVenda(String(p.preco_venda ?? p.preco_base));
                      }
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="radio"
                        name="produto"
                        checked={selectedId === p.id}
                        onChange={() => {
                          setSelectedId(p.id);
                          if (!precoVenda) {
                            setPrecoVenda(String(p.preco_venda ?? p.preco_base));
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 text-right">
                      R$ {Number(p.preco_base).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      R$ {Number(p.preco_venda ?? p.preco_base).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">{p.estoque_disponivel}</td>
                  </tr>
                ))}
                {catalogo.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum produto disponível no catálogo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {catalogo.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {catalogo.page} de {catalogo.total_pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(catalogo.total_pages, p + 1))}
                  disabled={page === catalogo.total_pages}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedId && (
        <form onSubmit={handleAdicionar} className="mt-6 rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Definir preço de venda</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium">Preço de Venda (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={adicionar.isPending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {adicionar.isPending ? "Adicionando..." : "Adicionar à Loja"}
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
      )}
    </div>
  );
}
