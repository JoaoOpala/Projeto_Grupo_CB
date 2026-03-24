"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";
import type { Produto } from "@/types/produto";

export default function ProdutosFornecedorPage() {
  const { accessToken } = useAuthStore();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const data = await apiClient.get<{ items: Produto[] }>(
          ENDPOINTS.FORNECEDOR.PRODUTOS,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setProdutos(data.items);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchProdutos();
  }, [accessToken]);

  const statusColors: Record<string, string> = {
    ATIVO: "bg-green-100 text-green-800",
    MODERACAO: "bg-yellow-100 text-yellow-800",
    RASCUNHO: "bg-gray-100 text-gray-800",
    INATIVO: "bg-red-100 text-red-800",
    REJEITADO: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Produtos</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Link
          href="/fornecedor/produtos/novo"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Novo Produto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Nome</th>
              <th className="px-4 py-3 text-right font-medium">Preço Base</th>
              <th className="px-4 py-3 text-right font-medium">Preço Sugerido</th>
              <th className="px-4 py-3 text-right font-medium">Estoque</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : produtos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum produto cadastrado
                </td>
              </tr>
            ) : (
              produtos.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3">{p.nome}</td>
                  <td className="px-4 py-3 text-right">
                    R$ {Number(p.preco_base).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    R$ {Number(p.preco_venda_sugerido).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">{p.estoque_disponivel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColors[p.status] || "bg-gray-100"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/fornecedor/produtos/${p.id}/editar`}
                      className="text-primary hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
