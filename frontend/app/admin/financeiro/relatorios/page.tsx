"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";

interface DashboardData {
  total_vendedores: number;
  total_fornecedores: number;
  total_produtos_ativos: number;
  total_pedidos: number;
  fornecedores_pendentes: number;
  produtos_em_moderacao: number;
}

export default function RelatoriosAdminPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.get<DashboardData>(ENDPOINTS.ADMIN.DASHBOARD, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setData(result);
      } catch {
        // silently fail
      }
    };
    fetchData();
  }, [accessToken]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
      <p className="mt-2 text-muted-foreground">
        Relatórios financeiros e operacionais
      </p>

      {data && (
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Resumo da Plataforma</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded-md bg-blue-50 p-4">
                <p className="text-sm text-blue-600">Total Vendedores</p>
                <p className="mt-1 text-2xl font-bold text-blue-900">{data.total_vendedores}</p>
              </div>
              <div className="rounded-md bg-purple-50 p-4">
                <p className="text-sm text-purple-600">Total Fornecedores</p>
                <p className="mt-1 text-2xl font-bold text-purple-900">{data.total_fornecedores}</p>
              </div>
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-600">Produtos Ativos</p>
                <p className="mt-1 text-2xl font-bold text-green-900">{data.total_produtos_ativos}</p>
              </div>
              <div className="rounded-md bg-indigo-50 p-4">
                <p className="text-sm text-indigo-600">Total Pedidos</p>
                <p className="mt-1 text-2xl font-bold text-indigo-900">{data.total_pedidos}</p>
              </div>
              <div className="rounded-md bg-yellow-50 p-4">
                <p className="text-sm text-yellow-600">Fornecedores Pendentes</p>
                <p className="mt-1 text-2xl font-bold text-yellow-900">{data.fornecedores_pendentes}</p>
              </div>
              <div className="rounded-md bg-orange-50 p-4">
                <p className="text-sm text-orange-600">Produtos em Moderação</p>
                <p className="mt-1 text-2xl font-bold text-orange-900">{data.produtos_em_moderacao}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            Relatórios detalhados (faturamento, vendas por período, ranking de vendedores)
            serão implementados quando o sistema de pagamentos estiver integrado.
          </div>
        </div>
      )}
    </div>
  );
}
