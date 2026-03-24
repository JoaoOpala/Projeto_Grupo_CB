"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useCartStore } from "@/stores/cart-store";
import type { Produto } from "@/types/produto";

interface LojaVendedora {
  loja_id: string;
  loja_nome: string;
  loja_slug: string;
  preco_venda: number;
  destaque: boolean;
}

export default function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [quantidade, setQuantidade] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedLoja, setSelectedLoja] = useState<LojaVendedora | null>(null);

  const { data: produto, isLoading, error } = useQuery({
    queryKey: ["catalogo-produto", id],
    queryFn: () => apiClient.get<Produto>(`/produtos/${id}`),
    enabled: !!id,
  });

  const { data: lojas } = useQuery({
    queryKey: ["produto-lojas", id],
    queryFn: () => apiClient.get<LojaVendedora[]>(`/produtos/${id}/lojas`),
    enabled: !!id,
  });

  // Auto-select the first loja when data loads
  const lojasDisponiveis = lojas ?? [];
  const lojaAtual = selectedLoja ?? lojasDisponiveis[0] ?? null;

  if (isLoading) return <div className="mx-auto max-w-4xl px-6 py-8 text-muted-foreground">Carregando...</div>;
  if (error || !produto) return <div className="mx-auto max-w-4xl px-6 py-8 text-red-500">Produto não encontrado.</div>;

  const precoExibido = lojaAtual ? lojaAtual.preco_venda : Number(produto.preco_venda_sugerido);

  const handleAddToCart = () => {
    if (!lojaAtual) return;
    addItem(
      {
        produto_id: produto.id,
        loja_id: lojaAtual.loja_id,
        nome: produto.nome,
        sku: produto.sku,
        preco_unitario: precoExibido,
      },
      quantidade
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar ao catálogo
      </button>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Imagem placeholder */}
        <div className="flex h-64 items-center justify-center rounded-lg border bg-muted/30 md:h-80">
          <span className="text-4xl text-muted-foreground/30">
            {produto.nome.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div>
          <p className="font-mono text-xs text-muted-foreground">SKU: {produto.sku}</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{produto.nome}</h1>

          <div className="mt-4">
            <span className="text-3xl font-bold">
              R$ {precoExibido.toFixed(2)}
            </span>
            {Number(produto.preco_base) < precoExibido && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                R$ {Number(produto.preco_base).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                produto.estoque_disponivel > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {produto.estoque_disponivel > 0
                ? `${produto.estoque_disponivel} em estoque`
                : "Indisponível"}
            </span>
          </div>

          {/* Seleção de loja vendedora */}
          {lojasDisponiveis.length > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Vendido por:</label>
              <div className="space-y-2">
                {lojasDisponiveis.map((l) => (
                  <button
                    key={l.loja_id}
                    onClick={() => setSelectedLoja(l)}
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors ${
                      lojaAtual?.loja_id === l.loja_id
                        ? "border-primary bg-primary/5 font-medium"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <span>{l.loja_nome}</span>
                    <span className="font-semibold">R$ {l.preco_venda.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {lojasDisponiveis.length === 1 && (
            <p className="mt-3 text-sm text-muted-foreground">
              Vendido por <span className="font-medium text-foreground">{lojasDisponiveis[0].loja_nome}</span>
            </p>
          )}

          {lojasDisponiveis.length === 0 && produto.estoque_disponivel > 0 && (
            <p className="mt-3 text-sm text-amber-600">
              Nenhuma loja está vendendo este produto no momento.
            </p>
          )}

          {produto.estoque_disponivel > 0 && lojaAtual && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Quantidade:</label>
                <div className="flex items-center rounded-md border">
                  <button
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-muted"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-medium">{quantidade}</span>
                  <button
                    onClick={() =>
                      setQuantidade((q) =>
                        Math.min(produto.estoque_disponivel, q + 1)
                      )
                    }
                    className="px-3 py-1 hover:bg-muted"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                {added ? "Adicionado ao carrinho!" : "Adicionar ao Carrinho"}
              </button>
            </div>
          )}

          {produto.peso_kg && (
            <p className="mt-4 text-xs text-muted-foreground">
              Peso: {produto.peso_kg} kg
            </p>
          )}
        </div>
      </div>

      {/* Descrição */}
      {produto.descricao && (
        <div className="mt-8 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Descrição</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {produto.descricao}
          </p>
        </div>
      )}
    </div>
  );
}
