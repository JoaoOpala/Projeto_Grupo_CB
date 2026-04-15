"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useComissoesVendedor, usePedidosVendedor } from "@/lib/api/hooks/use-pedidos";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  NOTA_FISCAL_EMITIDA: "bg-indigo-100 text-indigo-800",
  ETIQUETA_GERADA: "bg-violet-100 text-violet-800",
  DESPACHADO: "bg-purple-100 text-purple-800",
  EM_ENTREGA: "bg-sky-100 text-sky-800",
  ENTREGUE: "bg-green-100 text-green-800",
  EM_DEVOLUCAO: "bg-orange-100 text-orange-800",
  CANCELADO: "bg-red-100 text-red-800",
};

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

export default function ComissoesVendedorPage() {
  const { accessToken } = useAuthStore();
  const { data: resumo, isLoading: loadingResumo, refetch } = useComissoesVendedor(accessToken);
  const { data: pedidos, isLoading: loadingPedidos } = usePedidosVendedor(accessToken);
  const [saqueStatus, setSaqueStatus] = useState<string | null>(null);
  const [saqueLoading, setSaqueLoading] = useState(false);

  const handleSoliciarSaque = async () => {
    if (!accessToken) return;
    setSaqueLoading(true);
    setSaqueStatus(null);
    try {
      const result = await apiClient.post<{ mensagem: string; valor_solicitado: number }>(
        "/vendedor/financeiro/saque",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSaqueStatus(
        `Saque de R$ ${Number(result.valor_solicitado).toFixed(2)} solicitado! ${result.mensagem}`
      );
      refetch();
    } catch (err) {
      setSaqueStatus(err instanceof Error ? err.message : "Erro ao solicitar saque");
    } finally {
      setSaqueLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
      <p className="mt-2 text-muted-foreground">Acompanhe suas comissões e solicite saques</p>

      {/* Cards de resumo */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          <p className="mt-1 text-2xl font-bold">
            {loadingResumo ? "---" : (resumo?.total_pedidos ?? "---")}
          </p>
        </div>
        <div className="rounded-lg border bg-blue-50 p-6">
          <p className="text-sm text-blue-600">Total de Comissões Geradas</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {loadingResumo ? "---" : `R$ ${Number(resumo?.total_comissao_gerada || 0).toFixed(2)}`}
          </p>
        </div>
        <div className="rounded-lg border bg-green-50 p-6">
          <p className="text-sm text-green-600">Comissões Liberadas para Saque</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {loadingResumo ? "---" : `R$ ${Number(resumo?.total_comissao_liberada || 0).toFixed(2)}`}
          </p>
          <p className="mt-1 text-xs text-green-700">
            Pedidos com status "Entregue"
          </p>
        </div>
      </div>

      {/* Botão de saque */}
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleSoliciarSaque}
          disabled={saqueLoading || !resumo?.total_comissao_liberada}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saqueLoading ? "Processando..." : "Solicitar Saque"}
        </button>
        {!resumo?.total_comissao_liberada && (
          <p className="text-xs text-muted-foreground">
            Nenhuma comissão liberada para saque ainda
          </p>
        )}
      </div>

      {saqueStatus && (
        <div className={`mt-3 rounded-md p-3 text-sm ${saqueStatus.includes("Erro") || saqueStatus.includes("Nenhuma") ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700"}`}>
          {saqueStatus}
        </div>
      )}

      {resumo?.observacao && (
        <p className="mt-2 text-xs text-muted-foreground">{resumo.observacao}</p>
      )}

      {/* Tabela de comissões por pedido */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Comissões por Pedido</h2>

        {loadingPedidos && <p className="mt-4 text-muted-foreground">Carregando...</p>}

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
                    <td className={`px-4 py-3 text-right font-medium ${p.status === "ENTREGUE" ? "text-green-600" : "text-muted-foreground"}`}>
                      R$ {Number(p.valor_comissao_vendedor || 0).toFixed(2)}
                      {p.status === "ENTREGUE" && (
                        <span className="ml-1 text-xs text-green-500">✓ liberada</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || "bg-gray-100"}`}>
                        {statusLabels[p.status] || p.status.replace(/_/g, " ")}
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
