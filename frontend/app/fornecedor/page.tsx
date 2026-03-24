"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePerfilFornecedor } from "@/lib/api/hooks/use-fornecedor";
import { useProdutosFornecedor } from "@/lib/api/hooks/use-produtos";

export default function FornecedorDashboardPage() {
  const { accessToken } = useAuthStore();
  const { data: perfil } = usePerfilFornecedor(accessToken);
  const { data: produtos } = useProdutosFornecedor(accessToken);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral dos seus produtos, estoque e pedidos
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-bold">{perfil?.status || "---"}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Tipo</p>
          <p className="mt-1 text-2xl font-bold">{perfil?.tipo || "---"}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total Produtos</p>
          <p className="mt-1 text-2xl font-bold">{produtos?.total ?? "---"}</p>
        </div>
      </div>

      {perfil?.status === "PENDENTE" && (
        <div className="mt-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            Seu cadastro está pendente de aprovação pelo administrador.
            Você poderá cadastrar produtos após a aprovação.
          </p>
        </div>
      )}
    </div>
  );
}
