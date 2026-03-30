"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { usePerfilVendedor, useLojaVendedor } from "@/lib/api/hooks/use-vendedor";

export default function VendedorDashboardPage() {
  const { accessToken } = useAuthStore();
  const { data: perfil } = usePerfilVendedor(accessToken);
  const { data: loja } = useLojaVendedor(accessToken);
  const [copiado, setCopiado] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const linkLoja = loja ? `${baseUrl}/loja/${loja.slug}` : null;

  const copiarLink = () => {
    if (!linkLoja) return;
    navigator.clipboard.writeText(linkLoja).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral da sua loja e vendas
      </p>

      {/* Cards de status */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Status da Conta</p>
          <p className={`mt-1 text-2xl font-bold ${
            perfil?.status === "ATIVO" ? "text-green-600" : "text-yellow-600"
          }`}>
            {perfil?.status || "---"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Comissão Padrão</p>
          <p className="mt-1 text-2xl font-bold">
            {perfil ? `${(Number(perfil.comissao_padrao) * 100).toFixed(0)}%` : "---"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Nome da Loja</p>
          <p className="mt-1 text-2xl font-bold">
            {loja?.nome_loja || "Não criada"}
          </p>
        </div>
      </div>

      {/* Link exclusivo da loja */}
      {loja ? (
        <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-primary">
                🔗 Link Exclusivo da Sua Loja
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Compartilhe este link com seus clientes. Somente quem tiver este link
                poderá acessar sua loja e ver seus produtos.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm font-mono break-all">
                  {linkLoja}
                </code>
                <button
                  onClick={copiarLink}
                  className={`flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    copiado
                      ? "bg-green-600 text-white"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {copiado ? "✓ Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
            <Link
              href={`/loja/${loja.slug}`}
              target="_blank"
              className="flex-shrink-0 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Visualizar →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
            <div className="rounded-lg bg-background border p-3">
              <p className="text-muted-foreground">Slug da loja</p>
              <p className="font-mono font-medium">{loja.slug}</p>
            </div>
            <div className="rounded-lg bg-background border p-3">
              <p className="text-muted-foreground">Status da loja</p>
              <p className={`font-medium ${loja.ativa ? "text-green-600" : "text-red-600"}`}>
                {loja.ativa ? "Ativa" : "Inativa"}
              </p>
            </div>
            <div className="rounded-lg bg-background border p-3">
              <p className="text-muted-foreground">Personalização</p>
              <Link
                href="/vendedor/loja/configuracoes"
                className="font-medium text-primary hover:underline"
              >
                Editar loja →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-6">
          <h2 className="font-semibold text-yellow-900">Crie sua loja para começar a vender</h2>
          <p className="mt-1 text-sm text-yellow-800">
            Após criar sua loja, você receberá um link exclusivo para compartilhar com seus clientes.
          </p>
          <Link
            href="/vendedor/loja/configuracoes"
            className="mt-3 inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
          >
            Criar Minha Loja
          </Link>
        </div>
      )}

      {/* Ações rápidas */}
      <div className="mt-6">
        <h2 className="font-semibold text-muted-foreground text-sm uppercase tracking-wide">
          Ações Rápidas
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/vendedor/loja/produtos/adicionar"
            className="rounded-lg border bg-card p-4 text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            + Adicionar Produto
          </Link>
          <Link
            href="/vendedor/loja/produtos"
            className="rounded-lg border bg-card p-4 text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            Ver Produtos
          </Link>
          <Link
            href="/vendedor/pedidos"
            className="rounded-lg border bg-card p-4 text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            Pedidos
          </Link>
          <Link
            href="/vendedor/loja/configuracoes"
            className="rounded-lg border bg-card p-4 text-center text-sm font-medium hover:bg-muted transition-colors"
          >
            Configurações
          </Link>
        </div>
      </div>
    </div>
  );
}
