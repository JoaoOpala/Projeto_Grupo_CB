"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGUE: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
};

export default function ClientePedidosPage() {
  // Pedidos virão de endpoint /pedidos?cliente_id=me
  // Por ora renderiza estado vazio enquanto endpoint de pedido por cliente é implementado
  const pedidos: any[] = [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="mt-2 text-muted-foreground">Acompanhe o status dos seus pedidos</p>
        </div>
        <Link
          href="/catalogo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Fazer Novo Pedido
        </Link>
      </div>

      <div className="mt-6">
        {pedidos.length === 0 ? (
          <div className="rounded-lg border p-12 text-center">
            <p className="text-lg font-medium">Nenhum pedido encontrado</p>
            <p className="mt-2 text-muted-foreground">
              Explore nosso catálogo e faça seu primeiro pedido!
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Pedido #{pedido.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(pedido.created_at)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusColors[pedido.status] ?? "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {pedido.status}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {pedido.itens?.length ?? 0} item(s)
                  </p>
                  <p className="font-semibold">{formatCurrency(pedido.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
