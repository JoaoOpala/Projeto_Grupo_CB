"use client";

import Link from "next/link";
import { useClienteMe } from "@/lib/api/hooks/use-cliente";
import { formatDate } from "@/lib/utils/format";

export default function ClienteDashboardPage() {
  const { data: cliente, isLoading } = useClienteMe();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Bem-vindo!</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie seus pedidos e informações pessoais
      </p>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}

      {cliente && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">Nome</p>
            <p className="mt-1 text-xl font-semibold">{cliente.nome}</p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="mt-1 text-xl font-semibold">{cliente.email}</p>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <span
              className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                cliente.status === "ATIVO"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {cliente.status}
            </span>
          </div>
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">Membro desde</p>
            <p className="mt-1 text-xl font-semibold">{formatDate(cliente.created_at)}</p>
          </div>
          {cliente.telefone && (
            <div className="rounded-lg border p-6">
              <p className="text-sm font-medium text-muted-foreground">Telefone</p>
              <p className="mt-1 text-xl font-semibold">{cliente.telefone}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex gap-4">
        <Link
          href="/cliente/pedidos"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Ver Meus Pedidos
        </Link>
        <Link
          href="/cliente/perfil"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Editar Perfil
        </Link>
        <Link
          href="/catalogo"
          className="rounded-md border px-4 py-2 text-sm font-medium"
        >
          Ir ao Catálogo
        </Link>
      </div>
    </div>
  );
}
