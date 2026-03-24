"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";

interface EstoqueItem {
  produto_id: string;
  sku: string;
  nome: string;
  quantidade_disponivel: number;
  quantidade_reservada: number;
}

export default function EstoqueFornecedorPage() {
  const { accessToken } = useAuthStore();
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstoque = async () => {
      try {
        const data = await apiClient.get<EstoqueItem[]>(ENDPOINTS.FORNECEDOR.ESTOQUE, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setEstoque(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchEstoque();
  }, [accessToken]);

  const handleUpdateEstoque = async (produtoId: string, quantidade: number) => {
    try {
      await apiClient.put(
        `${ENDPOINTS.FORNECEDOR.ESTOQUE}/${produtoId}`,
        null,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { quantidade: String(quantidade) },
        }
      );
      setEstoque((prev) =>
        prev.map((e) =>
          e.produto_id === produtoId ? { ...e, quantidade_disponivel: quantidade } : e
        )
      );
    } catch {
      alert("Erro ao atualizar estoque");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
      <p className="mt-2 text-muted-foreground">
        Gerencie o estoque dos seus produtos
      </p>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">SKU</th>
              <th className="px-4 py-3 text-left font-medium">Produto</th>
              <th className="px-4 py-3 text-right font-medium">Disponível</th>
              <th className="px-4 py-3 text-right font-medium">Reservado</th>
              <th className="px-4 py-3 text-left font-medium">Atualizar</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : estoque.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum produto no estoque
                </td>
              </tr>
            ) : (
              estoque.map((e) => (
                <tr key={e.produto_id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{e.sku}</td>
                  <td className="px-4 py-3">{e.nome}</td>
                  <td className="px-4 py-3 text-right">{e.quantidade_disponivel}</td>
                  <td className="px-4 py-3 text-right">{e.quantidade_reservada}</td>
                  <td className="px-4 py-3">
                    <form
                      className="flex gap-2"
                      onSubmit={(ev) => {
                        ev.preventDefault();
                        const form = ev.currentTarget;
                        const input = form.elements.namedItem("qty") as HTMLInputElement;
                        handleUpdateEstoque(e.produto_id, Number(input.value));
                      }}
                    >
                      <input
                        name="qty"
                        type="number"
                        min="0"
                        defaultValue={e.quantidade_disponivel}
                        className="w-20 rounded-md border px-2 py-1 text-sm"
                      />
                      <button
                        type="submit"
                        className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
                      >
                        Salvar
                      </button>
                    </form>
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
