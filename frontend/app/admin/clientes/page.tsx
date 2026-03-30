"use client";

import { useState } from "react";
import {
  useAdminClientes,
  useUpdateStatusCliente,
  useExcluirCliente,
} from "@/lib/api/hooks/use-admin";
import { formatDate } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  INATIVO: "bg-gray-100 text-gray-800",
  SUSPENSO: "bg-red-100 text-red-800",
};

export default function ClientesAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminClientes(page);
  const updateStatus = useUpdateStatusCliente();
  const excluir = useExcluirCliente();

  const handleStatusChange = async (id: string, status: string) => {
    if (!confirm(`Alterar status para ${status}?`)) return;
    await updateStatus.mutateAsync({ id, status });
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir cliente "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await excluir.mutateAsync(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-2 text-muted-foreground">
            Todos os clientes cadastrados na plataforma
          </p>
        </div>
        {data && (
          <div className="rounded-lg border px-4 py-2 text-sm">
            <span className="font-semibold">{data.total}</span> cliente(s) cadastrado(s)
          </div>
        )}
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar clientes.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">CPF</th>
                  <th className="px-4 py-3 text-left font-medium">Telefone</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="px-4 py-3">{c.email}</td>
                    <td className="px-4 py-3 font-mono text-xs">{c.cpf ?? "-"}</td>
                    <td className="px-4 py-3">{c.telefone ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          statusColors[c.status] ?? ""
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {c.status !== "ATIVO" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "ATIVO")}
                            disabled={updateStatus.isPending}
                            className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            Ativar
                          </button>
                        )}
                        {c.status !== "SUSPENSO" && (
                          <button
                            onClick={() => handleStatusChange(c.id, "SUSPENSO")}
                            disabled={updateStatus.isPending}
                            className="rounded bg-yellow-600 px-2 py-1 text-xs text-white hover:bg-yellow-700 disabled:opacity-50"
                          >
                            Suspender
                          </button>
                        )}
                        <button
                          onClick={() => handleExcluir(c.id, c.nome)}
                          disabled={excluir.isPending}
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum cliente cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} clientes)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
