"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { useProdutoFornecedor } from "@/lib/api/hooks/use-fornecedor";

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  MODERACAO: "bg-yellow-100 text-yellow-800",
  RASCUNHO: "bg-gray-100 text-gray-800",
  INATIVO: "bg-red-100 text-red-800",
  REJEITADO: "bg-red-100 text-red-800",
};

export default function DetalhesProdutoFornecedorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { data: produto, isLoading, error } = useProdutoFornecedor(accessToken, id);

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;
  if (error || !produto) return <p className="text-red-500">Erro ao carregar produto.</p>;

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <div className="mt-4 flex items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{produto.nome}</h1>
        <span
          className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
            statusColors[produto.status] || ""
          }`}
        >
          {produto.status}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Informações</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">SKU:</span>
            <span className="font-mono">{produto.sku}</span>
            <span className="text-muted-foreground">Preço Base:</span>
            <span>R$ {Number(produto.preco_base).toFixed(2)}</span>
            <span className="text-muted-foreground">Preço de Venda:</span>
            <span>R$ {Number(produto.preco_venda ?? produto.preco_base).toFixed(2)}</span>
            <span className="text-muted-foreground">Estoque:</span>
            <span>{produto.estoque_disponivel}</span>
            {produto.peso_kg && (
              <>
                <span className="text-muted-foreground">Peso:</span>
                <span>{produto.peso_kg} kg</span>
              </>
            )}
            <span className="text-muted-foreground">Cadastro:</span>
            <span>{new Date(produto.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
        </div>

        <div className="rounded-lg border p-6 space-y-3">
          <h2 className="text-lg font-semibold">Descrição</h2>
          <p className="text-sm">{produto.descricao || "Sem descrição"}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href={`/fornecedor/produtos/${id}/editar`}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Editar Produto
        </Link>
      </div>
    </div>
  );
}
