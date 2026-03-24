"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePedidosFornecedor } from "@/lib/api/hooks/use-pedidos";

export default function RepassesFornecedorPage() {
  const { accessToken } = useAuthStore();
  const { data: pedidos, isLoading } = usePedidosFornecedor(accessToken);

  const totalRepasse = pedidos?.items?.reduce(
    (sum, p) => sum + Number(p.valor_total) - Number(p.valor_comissao_plataforma || 0) - Number(p.valor_comissao_vendedor || 0),
    0
  ) || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Repasses</h1>
      <p className="mt-2 text-muted-foreground">
        Acompanhe os repasses financeiros recebidos
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          <p className="mt-1 text-2xl font-bold">{pedidos?.total ?? "---"}</p>
        </div>
        <div className="rounded-lg border bg-green-50 p-6">
          <p className="text-sm text-green-600">Valor Estimado de Repasses</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            R$ {totalRepasse.toFixed(2)}
          </p>
        </div>
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}

      {pedidos && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Pedido</th>
                <th className="px-4 py-3 text-right font-medium">Valor Total</th>
                <th className="px-4 py-3 text-right font-medium">Comissão Plataforma</th>
                <th className="px-4 py-3 text-right font-medium">Comissão Vendedor</th>
                <th className="px-4 py-3 text-right font-medium">Repasse</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidos.items.map((p) => {
                const repasse =
                  Number(p.valor_total) -
                  Number(p.valor_comissao_plataforma || 0) -
                  Number(p.valor_comissao_vendedor || 0);
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.numero_pedido}</td>
                    <td className="px-4 py-3 text-right">
                      R$ {Number(p.valor_total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      R$ {Number(p.valor_comissao_plataforma || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      R$ {Number(p.valor_comissao_vendedor || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      R$ {repasse.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        {p.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                );
              })}
              {pedidos.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Os valores de repasse são estimativas baseadas nos pedidos. O módulo de pagamentos
        com repasse automático será implementado com a integração do gateway de pagamento.
      </div>
    </div>
  );
}
