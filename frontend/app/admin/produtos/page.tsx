"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminProdutos } from "@/lib/api/hooks/use-admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  RASCUNHO: "bg-gray-100 text-gray-800",
  MODERACAO: "bg-yellow-100 text-yellow-800",
  INATIVO: "bg-gray-100 text-gray-800",
  REJEITADO: "bg-red-100 text-red-800",
};

export default function ProdutosAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminProdutos(page);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Todos os produtos ativos da plataforma
          </p>
        </div>
        <Link
          href="/admin/produtos/moderar"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Moderar Produtos
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar produtos.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">SKU</th>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Preço Base</th>
                  <th className="px-4 py-3 text-left font-medium">Preço Venda</th>
                  <th className="px-4 py-3 text-left font-medium">Estoque</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3">{formatCurrency(p.preco_base)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.preco_venda_sugerido)}</td>
                    <td className="px-4 py-3">{p.estoque_disponivel}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[p.status] || ""}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum produto encontrado
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
