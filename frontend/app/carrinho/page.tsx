"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";

export default function CarrinhoPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Carrinho de Compras</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Seu carrinho está vazio</p>
          <Link
            href="/catalogo"
            className="mt-4 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Ir para o catálogo
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.produto_id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.nome}</h3>
                  <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                  <p className="mt-1 text-sm">
                    R$ {item.preco_unitario.toFixed(2)} / unidade
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center rounded-md border">
                    <button
                      onClick={() =>
                        updateQuantity(item.produto_id, item.quantidade - 1)
                      }
                      className="px-3 py-1 hover:bg-muted"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium">
                      {item.quantidade}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.produto_id, item.quantidade + 1)
                      }
                      className="px-3 py-1 hover:bg-muted"
                    >
                      +
                    </button>
                  </div>

                  <span className="w-24 text-right font-semibold">
                    R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
                  </span>

                  <button
                    onClick={() => removeItem(item.produto_id)}
                    className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold">
                R$ {totalPrice().toFixed(2)}
              </span>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={clearCart}
                className="rounded-md border px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Limpar Carrinho
              </button>
              <Link
                href="/checkout"
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Finalizar Compra
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
