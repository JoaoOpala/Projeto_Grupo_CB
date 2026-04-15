"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Fornecedor } from "@/types/fornecedor";
import type { Produto } from "@/types/produto";
import type { Pedido } from "@/types/pedido";

export function usePerfilFornecedor(token: string | null) {
  return useQuery({
    queryKey: ["fornecedor-perfil"],
    queryFn: () =>
      apiClient.get<Fornecedor>(ENDPOINTS.FORNECEDOR.ME, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
  });
}

export function useProdutoFornecedor(token: string | null, produtoId: string) {
  return useQuery({
    queryKey: ["fornecedor-produto", produtoId],
    queryFn: () =>
      apiClient.get<Produto>(`${ENDPOINTS.FORNECEDOR.PRODUTOS}/${produtoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token && !!produtoId,
  });
}

export function useUpdateProdutoFornecedor(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        nome?: string;
        marca?: string;
        modelo?: string;
        descricao?: string;
        preco_base?: number;
        imagens?: string[];
        videos?: string[];
        comprimento_cm?: number;
        largura_cm?: number;
        altura_cm?: number;
        peso_kg?: number;
        local_origem?: string;
      };
    }) =>
      apiClient.put<Produto>(`${ENDPOINTS.FORNECEDOR.PRODUTOS}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedor-produtos"] });
      queryClient.invalidateQueries({ queryKey: ["fornecedor-produto"] });
    },
  });
}

export function usePedidoFornecedor(token: string | null, pedidoId: string) {
  return useQuery({
    queryKey: ["fornecedor-pedido", pedidoId],
    queryFn: () =>
      apiClient.get<Pedido>(`${ENDPOINTS.FORNECEDOR.PEDIDOS}/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token && !!pedidoId,
  });
}

export function useUpdateStatusPedido(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pedidoId,
      data,
    }: {
      pedidoId: string;
      data: { status: string; codigo_rastreio?: string; observacoes?: string };
    }) =>
      apiClient.put(
        `${ENDPOINTS.FORNECEDOR.PEDIDOS}/${pedidoId}/status`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedor-pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["fornecedor-pedido"] });
    },
  });
}
