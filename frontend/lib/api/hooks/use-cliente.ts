"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { Cliente } from "@/types/cliente";

function useClienteHeaders() {
  const { accessToken } = useAuthStore();
  return { Authorization: `Bearer ${accessToken}` };
}

export function useClienteMe() {
  const headers = useClienteHeaders();
  return useQuery({
    queryKey: ["cliente-me"],
    queryFn: () => apiClient.get<Cliente>(ENDPOINTS.CLIENTE.ME, { headers }),
  });
}

export function useAtualizarPerfil() {
  const headers = useClienteHeaders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { nome?: string; telefone?: string; endereco?: string }) =>
      apiClient.put<Cliente>(ENDPOINTS.CLIENTE.ME, data, { headers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cliente-me"] });
    },
  });
}

export function useRegistroCliente() {
  return useMutation({
    mutationFn: (data: {
      nome: string;
      email: string;
      senha: string;
      cpf?: string;
      telefone?: string;
      endereco?: string;
    }) => apiClient.post<Cliente>(ENDPOINTS.CLIENTE.REGISTRO, data),
  });
}
