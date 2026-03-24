"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "@/lib/auth/protected-route";

const fornecedorLinks = [
  { label: "Dashboard", href: "/fornecedor" },
  { label: "Meus Produtos", href: "/fornecedor/produtos" },
  { label: "Novo Produto", href: "/fornecedor/produtos/novo" },
  { label: "Estoque", href: "/fornecedor/estoque" },
  { label: "Pedidos", href: "/fornecedor/pedidos" },
  { label: "Repasses", href: "/fornecedor/financeiro/repasses" },
];

export default function FornecedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["fornecedor"]}>
      <div className="flex min-h-screen">
        <Sidebar title="Painel do Fornecedor" links={fornecedorLinks} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
