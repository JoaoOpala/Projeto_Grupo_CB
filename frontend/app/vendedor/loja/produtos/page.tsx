"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useProdutosLoja, useRemoverProdutoLoja, useUpdateProdutoLoja } from "@/lib/api/hooks/use-vendedor";

export default function ProdutosLojaPage() {
  const { accessToken } = useAuthStore();
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProdutosLoja(accessToken, page);
  const remover = useRemoverProdutoLoja(accessToken);
  const update = useUpdateProdutoLoja(accessToken);

  const handleRemover = async (id: string) => {
    if (!confirm("Remover este produto da sua loja?")) return;
    try {
      await remover.mutateAsync(id);
    } catch {
      alert("Erro ao remover produto.");
    }
  };

  const handleToggleVisivel = async (id: string, visivel: boolean) => {
    await update.mutateAsync({ id, data: { visivel: !visivel } });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie os produtos da sua loja
          </p>
        </div>
        <Link
          href="/vendedor/loja/produtos/adicionar"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Adicionar Produto
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
          Crie sua loja primeiro em &quot;Configurações da Loja&quot; para poder adicionar produtos.
        </div>
      )}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-right font-medium">Preço Venda</th>
                  <th className="px-4 py-3 text-right font-medium">Margem</th>
                  <th className="px-4 py-3 text-left font-medium">Visível</th>
                  <th className="px-4 py-3 text-left font-medium">Destaque</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((pl) => (
                  <tr key={pl.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      {pl.produto_nome || pl.produto_id}
                      {pl.produto_sku && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                          {pl.produto_sku}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      R$ {Number(pl.preco_venda).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(Number(pl.margem) * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleVisivel(pl.id, pl.visivel)}
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          pl.visivel
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pl.visivel ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          pl.destaque
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pl.destaque ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/vendedor/loja/produtos/${pl.id}`}
                          className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleRemover(pl.id)}
                          disabled={remover.isPending}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum produto na loja. Adicione produtos do catálogo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} produtos)
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
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
