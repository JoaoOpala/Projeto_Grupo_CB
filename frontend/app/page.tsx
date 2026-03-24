"use client";

import Link from "next/link";
import { useProdutosCatalogo } from "@/lib/api/hooks/use-produtos";

export default function HomePage() {
  const { data, isLoading } = useProdutosCatalogo(1, 6);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Marketplace CB</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Plataforma B2B2C de dropshipping. Conectamos fornecedores e vendedores
          para que você venda sem estoque, com produtos de qualidade e entrega
          direta.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/catalogo"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Ver Catálogo
          </Link>
          <Link
            href="/registro/vendedor"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Quero Vender
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Como Funciona
        </h2>
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              1
            </div>
            <h3 className="mt-4 text-lg font-semibold">Fornecedores cadastram produtos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Indústrias e distribuidores registram seus produtos com preços e estoque.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              2
            </div>
            <h3 className="mt-4 text-lg font-semibold">Vendedores escolhem e vendem</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Vendedores adicionam produtos à sua loja, definem preços e ganham comissão.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              3
            </div>
            <h3 className="mt-4 text-lg font-semibold">Cliente compra, fornecedor envia</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O cliente faz o pedido e o fornecedor cuida do envio direto (dropshipping).
            </p>
          </div>
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="bg-muted/30 px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Produtos em Destaque
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          Confira alguns dos produtos disponíveis no catálogo
        </p>

        {isLoading && (
          <p className="mt-8 text-center text-muted-foreground">Carregando...</p>
        )}

        {data && data.items.length > 0 && (
          <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    R$ {Number(p.preco_venda_sugerido).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.estoque_disponivel > 0 ? "Em estoque" : "Indisponível"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/catalogo"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Ver todos os produtos
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Comece a Vender Agora
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Cadastre-se gratuitamente como vendedor ou fornecedor e faça parte do
          Marketplace CB.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/registro/vendedor"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Cadastrar como Vendedor
          </Link>
          <Link
            href="/registro/fornecedor"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Cadastrar como Fornecedor
          </Link>
        </div>
      </section>
    </main>
  );
}
