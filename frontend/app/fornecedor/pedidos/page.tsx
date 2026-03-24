"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { usePedidosFornecedor } from "@/lib/api/hooks/use-pedidos";

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  PREPARANDO: "bg-indigo-100 text-indigo-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
  DEVOLVIDO: "bg-gray-100 text-gray-800",
};

export default function PedidosFornecedorPage() {
  const { accessToken } = useAuthStore();
  const { data, isLoading } = usePedidosFornecedor(accessToken);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
      <p className="mt-2 text-muted-foreground">
        Pedidos recebidos para processamento e envio
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Pedido</th>
              <th className="px-4 py-3 text-left font-medium">Cliente</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Data</th>
              <th className="px-4 py-3 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : !data?.items?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum pedido encontrado
                </td>
              </tr>
            ) : (
              data.items.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.numero_pedido}</td>
                  <td className="px-4 py-3">{p.cliente_nome}</td>
                  <td className="px-4 py-3 text-right">
                    R$ {Number(p.valor_total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[p.status] || "bg-gray-100"
                      }`}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/fornecedor/pedidos/${p.id}`}
                      className="text-primary hover:underline"
                    >
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
