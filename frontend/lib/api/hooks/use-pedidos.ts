"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Pedido } from "@/types/pedido";
import type { PaginatedResponse } from "@/types/api";

export function usePedidosVendedor(token: string | null, page = 1) {
  return useQuery({
    queryKey: ["vendedor-pedidos", page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Pedido>>(ENDPOINTS.VENDEDOR.PEDIDOS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: String(page) },
      }),
    enabled: !!token,
  });
}

export function usePedidosFornecedor(token: string | null, page = 1) {
  return useQuery({
    queryKey: ["fornecedor-pedidos", page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Pedido>>(ENDPOINTS.FORNECEDOR.PEDIDOS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: String(page) },
      }),
    enabled: !!token,
  });
}
