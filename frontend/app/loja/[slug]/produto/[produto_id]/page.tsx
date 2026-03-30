"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatCurrency } from "@/lib/utils/format";

interface ProdutoDetalhe {
  produto_loja_id: string;
  produto_id: string;
  sku: string;
  nome: string;
  descricao?: string;
  imagens: string[];
  atributos: Record<string, unknown>;
  peso_kg?: number;
  preco_venda: number;
  destaque: boolean;
}

interface LojaData {
  loja: {
    nome_loja: string;
    slug: string;
    descricao?: string;
    logo_url?: string;
  };
  items: ProdutoDetalhe[];
}

export default function ProdutoLojaPage() {
  const params = useParams();
  const slug = params.slug as string;
  const produtoId = params.produto_id as string;
  const [imagemAtiva, setImagemAtiva] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["loja-produto", slug, produtoId],
    queryFn: () =>
      apiClient.get<LojaData>(ENDPOINTS.LOJAS.PRODUTOS(slug), {
        params: { page: "1", page_size: "100" },
      }),
    enabled: !!slug && !!produtoId,
  });

  const produto = data?.items.find((p) => p.produto_id === produtoId);
  const loja = data?.loja;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error || !produto || !loja) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Produto não encontrado</h1>
          <Link
            href={`/loja/${slug}`}
            className="mt-4 inline-block text-primary hover:underline"
          >
            Voltar à loja
          </Link>
        </div>
      </div>
    );
  }

  const atributos = Object.entries(produto.atributos || {}).filter(([, v]) => v);

  return (
    <div className="min-h-screen bg-background">
      {/* Navegação */}
      <div className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/loja/${slug}`} className="hover:text-foreground">
              {loja.nome_loja}
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{produto.nome}</span>
          </div>
        </div>
      </div>

      {/* Produto */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Imagens */}
          <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
              {produto.imagens && produto.imagens.length > 0 ? (
                <img
                  src={produto.imagens[imagemAtiva]}
                  alt={produto.nome}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-6xl text-muted-foreground/30">📦</span>
                </div>
              )}
            </div>
            {produto.imagens && produto.imagens.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {produto.imagens.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagemAtiva(idx)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                      imagemAtiva === idx ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div>
            {produto.destaque && (
              <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 mb-3">
                ⭐ Produto em Destaque
              </span>
            )}

            <p className="font-mono text-sm text-muted-foreground">SKU: {produto.sku}</p>
            <h1 className="mt-2 text-3xl font-bold">{produto.nome}</h1>

            {produto.descricao && (
              <p className="mt-4 text-muted-foreground leading-relaxed">{produto.descricao}</p>
            )}

            <div className="mt-6 rounded-xl border bg-card p-6">
              <p className="text-sm text-muted-foreground">Preço</p>
              <p className="mt-1 text-4xl font-bold text-primary">
                {formatCurrency(produto.preco_venda)}
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  alert("Funcionalidade de compra será integrada em breve!");
                }}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Comprar
              </button>
              <Link
                href={`/loja/${slug}`}
                className="block w-full rounded-xl border py-3 text-center text-sm font-medium hover:bg-muted transition-colors"
              >
                Ver mais produtos
              </Link>
            </div>

            {/* Atributos */}
            {atributos.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold mb-3">Especificações</h3>
                <dl className="divide-y rounded-lg border">
                  {atributos.map(([chave, valor]) => (
                    <div key={chave} className="flex px-4 py-2 text-sm">
                      <dt className="w-1/2 text-muted-foreground capitalize">{chave}</dt>
                      <dd className="w-1/2 font-medium">{String(valor)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {produto.peso_kg && (
              <p className="mt-4 text-sm text-muted-foreground">
                Peso: {produto.peso_kg} kg
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-muted/30 py-6 text-center text-sm text-muted-foreground">
        Você está na loja de <strong>{loja.nome_loja}</strong> · Marketplace CB
      </div>
    </div>
  );
}
