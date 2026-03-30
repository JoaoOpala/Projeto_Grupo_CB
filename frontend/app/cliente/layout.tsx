"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/lib/auth/protected-route";

const clienteLinks = [
  { label: "Início", href: "/cliente" },
  { label: "Meus Pedidos", href: "/cliente/pedidos" },
  { label: "Meu Perfil", href: "/cliente/perfil" },
];

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["cliente"]}>
      <div className="flex min-h-screen">
        <Sidebar title="Minha Conta" links={clienteLinks} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
