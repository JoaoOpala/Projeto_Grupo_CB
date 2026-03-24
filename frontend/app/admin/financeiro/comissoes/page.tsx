"use client";

import { useAdminVendedores } from "@/lib/api/hooks/use-admin";

export default function ComissoesAdminPage() {
  const { data, isLoading } = useAdminVendedores(1, 100);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
      <p className="mt-2 text-muted-foreground">
        Visão geral das comissões dos vendedores
      </p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}

      {data && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Vendedor</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Comissão Padrão</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.items.map((v) => (
                <tr key={v.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{v.nome}</td>
                  <td className="px-4 py-3">{v.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                      v.status === "ATIVO" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {(v.comissao_padrao * 100).toFixed(0)}%
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum vendedor cadastrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        O cálculo automático de comissões por pedido ainda não está implementado no backend.
        Atualmente exibe apenas a comissão padrão configurada para cada vendedor.
      </div>
    </div>
  );
}
