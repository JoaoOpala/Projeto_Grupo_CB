"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Vendedor, Loja } from "@/types/vendedor";
import type { ProdutoLoja } from "@/types/produto";
import type { Pedido } from "@/types/pedido";
import type { PaginatedResponse } from "@/types/api";

export function usePerfilVendedor(token: string | null) {
  return useQuery({
    queryKey: ["vendedor-perfil"],
    queryFn: () =>
      apiClient.get<Vendedor>(ENDPOINTS.VENDEDOR.ME, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
  });
}

export function useLojaVendedor(token: string | null) {
  return useQuery({
    queryKey: ["vendedor-loja"],
    queryFn: () =>
      apiClient.get<Loja>(ENDPOINTS.VENDEDOR.LOJA, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
    retry: false,
  });
}

export function useProdutosLoja(token: string | null, page = 1) {
  return useQuery({
    queryKey: ["vendedor-loja-produtos", page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<ProdutoLoja & { produto_nome?: string; produto_sku?: string }>>(
        ENDPOINTS.VENDEDOR.PRODUTOS_LOJA,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: String(page) },
        }
      ),
    enabled: !!token,
  });
}

export function useAdicionarProdutoLoja(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { produto_id: string; preco_venda: number }) =>
      apiClient.post(ENDPOINTS.VENDEDOR.PRODUTOS_LOJA, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendedor-loja-produtos"] });
    },
  });
}

export function useRemoverProdutoLoja(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (produtoLojaId: string) =>
      apiClient.delete(`${ENDPOINTS.VENDEDOR.PRODUTOS_LOJA}/${produtoLojaId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendedor-loja-produtos"] });
    },
  });
}

export function useUpdateProdutoLoja(token: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { preco_venda?: number; visivel?: boolean; destaque?: boolean };
    }) =>
      apiClient.put(`${ENDPOINTS.VENDEDOR.PRODUTOS_LOJA}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendedor-loja-produtos"] });
    },
  });
}

export function usePedidoVendedor(token: string | null, pedidoId: string) {
  return useQuery({
    queryKey: ["vendedor-pedido", pedidoId],
    queryFn: () =>
      apiClient.get<Pedido>(`${ENDPOINTS.VENDEDOR.PEDIDOS}/${pedidoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token && !!pedidoId,
  });
}
