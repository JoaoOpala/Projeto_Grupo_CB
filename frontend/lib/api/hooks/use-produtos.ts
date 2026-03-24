"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Produto } from "@/types/produto";
import type { PaginatedResponse } from "@/types/api";

export function useProdutosCatalogo(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["catalogo", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Produto>>(ENDPOINTS.CATALOGO.PRODUTOS, {
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useBuscaProdutos(query: string, page = 1) {
  return useQuery({
    queryKey: ["busca-produtos", query, page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Produto>>(ENDPOINTS.CATALOGO.BUSCA, {
        params: { q: query, page: String(page) },
      }),
    enabled: query.length >= 2,
  });
}

export function useProdutosFornecedor(token: string | null, page = 1) {
  return useQuery({
    queryKey: ["fornecedor-produtos", page],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Produto>>(ENDPOINTS.FORNECEDOR.PRODUTOS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: String(page) },
      }),
    enabled: !!token,
  });
}
