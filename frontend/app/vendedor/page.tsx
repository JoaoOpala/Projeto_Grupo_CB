"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePerfilVendedor, useLojaVendedor } from "@/lib/api/hooks/use-vendedor";

export default function VendedorDashboardPage() {
  const { accessToken } = useAuthStore();
  const { data: perfil } = usePerfilVendedor(accessToken);
  const { data: loja } = useLojaVendedor(accessToken);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral da sua loja e vendas
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-bold">
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
          <p className="text-sm text-muted-foreground">Loja</p>
          <p className="mt-1 text-2xl font-bold">
            {loja?.nome_loja || "Não criada"}
          </p>
        </div>
      </div>

      {!loja && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Você ainda não criou sua loja. Acesse{" "}
            <a href="/vendedor/loja/configuracoes" className="font-medium underline">
              Configurações da Loja
            </a>{" "}
            para começar.
          </p>
        </div>
      )}
    </div>
  );
}
