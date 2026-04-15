"use client";

import { useState } from "react";
import Link from "next/link";
import { useProdutosCatalogo, useBuscaProdutos } from "@/lib/api/hooks/use-produtos";

export default function CatalogoPage() {
  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState("");

  const catalogoQuery = useProdutosCatalogo(page);
  const buscaQuery = useBuscaProdutos(buscaAtiva, page);

  const isSearching = buscaAtiva.length >= 2;
  const { data, isLoading } = isSearching ? buscaQuery : catalogoQuery;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setBuscaAtiva(busca);
    setPage(1);
  };

  const handleClearSearch = () => {
    setBusca("");
    setBuscaAtiva("");
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Catálogo de Produtos</h1>
      <p className="mt-2 text-muted-foreground">
        Navegue pelo catálogo de produtos disponíveis
      </p>

      {/* Search */}
      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produtos..."
          className="w-full max-w-md rounded-md border bg-background px-4 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Buscar
        </button>
        {isSearching && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Limpar
          </button>
        )}
      </form>

      {isSearching && (
        <p className="mt-4 text-sm text-muted-foreground">
          Resultados para &quot;{buscaAtiva}&quot;
          {data && ` (${data.total} encontrados)`}
        </p>
      )}

      {isLoading && <p className="mt-8 text-muted-foreground">Carregando...</p>}

      {data && (
        <>
          {data.items.length === 0 ? (
            <div className="mt-8 rounded-lg border p-8 text-center text-muted-foreground">
              Nenhum produto encontrado
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <Link
                  key={p.id}
                  href={`/catalogo/${p.id}`}
                  className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <h3 className="text-lg font-semibold">{p.nome}</h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    SKU: {p.sku}
                  </p>
                  {p.descricao && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.descricao}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold">
                      R$ {Number(p.preco_venda ?? p.preco_base).toFixed(2)}
                    </span>
                    <span
                      className={`text-xs ${
                        p.estoque_disponivel > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {p.estoque_disponivel > 0
                        ? `${p.estoque_disponivel} em estoque`
                        : "Indisponível"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {data.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-between">
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
