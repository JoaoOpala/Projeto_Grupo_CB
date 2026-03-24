"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { usePedidoVendedor } from "@/lib/api/hooks/use-vendedor";

const statusColors: Record<string, string> = {
  AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800",
  PAGO: "bg-blue-100 text-blue-800",
  PREPARANDO: "bg-indigo-100 text-indigo-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
  DEVOLVIDO: "bg-gray-100 text-gray-800",
};

export default function DetalhesPedidoVendedorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { data: pedido, isLoading, error } = usePedidoVendedor(accessToken, id);

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error || !pedido) return <p className="text-red-500">Erro ao carregar pedido.</p>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <div className="mt-4 flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Pedido #{pedido.numero_pedido}
        </h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
            statusColors[pedido.status] || ""
          }`}
        >
          {pedido.status.replace(/_/g, " ")}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Cliente</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Nome:</span>
            <span>{pedido.cliente_nome}</span>
            <span className="text-muted-foreground">Email:</span>
            <span>{pedido.cliente_email}</span>
            {pedido.cliente_telefone && (
              <>
                <span className="text-muted-foreground">Telefone:</span>
                <span>{pedido.cliente_telefone}</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Valores</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Produtos:</span>
            <span>R$ {Number(pedido.valor_produtos).toFixed(2)}</span>
            <span className="text-muted-foreground">Frete:</span>
            <span>R$ {Number(pedido.valor_frete).toFixed(2)}</span>
            <span className="text-muted-foreground">Desconto:</span>
            <span>R$ {Number(pedido.valor_desconto).toFixed(2)}</span>
            <span className="text-muted-foreground font-medium">Total:</span>
            <span className="font-bold">R$ {Number(pedido.valor_total).toFixed(2)}</span>
            <span className="text-muted-foreground">Sua comissão:</span>
            <span className="text-green-600 font-medium">
              R$ {Number(pedido.valor_comissao_vendedor).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {pedido.codigo_rastreio && (
        <div className="mt-4 rounded-lg border p-4 text-sm">
          <span className="text-muted-foreground">Código de Rastreio: </span>
          <span className="font-mono font-medium">{pedido.codigo_rastreio}</span>
        </div>
      )}

      <div className="mt-6 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Itens do Pedido</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">SKU</th>
                <th className="px-4 py-2 text-left font-medium">Produto</th>
                <th className="px-4 py-2 text-right font-medium">Qtd</th>
                <th className="px-4 py-2 text-right font-medium">Preço Unit.</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pedido.itens.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 font-mono text-xs">{item.produto_sku}</td>
                  <td className="px-4 py-2">{item.produto_nome}</td>
                  <td className="px-4 py-2 text-right">{item.quantidade}</td>
                  <td className="px-4 py-2 text-right">
                    R$ {Number(item.preco_unitario).toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium">
                    R$ {Number(item.preco_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Criado em: {new Date(pedido.created_at).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
