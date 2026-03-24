"use client";

import Link from "next/link";

const configSections = [
  {
    title: "Plataforma",
    description: "Nome, logo e configurações gerais do marketplace",
    href: "/admin/configuracoes/sistema",
  },
  {
    title: "Comissões",
    description: "Taxas e comissões padrão da plataforma",
    href: "/admin/financeiro/comissoes",
  },
  {
    title: "Moderação",
    description: "Regras de moderação de produtos e fornecedores",
    href: "/admin/produtos/moderar",
  },
];

export default function ConfiguracoesAdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
      <p className="mt-2 text-muted-foreground">
        Configurações gerais da plataforma
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="rounded-lg border p-6 transition-colors hover:bg-muted/50"
          >
            <h3 className="text-lg font-semibold">{section.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Configurações avançadas (SMTP, gateway de pagamento, integrações) serão
        adicionadas conforme os módulos forem implementados.
      </div>
    </div>
  );
}
