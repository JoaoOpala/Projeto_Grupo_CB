"use client";

import { useState } from "react";
import {
  useAdminProdutosModeracao,
  useAprovarProduto,
  useRejeitarProduto,
} from "@/lib/api/hooks/use-admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default function ModerarProdutosPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminProdutosModeracao(page);
  const aprovar = useAprovarProduto();
  const rejeitar = useRejeitarProduto();

  const handleAprovar = async (id: string) => {
    if (!confirm("Aprovar este produto?")) return;
    await aprovar.mutateAsync(id);
  };

  const handleRejeitar = async (id: string) => {
    if (!confirm("Rejeitar este produto?")) return;
    await rejeitar.mutateAsync(id);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Moderação de Produtos</h1>
      <p className="mt-2 text-muted-foreground">
        Produtos aguardando aprovação para o catálogo
      </p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar produtos.</p>}

      {data && (
        <>
          <div className="mt-6 space-y-4">
            {data.items.map((p) => (
              <div key={p.id} className="rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{p.nome}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">SKU: {p.sku}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAprovar(p.id)}
                      disabled={aprovar.isPending}
                      className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleRejeitar(p.id)}
                      disabled={rejeitar.isPending}
                      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>

                {p.descricao && (
                  <p className="mt-3 text-sm">{p.descricao}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Preço Base: </span>
                    <span className="font-medium">{formatCurrency(p.preco_base)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço Sugerido: </span>
                    <span className="font-medium">{formatCurrency(p.preco_venda_sugerido)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estoque: </span>
                    <span className="font-medium">{p.estoque_disponivel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cadastrado em: </span>
                    <span>{formatDate(p.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}

            {data.items.length === 0 && (
              <div className="rounded-lg border p-8 text-center text-muted-foreground">
                Nenhum produto aguardando moderação
              </div>
            )}
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
