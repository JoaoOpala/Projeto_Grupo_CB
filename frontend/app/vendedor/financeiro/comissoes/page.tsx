"use client";

import { useAuthStore } from "@/stores/auth-store";
import { usePerfilVendedor } from "@/lib/api/hooks/use-vendedor";
import { usePedidosVendedor } from "@/lib/api/hooks/use-pedidos";

export default function ComissoesVendedorPage() {
  const { accessToken } = useAuthStore();
  const { data: perfil } = usePerfilVendedor(accessToken);
  const { data: pedidos, isLoading } = usePedidosVendedor(accessToken);

  const totalComissao = pedidos?.items?.reduce(
    (sum, p) => sum + Number(p.valor_comissao_vendedor || 0),
    0
  ) || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
      <p className="mt-2 text-muted-foreground">
        Acompanhe suas comissões e ganhos
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Comissão Padrão</p>
          <p className="mt-1 text-2xl font-bold">
            {perfil ? `${(Number(perfil.comissao_padrao) * 100).toFixed(0)}%` : "---"}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          <p className="mt-1 text-2xl font-bold">{pedidos?.total ?? "---"}</p>
        </div>
        <div className="rounded-lg border bg-green-50 p-6">
          <p className="text-sm text-green-600">Total em Comissões</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            R$ {totalComissao.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Comissões por Pedido</h2>

        {isLoading && <p className="mt-4 text-muted-foreground">Carregando...</p>}

        {pedidos && (
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Pedido</th>
                  <th className="px-4 py-3 text-left font-medium">Cliente</th>
                  <th className="px-4 py-3 text-right font-medium">Valor Total</th>
                  <th className="px-4 py-3 text-right font-medium">Sua Comissão</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pedidos.items.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.numero_pedido}</td>
                    <td className="px-4 py-3">{p.cliente_nome}</td>
                    <td className="px-4 py-3 text-right">
                      R$ {Number(p.valor_total).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      R$ {Number(p.valor_comissao_vendedor || 0).toFixed(2)}
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
                ))}
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
    </div>
  );
}
