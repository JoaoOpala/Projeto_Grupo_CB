"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useAdminFornecedor,
  useAprovarFornecedor,
  useRejeitarFornecedor,
} from "@/lib/api/hooks/use-admin";
import { formatDate, formatCpfCnpj } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  APROVADO: "bg-green-100 text-green-800",
  PENDENTE: "bg-yellow-100 text-yellow-800",
  REJEITADO: "bg-red-100 text-red-800",
  SUSPENSO: "bg-gray-100 text-gray-800",
};

export default function DetalhesFornecedorAdminPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: fornecedor, isLoading, error } = useAdminFornecedor(id);
  const aprovar = useAprovarFornecedor();
  const rejeitar = useRejeitarFornecedor();

  const handleAprovar = async () => {
    if (!confirm("Confirmar aprovação deste fornecedor?")) return;
    await aprovar.mutateAsync(id);
  };

  const handleRejeitar = async () => {
    if (!confirm("Confirmar rejeição deste fornecedor?")) return;
    await rejeitar.mutateAsync(id);
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error || !fornecedor) return <p className="text-red-500">Erro ao carregar fornecedor.</p>;

  const isPendente = fornecedor.status === "PENDENTE";

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {fornecedor.nome_fantasia || fornecedor.razao_social}
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Informações</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Razão Social:</span>
            <span>{fornecedor.razao_social}</span>
            <span className="text-muted-foreground">Nome Fantasia:</span>
            <span>{fornecedor.nome_fantasia || "—"}</span>
            <span className="text-muted-foreground">CNPJ:</span>
            <span>{formatCpfCnpj(fornecedor.cnpj)}</span>
            <span className="text-muted-foreground">Email:</span>
            <span>{fornecedor.email}</span>
            <span className="text-muted-foreground">Telefone:</span>
            <span>{fornecedor.telefone || "—"}</span>
            <span className="text-muted-foreground">Tipo:</span>
            <span>{fornecedor.tipo}</span>
            <span className="text-muted-foreground">Cadastro:</span>
            <span>{formatDate(fornecedor.created_at)}</span>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Status</h2>
          <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${statusColors[fornecedor.status] || ""}`}>
            {fornecedor.status}
          </span>

          {isPendente && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Ações de moderação:</p>
              <div className="flex gap-2">
                <button
                  onClick={handleAprovar}
                  disabled={aprovar.isPending}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {aprovar.isPending ? "Aprovando..." : "Aprovar"}
                </button>
                <button
                  onClick={handleRejeitar}
                  disabled={rejeitar.isPending}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {rejeitar.isPending ? "Rejeitando..." : "Rejeitar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
