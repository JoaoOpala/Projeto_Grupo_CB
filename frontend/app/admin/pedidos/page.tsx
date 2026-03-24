"use client";

import { useState } from "react";
import { useAdminPedidos } from "@/lib/api/hooks/use-admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  PREPARANDO: "bg-purple-100 text-purple-800",
  ENVIADO: "bg-indigo-100 text-indigo-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
  DEVOLVIDO: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pgto",
  PAGO: "Pago",
  PREPARANDO: "Preparando",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
  DEVOLVIDO: "Devolvido",
};

export default function PedidosAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminPedidos(page);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
      <p className="mt-2 text-muted-foreground">
        Todos os pedidos da plataforma
      </p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar pedidos.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nº Pedido</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-left font-medium">Itens</th>
                  <th className="px-4 py-3 text-left font-medium">Valor Total</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Rastreio</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      {p.numero_pedido}
                    </td>
                    <td className="px-4 py-3">
                      <div>{p.cliente_nome}</div>
                      <div className="text-xs text-muted-foreground">{p.cliente_email}</div>
                    </td>
                    <td className="px-4 py-3">{p.itens.length}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(p.valor_total)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[p.status] || ""}`}>
                        {statusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.codigo_rastreio || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{formatDateTime(p.created_at)}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} pedidos)
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
