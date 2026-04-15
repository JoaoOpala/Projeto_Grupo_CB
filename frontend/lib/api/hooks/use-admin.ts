"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { Vendedor } from "@/types/vendedor";
import type { Fornecedor } from "@/types/fornecedor";
import type { Produto } from "@/types/produto";
import type { Pedido } from "@/types/pedido";
import type { Cliente } from "@/types/cliente";
import type { PaginatedResponse } from "@/types/api";

interface LojaAdmin {
  id: string;
  nome_loja: string;
  slug: string;
  descricao?: string;
  logo_url?: string;
  ativa: boolean;
  verificado: boolean;
}

function useAdminHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

export function useAdminVendedores(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-vendedores", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Vendedor>>(ENDPOINTS.ADMIN.VENDEDORES, {
        headers,
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useAdminVendedor(id: string) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-vendedor", id],
    queryFn: () =>
      apiClient.get<Vendedor>(`${ENDPOINTS.ADMIN.VENDEDORES}/${id}`, { headers }),
    enabled: !!id,
  });
}

export function useAdminFornecedores(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-fornecedores", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Fornecedor>>(ENDPOINTS.ADMIN.FORNECEDORES, {
        headers,
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useAdminFornecedoresPendentes(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-fornecedores-pendentes", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Fornecedor>>(
        `${ENDPOINTS.ADMIN.FORNECEDORES}/pendentes`,
        { headers, params: { page: String(page), page_size: String(pageSize) } }
      ),
  });
}

export function useAdminFornecedor(id: string) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-fornecedor", id],
    queryFn: () =>
      apiClient.get<Fornecedor>(`${ENDPOINTS.ADMIN.FORNECEDORES}/${id}`, { headers }),
    enabled: !!id,
  });
}

export function useAprovarFornecedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.FORNECEDORES}/${id}/aprovar`, undefined, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores-pendentes"] });
    },
  });
}

export function useRejeitarFornecedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.FORNECEDORES}/${id}/rejeitar`, undefined, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores"] });
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores-pendentes"] });
    },
  });
}

export function useAdminProdutos(page = 1, pageSize = 20, status?: string) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-produtos", page, pageSize, status],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Produto>>(ENDPOINTS.ADMIN.PRODUTOS, {
        headers,
        params: {
          page: String(page),
          page_size: String(pageSize),
          ...(status ? { status } : {}),
        },
      }),
  });
}

export function useAdminProdutosModeracao(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-produtos-moderacao", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Produto>>(
        `${ENDPOINTS.ADMIN.PRODUTOS}/moderacao`,
        { headers, params: { page: String(page), page_size: String(pageSize) } }
      ),
  });
}

export function useAprovarProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.PRODUTOS}/${id}/aprovar`, undefined, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-produtos-moderacao"] });
    },
  });
}

export function useRejeitarProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.PRODUTOS}/${id}/rejeitar`, undefined, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
      queryClient.invalidateQueries({ queryKey: ["admin-produtos-moderacao"] });
    },
  });
}

export function useAdminPedidos(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-pedidos", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Pedido>>(ENDPOINTS.ADMIN.PEDIDOS, {
        headers,
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useCriarVendedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      nome: string;
      email: string;
      cpf_cnpj: string;
      tipo_pessoa: string;
      senha: string;
      telefone?: string;
    }) =>
      apiClient.post<Vendedor>(ENDPOINTS.ADMIN.VENDEDORES, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendedores"] });
    },
  });
}

export function useExcluirVendedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`${ENDPOINTS.ADMIN.VENDEDORES}/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendedores"] });
    },
  });
}

export function useCriarFornecedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      razao_social: string;
      cnpj: string;
      email: string;
      tipo: string;
      senha: string;
      nome_fantasia?: string;
      telefone?: string;
    }) =>
      apiClient.post<Fornecedor>(ENDPOINTS.ADMIN.FORNECEDORES, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores"] });
    },
  });
}

export function useExcluirFornecedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`${ENDPOINTS.ADMIN.FORNECEDORES}/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fornecedores"] });
    },
  });
}

export function useUpdateStatusVendedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(
        `${ENDPOINTS.ADMIN.VENDEDORES}/${id}/status`,
        undefined,
        { headers, params: { novo_status: status } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendedores"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendedor"] });
    },
  });
}

export function useUpdateStatusProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(
        `${ENDPOINTS.ADMIN.PRODUTOS}/${id}/status`,
        undefined,
        { headers, params: { novo_status: status } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
    },
  });
}

export function useExcluirProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`${ENDPOINTS.ADMIN.PRODUTOS}/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
    },
  });
}

export function useAdminClientes(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-clientes", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Cliente>>(ENDPOINTS.ADMIN.CLIENTES, {
        headers,
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useUpdateStatusCliente() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put(
        `${ENDPOINTS.ADMIN.CLIENTES}/${id}/status`,
        undefined,
        { headers, params: { novo_status: status } }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clientes"] });
    },
  });
}

export function useAdminLojas(page = 1, pageSize = 20) {
  const headers = useAdminHeaders();
  return useQuery({
    queryKey: ["admin-lojas", page, pageSize],
    queryFn: () =>
      apiClient.get<PaginatedResponse<LojaAdmin>>(ENDPOINTS.ADMIN.LOJAS, {
        headers,
        params: { page: String(page), page_size: String(pageSize) },
      }),
  });
}

export function useVerificarLoja() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.LOJAS}/${id}/verificar`, undefined, { headers }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lojas"] }),
  });
}

export function useDesverificarLoja() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.put(`${ENDPOINTS.ADMIN.LOJAS}/${id}/desverificar`, undefined, { headers }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-lojas"] }),
  });
}

export function useExcluirCliente() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`${ENDPOINTS.ADMIN.CLIENTES}/${id}`, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clientes"] });
    },
  });
}

export function useAdminCriarProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      fornecedor_id: string;
      sku: string;
      ean: string;
      nome: string;
      marca: string;
      modelo: string;
      descricao?: string;
      preco_base: number;
      preco_venda?: number;
      estoque_disponivel?: number;
      imagens?: string[];
      videos?: string[];
      comprimento_cm: number;
      largura_cm: number;
      altura_cm: number;
      peso_kg: number;
      local_origem?: string;
    }) => apiClient.post<Produto>(ENDPOINTS.ADMIN.PRODUTOS, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
    },
  });
}

export function useAdminUpdateProduto() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { preco_venda?: number; local_origem?: string; status?: string };
    }) =>
      apiClient.put<Produto>(`${ENDPOINTS.ADMIN.PRODUTOS}/${id}/admin`, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-produtos"] });
    },
  });
}

export function useAdminAtualizarStatusPedido() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status: string; codigo_rastreio?: string; observacoes?: string };
    }) =>
      apiClient.put(`${ENDPOINTS.ADMIN.PEDIDOS}/${id}/status`, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
    },
  });
}

export function useAdminPagarFornecedor() {
  const headers = useAdminHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, valor_pago }: { id: string; valor_pago: number }) =>
      apiClient.put(`${ENDPOINTS.ADMIN.PEDIDOS}/${id}/pagar-fornecedor`, { valor_pago }, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pedidos"] });
    },
  });
}
