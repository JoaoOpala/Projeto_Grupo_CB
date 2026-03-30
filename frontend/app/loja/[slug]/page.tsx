"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";

interface ProdutoLoja {
  produto_loja_id: string;
  produto_id: string;
  sku: string;
  nome: string;
  descricao?: string;
  imagens: string[];
  preco_venda: number;
  destaque: boolean;
}

interface LojaData {
  loja: {
    id: string;
    nome_loja: string;
    slug: string;
    descricao?: string;
    logo_url?: string;
  };
  items: ProdutoLoja[];
  total: number;
  page: number;
  total_pages: number;
}

export default function LojaPublicaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaInput, setBuscaInput] = useState("");
  const [apenasDestaque, setApenasDestaque] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["loja-publica", slug, page, busca, apenasDestaque],
    queryFn: () =>
      apiClient.get<LojaData>(ENDPOINTS.LOJAS.PRODUTOS(slug), {
        params: {
          page: String(page),
          ...(busca ? { busca } : {}),
          ...(apenasDestaque ? { apenas_destaque: "true" } : {}),
        },
      }),
    enabled: !!slug,
    retry: false,
  });

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    setBusca(buscaInput);
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando loja...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loja não encontrada</h1>
          <p className="mt-2 text-muted-foreground">
            Este link de loja não existe ou está inativo.
          </p>
        </div>
      </div>
    );
  }

  const { loja, items } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header da loja */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center gap-6">
            {loja.logo_url ? (
              <img
                src={loja.logo_url}
                alt={loja.nome_loja}
                className="h-20 w-20 rounded-full object-cover border"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {loja.nome_loja.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{loja.nome_loja}</h1>
              {loja.descricao && (
                <p className="mt-1 text-muted-foreground">{loja.descricao}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {data.total} produto(s) disponível(eis)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleBusca} className="flex gap-2">
              <input
                type="text"
                value={buscaInput}
                onChange={(e) => setBuscaInput(e.target.value)}
                placeholder="Buscar produto..."
                className="rounded-md border bg-background px-3 py-2 text-sm w-60"
              />
              <button
                type="submit"
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Buscar
              </button>
              {busca && (
                <button
                  type="button"
                  onClick={() => { setBusca(""); setBuscaInput(""); setPage(1); }}
                  className="rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  Limpar
                </button>
              )}
            </form>

            <button
              onClick={() => { setApenasDestaque(!apenasDestaque); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                apenasDestaque
                  ? "bg-yellow-400 text-yellow-900"
                  : "border hover:bg-muted"
              }`}
            >
              ⭐ Em Destaque
            </button>
          </div>
        </div>
      </div>

      {/* Produtos */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {busca
                ? `Nenhum produto encontrado para "${busca}"`
                : "Nenhum produto disponível no momento"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((produto) => (
              <Link
                key={produto.produto_loja_id}
                href={`/loja/${slug}/produto/${produto.produto_id}`}
                className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagem */}
                <div className="relative aspect-square bg-muted">
                  {produto.imagens && produto.imagens.length > 0 ? (
                    <img
                      src={produto.imagens[0]}
                      alt={produto.nome}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl text-muted-foreground/30">📦</span>
                    </div>
                  )}
                  {produto.destaque && (
                    <span className="absolute top-2 left-2 rounded-full bg-yellow-400 px-2 py-0.5 text-xs font-bold text-yellow-900">
                      ⭐ Destaque
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4">
                  <p className="font-mono text-xs text-muted-foreground">{produto.sku}</p>
                  <h3 className="mt-1 font-semibold leading-tight line-clamp-2 group-hover:text-primary">
                    {produto.nome}
                  </h3>
                  {produto.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {produto.descricao}
                    </p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(produto.preco_venda)}
                    </span>
                    <span className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      Ver
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Paginação */}
        {data.total_pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border px-4 py-2 text-sm disabled:opacity-50 hover:bg-muted"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Página {data.page} de {data.total_pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page === data.total_pages}
              className="rounded-md border px-4 py-2 text-sm disabled:opacity-50 hover:bg-muted"
            >
              Próxima
            </button>
          </div>
        )}
      </div>

      {/* Footer da loja */}
      <div className="border-t bg-muted/30 py-6 text-center text-sm text-muted-foreground">
        Você está na loja de <strong>{loja.nome_loja}</strong> · Marketplace CB
      </div>
    </div>
  );
}
