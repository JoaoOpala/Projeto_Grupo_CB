"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAdminFornecedoresPendentes,
  useAprovarFornecedor,
  useRejeitarFornecedor,
} from "@/lib/api/hooks/use-admin";
import { formatDate, formatCpfCnpj } from "@/lib/utils/format";

export default function AprovarFornecedorPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminFornecedoresPendentes(page);
  const aprovar = useAprovarFornecedor();
  const rejeitar = useRejeitarFornecedor();

  const handleAprovar = async (id: string) => {
    if (!confirm("Confirmar aprovação?")) return;
    await aprovar.mutateAsync(id);
  };

  const handleRejeitar = async (id: string) => {
    if (!confirm("Confirmar rejeição?")) return;
    await rejeitar.mutateAsync(id);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Aprovar Fornecedores</h1>
      <p className="mt-2 text-muted-foreground">
        Fornecedores pendentes de aprovação
      </p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar fornecedores pendentes.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome Fantasia</th>
                  <th className="px-4 py-3 text-left font-medium">Razão Social</th>
                  <th className="px-4 py-3 text-left font-medium">CNPJ</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{f.nome_fantasia || "—"}</td>
                    <td className="px-4 py-3">{f.razao_social}</td>
                    <td className="px-4 py-3">{formatCpfCnpj(f.cnpj)}</td>
                    <td className="px-4 py-3">{f.tipo}</td>
                    <td className="px-4 py-3">{formatDate(f.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAprovar(f.id)}
                          disabled={aprovar.isPending}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleRejeitar(f.id)}
                          disabled={rejeitar.isPending}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Rejeitar
                        </button>
                        <Link
                          href={`/admin/fornecedores/${f.id}`}
                          className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                        >
                          Detalhes
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum fornecedor pendente de aprovação
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} pendentes)
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
