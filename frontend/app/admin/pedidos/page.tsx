"use client";

import { useState } from "react";
import { useAdminPedidos, useAdminAtualizarStatusPedido, useAdminPagarFornecedor } from "@/lib/api/hooks/use-admin";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import type { StatusPedido } from "@/types/pedido";

const STATUS_OPTIONS: { value: StatusPedido; label: string }[] = [
  { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando Pagamento" },
  { value: "PAGO", label: "Pago" },
  { value: "NOTA_FISCAL_EMITIDA", label: "Nota Fiscal Emitida" },
  { value: "ETIQUETA_GERADA", label: "Etiqueta de Envio Gerada" },
  { value: "DESPACHADO", label: "Despachado" },
  { value: "EM_ENTREGA", label: "Em Entrega" },
  { value: "ENTREGUE", label: "Entregue" },
  { value: "EM_DEVOLUCAO", label: "Em Devolução" },
  { value: "CANCELADO", label: "Cancelado" },
];

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

export default function PedidosAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminPedidos(page);
  const atualizarStatus = useAdminAtualizarStatusPedido();
  const pagarFornecedor = useAdminPagarFornecedor();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pagamentoInput, setPagamentoInput] = useState<Record<string, string>>({});

  const handleStatusChange = async (id: string, novoStatus: string) => {
    await atualizarStatus.mutateAsync({ id, data: { status: novoStatus } });
  };

  const handlePagarFornecedor = async (id: string) => {
    const valor = Number(pagamentoInput[id]);
    if (!valor || valor <= 0) return;
    await pagarFornecedor.mutateAsync({ id, valor_pago: valor });
    setPagamentoInput((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
      <p className="mt-2 text-muted-foreground">Todos os pedidos da plataforma</p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar pedidos.</p>}

      {data && (
        <>
          <div className="mt-6 space-y-4">
            {data.items.map((p) => {
              const precoBase = Number(p.valor_base_fornecedor ?? p.valor_produtos ?? 0);
              const comissaoVendedor = Number(p.valor_comissao_vendedor ?? 0);
              const frete = Number(p.valor_frete ?? 0);
              const valorTotal = Number(p.valor_total ?? 0);
              const valorLiquido = valorTotal - comissaoVendedor - frete - precoBase;
              const isExpanded = expandedId === p.id;

              return (
                <div key={p.id} className="rounded-lg border bg-card">
                  {/* Cabeçalho do pedido */}
                  <div
                    className="flex cursor-pointer items-center justify-between p-4 hover:bg-muted/30"
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-medium">{p.numero_pedido}</span>
                      <span className="text-sm">{p.cliente_nome}</span>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || "bg-gray-100"}`}>
                        {STATUS_OPTIONS.find((s) => s.value === p.status)?.label || p.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-muted-foreground">
                        {formatDateTime(p.created_at)}
                      </span>
                      <span className="font-medium">{formatCurrency(p.valor_total)}</span>
                      <span className="text-muted-foreground">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {isExpanded && (
                    <div className="border-t p-4 space-y-4">
                      {/* Breakdown financeiro */}
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Preço Base (Fornecedor)</p>
                          <p className="mt-1 font-semibold">{formatCurrency(precoBase)}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Comissão Vendedor</p>
                          <p className="mt-1 font-semibold text-orange-600">{formatCurrency(comissaoVendedor)}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Valor do Frete</p>
                          <p className="mt-1 font-semibold">{formatCurrency(frete)}</p>
                        </div>
                        <div className="rounded-md bg-muted/40 p-3">
                          <p className="text-xs text-muted-foreground">Valor Total</p>
                          <p className="mt-1 font-semibold text-blue-600">{formatCurrency(valorTotal)}</p>
                        </div>
                        <div className={`rounded-md p-3 ${valorLiquido >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                          <p className="text-xs text-muted-foreground">Valor Líquido</p>
                          <p className={`mt-1 font-bold ${valorLiquido >= 0 ? "text-green-700" : "text-red-700"}`}>
                            {formatCurrency(valorLiquido)}
                          </p>
                          <p className="text-xs text-muted-foreground">= Total − Comissão − Frete − Base</p>
                        </div>
                      </div>

                      {/* Atualizar status */}
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Atualizar Status
                          </label>
                          <select
                            defaultValue={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            disabled={atualizarStatus.isPending}
                            className="rounded-md border bg-background px-3 py-1.5 text-sm"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pagamento ao fornecedor */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Registrar Pagamento ao Fornecedor (já pago: {formatCurrency(p.valor_pago_fornecedor)})
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="R$ valor"
                              value={pagamentoInput[p.id] || ""}
                              onChange={(e) => setPagamentoInput((prev) => ({ ...prev, [p.id]: e.target.value }))}
                              className="w-28 rounded-md border bg-background px-3 py-1.5 text-sm"
                            />
                            <button
                              onClick={() => handlePagarFornecedor(p.id)}
                              disabled={pagarFornecedor.isPending || !pagamentoInput[p.id]}
                              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Registrar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Histórico de status */}
                      {p.historico_status && p.historico_status.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">Histórico de Status</p>
                          <div className="space-y-1">
                            {p.historico_status.map((h, i) => (
                              <div key={i} className="flex items-center gap-3 text-xs">
                                <span className="text-muted-foreground">
                                  {new Date(h.data_hora).toLocaleString("pt-BR")}
                                </span>
                                <span className={`inline-block rounded-full px-2 py-0.5 font-medium ${statusColors[h.status] || "bg-gray-100"}`}>
                                  {STATUS_OPTIONS.find((s) => s.value === h.status)?.label || h.status}
                                </span>
                                {h.observacoes && (
                                  <span className="text-muted-foreground">{h.observacoes}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Itens do pedido */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Itens ({p.itens.length})</p>
                        <div className="space-y-1">
                          {p.itens.map((item) => (
                            <div key={item.id} className="flex justify-between text-xs">
                              <span>{item.produto_nome} <span className="text-muted-foreground">× {item.quantidade}</span></span>
                              <span>{formatCurrency(item.preco_total)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {data.items.length === 0 && (
              <p className="py-8 text-center text-muted-foreground">Nenhum pedido encontrado</p>
            )}
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
