"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/lib/auth/protected-route";

const vendedorLinks = [
  { label: "Dashboard", href: "/vendedor" },
  { label: "Meus Produtos", href: "/vendedor/loja/produtos" },
  { label: "Adicionar Produto", href: "/vendedor/loja/produtos/adicionar" },
  { label: "Pedidos", href: "/vendedor/pedidos" },
  { label: "Comissões", href: "/vendedor/financeiro/comissoes" },
  { label: "Configurações da Loja", href: "/vendedor/loja/configuracoes" },
];

export default function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["vendedor"]}>
      <div className="flex min-h-screen">
        <Sidebar title="Painel do Vendedor" links={vendedorLinks} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
