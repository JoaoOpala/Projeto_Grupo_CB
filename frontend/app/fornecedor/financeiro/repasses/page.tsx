"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePedidosFornecedor } from "@/lib/api/hooks/use-pedidos";

const statusLabels: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando Pgto",
  PAGO: "Pago",
  NOTA_FISCAL_EMITIDA: "NF Emitida",
  ETIQUETA_GERADA: "Etiqueta Gerada",
  DESPACHADO: "Despachado",
  EM_ENTREGA: "Em Entrega",
  ENTREGUE: "Entregue",
  EM_DEVOLUCAO: "Em Devolução",
  CANCELADO: "Cancelado",
};

export default function RepassesFornecedorPage() {
  const { accessToken } = useAuthStore();
  const { data: pedidos, isLoading } = usePedidosFornecedor(accessToken);

  const totalVendas = pedidos?.items?.reduce(
    (sum, p) => sum + (Number(p.valor_base_fornecedor) || Number(p.valor_produtos) || 0),
    0
  ) || 0;

  const totalPago = pedidos?.items?.reduce(
    (sum, p) => sum + Number(p.valor_pago_fornecedor || 0),
    0
  ) || 0;

  const totalAReceber = totalVendas - totalPago;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Repasses</h1>
      <p className="mt-2 text-muted-foreground">
        Acompanhe suas vendas e os repasses financeiros recebidos
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          <p className="mt-1 text-2xl font-bold">{pedidos?.total ?? "---"}</p>
        </div>
        <div className="rounded-lg border bg-blue-50 p-6">
          <p className="text-sm text-blue-600">Total de Vendas (preço base)</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            R$ {totalVendas.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-green-50 p-6">
          <p className="text-sm text-green-600">Total Já Pago</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            R$ {totalPago.toFixed(2)}
          </p>
        </div>
      </div>

      {totalAReceber > 0 && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-medium text-orange-800">
            Valor a receber: <strong>R$ {totalAReceber.toFixed(2)}</strong>
          </p>
        </div>
      )}

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}

      {pedidos && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Pedido</th>
                <th className="px-4 py-3 text-right font-medium">Valor Venda (base)</th>
                <th className="px-4 py-3 text-right font-medium">Valor Pago</th>
                <th className="px-4 py-3 text-right font-medium">A Receber</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedidos.items.map((p) => {
                const valorVenda = Number(p.valor_base_fornecedor) || Number(p.valor_produtos) || 0;
                const valorPago = Number(p.valor_pago_fornecedor || 0);
                const aReceber = valorVenda - valorPago;
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.numero_pedido}</td>
                    <td className="px-4 py-3 text-right">
                      R$ {valorVenda.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      R$ {valorPago.toFixed(2)}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${aReceber > 0 ? "text-orange-600" : "text-muted-foreground"}`}>
                      R$ {aReceber.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        {statusLabels[p.status] || p.status.replace(/_/g, " ")}
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
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
