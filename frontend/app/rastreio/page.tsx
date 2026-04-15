"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { Pedido } from "@/types/pedido";

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  NOTA_FISCAL_EMITIDA: "bg-indigo-100 text-indigo-800",
  ETIQUETA_GERADA: "bg-indigo-100 text-indigo-800",
  DESPACHADO: "bg-purple-100 text-purple-800",
  EM_ENTREGA: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  EM_DEVOLUCAO: "bg-gray-100 text-gray-800",
  CANCELADO: "bg-red-100 text-red-800",
};

const statusSteps = [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "NOTA_FISCAL_EMITIDA",
  "ETIQUETA_GERADA",
  "DESPACHADO",
  "EM_ENTREGA",
  "ENTREGUE",
];

export default function RastreioPage() {
  const searchParams = useSearchParams();
  const [numero, setNumero] = useState(searchParams.get("numero") || "");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numero.trim()) return;
    setLoading(true);
    setError("");
    setPedido(null);
    setSearched(true);

    try {
      const result = await apiClient.get<Pedido>(`/pedidos/rastreio/${numero.trim()}`);
      setPedido(result);
    } catch {
      setError("Pedido não encontrado. Verifique o número e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = pedido
    ? statusSteps.indexOf(pedido.status)
    : -1;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Rastrear Pedido</h1>
      <p className="mt-2 text-muted-foreground">
        Informe o número do pedido para acompanhar o status
      </p>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          placeholder="Número do pedido"
          required
          className="w-full max-w-md rounded-md border bg-background px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Rastrear"}
        </button>
      </form>

      {error && (
        <div className="mt-6 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {searched && !loading && !error && !pedido && (
        <div className="mt-6 rounded-lg border p-8 text-center text-muted-foreground">
          Pedido não encontrado
        </div>
      )}

      {pedido && (
        <div className="mt-8 space-y-6">
          {/* Status progress */}
          {pedido.status !== "CANCELADO" && pedido.status !== "EM_DEVOLUCAO" && (
            <div className="rounded-lg border p-6">
              <h2 className="text-lg font-semibold">Progresso</h2>
              <div className="mt-4 flex items-center justify-between">
                {statusSteps.map((step, i) => (
                  <div key={step} className="flex flex-1 flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        i <= currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className="mt-1 text-center text-xs text-muted-foreground">
                      {step.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-6 space-y-3">
              <h2 className="text-lg font-semibold">Informações do Pedido</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-mono font-medium">{pedido.numero_pedido}</span>
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`inline-block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusColors[pedido.status] || ""
                  }`}
                >
                  {pedido.status.replace(/_/g, " ")}
                </span>
                <span className="text-muted-foreground">Data:</span>
                <span>{new Date(pedido.created_at).toLocaleDateString("pt-BR")}</span>
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">R$ {Number(pedido.valor_total).toFixed(2)}</span>
                {pedido.codigo_rastreio && (
                  <>
                    <span className="text-muted-foreground">Rastreio:</span>
                    <span className="font-mono">{pedido.codigo_rastreio}</span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-6 space-y-3">
              <h2 className="text-lg font-semibold">Itens</h2>
              <div className="divide-y text-sm">
                {pedido.itens.map((item) => (
                  <div key={item.id} className="flex justify-between py-2">
                    <span>
                      {item.produto_nome} x{item.quantidade}
                    </span>
                    <span className="font-medium">
                      R$ {Number(item.preco_total).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
