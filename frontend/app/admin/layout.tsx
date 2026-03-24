"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/lib/auth/protected-route";

const adminLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Vendedores", href: "/admin/vendedores" },
  { label: "Fornecedores", href: "/admin/fornecedores" },
  { label: "Aprovar Fornecedores", href: "/admin/fornecedores/aprovar" },
  { label: "Produtos", href: "/admin/produtos" },
  { label: "Moderar Produtos", href: "/admin/produtos/moderar" },
  { label: "Pedidos", href: "/admin/pedidos" },
  { label: "Comissões", href: "/admin/financeiro/comissoes" },
  { label: "Relatórios", href: "/admin/financeiro/relatorios" },
  { label: "Configurações", href: "/admin/configuracoes" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen">
        <Sidebar title="Administração" links={adminLinks} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
