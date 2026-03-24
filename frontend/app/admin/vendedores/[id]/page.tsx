"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdminVendedor, useUpdateStatusVendedor } from "@/lib/api/hooks/use-admin";
import { formatDate, formatCpfCnpj, formatCurrency } from "@/lib/utils/format";

const statusOptions = ["ATIVO", "PENDENTE", "INATIVO", "SUSPENSO"];

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  PENDENTE: "bg-yellow-100 text-yellow-800",
  INATIVO: "bg-gray-100 text-gray-800",
  SUSPENSO: "bg-red-100 text-red-800",
};

export default function DetalhesVendedorAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: vendedor, isLoading, error } = useAdminVendedor(id);
  const updateStatus = useUpdateStatusVendedor();

  const handleStatusChange = async (newStatus: string) => {
    if (!vendedor || vendedor.status === newStatus) return;
    if (!confirm(`Alterar status para ${newStatus}?`)) return;
    await updateStatus.mutateAsync({ id, status: newStatus });
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error || !vendedor) return <p className="text-red-500">Erro ao carregar vendedor.</p>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{vendedor.nome}</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Informações</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span>{vendedor.email}</span>
            <span className="text-muted-foreground">CPF/CNPJ:</span>
            <span>{formatCpfCnpj(vendedor.cpf_cnpj)}</span>
            <span className="text-muted-foreground">Telefone:</span>
            <span>{vendedor.telefone || "—"}</span>
            <span className="text-muted-foreground">Tipo:</span>
            <span>{vendedor.tipo_pessoa}</span>
            <span className="text-muted-foreground">Comissão:</span>
            <span>{(vendedor.comissao_padrao * 100).toFixed(0)}%</span>
            <span className="text-muted-foreground">Cadastro:</span>
            <span>{formatDate(vendedor.created_at)}</span>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Status</h2>
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[vendedor.status] || ""}`}>
            {vendedor.status}
          </span>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Alterar status:</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions
                .filter((s) => s !== vendedor.status)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updateStatus.isPending}
                    className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
