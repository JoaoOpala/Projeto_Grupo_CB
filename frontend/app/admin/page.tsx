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

export default function AdminDashboardPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await apiClient.get<DashboardData>(
          ENDPOINTS.ADMIN.DASHBOARD,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setData(result);
      } catch {
        // silently fail
      }
    };
    fetchDashboard();
  }, [accessToken]);

  const cards = data
    ? [
        { label: "Vendedores", value: data.total_vendedores },
        { label: "Fornecedores", value: data.total_fornecedores },
        { label: "Produtos Ativos", value: data.total_produtos_ativos },
        { label: "Pedidos", value: data.total_pedidos },
        {
          label: "Fornecedores Pendentes",
          value: data.fornecedores_pendentes,
          highlight: data.fornecedores_pendentes > 0,
        },
        {
          label: "Produtos em Moderação",
          value: data.produtos_em_moderacao,
          highlight: data.produtos_em_moderacao > 0,
        },
      ]
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Dashboard Administrativo
      </h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral da plataforma Marketplace CB
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border p-6 ${
              card.highlight
                ? "border-yellow-300 bg-yellow-50"
                : "bg-card"
            }`}
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
