"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface LojaVerificada {
  id: string;
  nome_loja: string;
  slug: string;
  descricao?: string;
  logo_url?: string;
}

export default function HomePage() {
  const { data: influences, isLoading } = useQuery({
    queryKey: ["influences-verificados"],
    queryFn: () => apiClient.get<LojaVerificada[]>(ENDPOINTS.LOJAS.LIST),
  });

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/10 to-background px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight">Marketplace CB</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Plataforma B2B2C de dropshipping. Conectamos fornecedores e vendedores
          para que você venda sem estoque, com produtos de qualidade e entrega direta.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/registro/vendedor"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Quero Vender
          </Link>
          <Link
            href="/registro/cliente"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Criar Conta
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-6 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">Como Funciona</h2>
        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              1
            </div>
            <h3 className="mt-4 text-lg font-semibold">Encontre um vendedor</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Acesse a loja de um vendedor verificado pelo link exclusivo que ele compartilhou com você.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              2
            </div>
            <h3 className="mt-4 text-lg font-semibold">Escolha seus produtos</h3>
            <p className="mt-2 text-muted-foreground text-sm">
              Cada vendedor cuida do seu catálogo. Você compra com exclusividade, sem concorrência de preço.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              3
            </div>
            <h3 className="mt-4 text-lg font-semibold">Receba em casa</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              O pedido é processado e enviado diretamente pelo fornecedor, sem intermediários.
            </p>
          </div>
        </div>
      </section>

      {/* Influences Verificados */}
      <section className="bg-muted/30 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-semibold text-yellow-800 mb-3">
              ✓ Verificados pela plataforma
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Influences Verificados</h2>
            <p className="mt-3 text-muted-foreground">
              Esses vendedores foram verificados pelo Marketplace CB.
              Acesse a loja de cada um pelo link exclusivo.
            </p>
          </div>

          {isLoading && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}

          {influences && influences.length > 0 && (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {influences.map((loja) => (
                <Link
                  key={loja.id}
                  href={`/loja/${loja.slug}`}
                  className="group rounded-xl border bg-card p-6 text-center hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  {/* Avatar */}
                  <div className="mx-auto mb-4">
                    {loja.logo_url ? (
                      <img
                        src={loja.logo_url}
                        alt={loja.nome_loja}
                        className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                        {loja.nome_loja.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Badge verificado */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                    ✓ Verificado
                  </span>

                  <h3 className="mt-2 font-semibold group-hover:text-primary transition-colors">
                    {loja.nome_loja}
                  </h3>

                  {loja.descricao && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {loja.descricao}
                    </p>
                  )}

                  <div className="mt-4 rounded-lg bg-primary/5 py-2 text-xs font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Visitar loja →
                  </div>
                </Link>
              ))}
            </div>
          )}

          {influences && influences.length === 0 && (
            <div className="mt-10 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              <p className="text-lg">Nenhum influence verificado ainda.</p>
              <p className="mt-2 text-sm">
                Seja um dos primeiros vendedores verificados da plataforma.
              </p>
              <Link
                href="/registro/vendedor"
                className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Quero ser um vendedor
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Comece a Vender Agora</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Crie sua loja exclusiva, compartilhe seu link e venda sem estoque.
          Cadastre-se gratuitamente como vendedor ou fornecedor.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
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
          <Link
            href="/registro/cliente"
            className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
          >
            Criar Conta de Cliente
          </Link>
        </div>
      </section>
    </main>
  );
}
