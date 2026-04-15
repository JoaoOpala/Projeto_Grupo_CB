"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useAdminProdutos,
  useUpdateStatusProduto,
  useExcluirProduto,
  useAdminUpdateProduto,
} from "@/lib/api/hooks/use-admin";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { StatusProduto } from "@/types/produto";

const TABS: { label: string; value: StatusProduto | "TODOS" }[] = [
  { label: "Ativos", value: "ATIVO" },
  { label: "Todos", value: "TODOS" },
  { label: "Em Moderação", value: "MODERACAO" },
  { label: "Rascunho", value: "RASCUNHO" },
  { label: "Inativos", value: "INATIVO" },
  { label: "Rejeitados", value: "REJEITADO" },
];

const statusColors: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-800",
  RASCUNHO: "bg-gray-100 text-gray-800",
  MODERACAO: "bg-yellow-100 text-yellow-800",
  INATIVO: "bg-gray-100 text-gray-800",
  REJEITADO: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS: StatusProduto[] = ["ATIVO", "INATIVO", "RASCUNHO", "REJEITADO"];

export default function ProdutosAdminPage() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<StatusProduto | "TODOS">("ATIVO");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  // Editing state for preco_venda and local_origem
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrecoVenda, setEditPrecoVenda] = useState("");
  const [editLocalOrigem, setEditLocalOrigem] = useState("");

  const statusParam = activeTab === "TODOS" ? undefined : activeTab;
  const { data, isLoading, error } = useAdminProdutos(page, 20, statusParam);
  const updateStatus = useUpdateStatusProduto();
  const excluir = useExcluirProduto();
  const updateAdmin = useAdminUpdateProduto();

  const filteredItems = (data?.items ?? []).filter((p) => {
    if (search === "") return true;
    return (
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.ean || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateStatus.mutateAsync({ id, status });
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o produto "${nome}"? Esta ação não pode ser desfeita.`)) return;
    await excluir.mutateAsync(id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const startEditing = (id: string, precoVenda?: number, localOrigem?: string) => {
    setEditingId(id);
    setEditPrecoVenda(precoVenda ? String(precoVenda) : "");
    setEditLocalOrigem(localOrigem || "");
  };

  const handleSaveAdmin = async (id: string) => {
    await updateAdmin.mutateAsync({
      id,
      data: {
        preco_venda: editPrecoVenda ? Number(editPrecoVenda) : undefined,
        local_origem: editLocalOrigem || undefined,
      },
    });
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Produtos</h1>
          <p className="mt-2 text-muted-foreground">Gerencie todos os produtos da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/produtos/moderar"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Moderar Pendentes
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            + Adicionar Produto
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por nome, SKU ou EAN..."
          className="w-full max-w-sm rounded-md border bg-background px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
          Buscar
        </button>
        {search && (
          <button
            type="button"
            onClick={() => { setSearch(""); setSearchInput(""); }}
            className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
          >
            Limpar
          </button>
        )}
      </form>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setActiveTab(tab.value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar produtos.</p>}

      {data && (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">SKU / EAN</th>
                  <th className="px-4 py-3 text-left font-medium">Nome / Marca</th>
                  <th className="px-4 py-3 text-left font-medium">
                    Preço Base
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(fornecedor)</span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    Preço de Venda
                    <span className="ml-1 text-xs font-normal text-muted-foreground">(admin)</span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium">Local de Origem</th>
                  <th className="px-4 py-3 text-left font-medium">Estoque</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredItems.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs">{p.sku}</div>
                      {p.ean && <div className="font-mono text-xs text-muted-foreground">{p.ean}</div>}
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="font-medium truncate">{p.nome}</div>
                      {p.marca && <div className="text-xs text-muted-foreground">{p.marca}</div>}
                    </td>
                    {/* Preço base — somente leitura */}
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(p.preco_base)}</td>
                    {/* Preço de venda — editável pelo admin */}
                    <td className="px-4 py-3">
                      {editingId === p.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editPrecoVenda}
                          onChange={(e) => setEditPrecoVenda(e.target.value)}
                          className="w-24 rounded border px-2 py-1 text-sm"
                          placeholder="R$"
                        />
                      ) : (
                        <span className={p.preco_venda ? "font-medium" : "text-muted-foreground"}>
                          {p.preco_venda ? formatCurrency(p.preco_venda) : "—"}
                        </span>
                      )}
                    </td>
                    {/* Local de origem — editável */}
                    <td className="px-4 py-3 max-w-[150px]">
                      {editingId === p.id ? (
                        <input
                          type="text"
                          value={editLocalOrigem}
                          onChange={(e) => setEditLocalOrigem(e.target.value)}
                          className="w-36 rounded border px-2 py-1 text-sm"
                          placeholder="Cidade, UF"
                        />
                      ) : (
                        <span className="text-xs truncate block" title={p.local_origem || ""}>
                          {p.local_origem || <span className="text-muted-foreground">—</span>}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={p.estoque_disponivel === 0 ? "text-red-600 font-medium" : ""}>
                        {p.estoque_disponivel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                        disabled={updateStatus.isPending}
                        className={`rounded-full px-2 py-1 text-xs font-medium border-0 cursor-pointer ${statusColors[p.status] ?? ""}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {editingId === p.id ? (
                          <>
                            <button
                              onClick={() => handleSaveAdmin(p.id)}
                              disabled={updateAdmin.isPending}
                              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground disabled:opacity-50"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded border px-2 py-1 text-xs"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(p.id, p.preco_venda, p.local_origem)}
                            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                          >
                            Editar
                          </button>
                        )}
                        <button
                          onClick={() => handleExcluir(p.id, p.nome)}
                          disabled={excluir.isPending}
                          className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      {search ? `Nenhum produto encontrado para "${search}"` : "Nenhum produto nesta categoria"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Exibindo {filteredItems.length} de {data.total} produtos
              {search && ` (filtrado por "${search}")`}
            </p>
            {data.total_pages > 1 && (
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages}
                  className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
