"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminFornecedores, useCriarFornecedor, useExcluirFornecedor } from "@/lib/api/hooks/use-admin";
import { formatDate, formatCpfCnpj } from "@/lib/utils/format";

const statusColors: Record<string, string> = {
  APROVADO: "bg-green-100 text-green-800",
  PENDENTE: "bg-yellow-100 text-yellow-800",
  REJEITADO: "bg-red-100 text-red-800",
  SUSPENSO: "bg-gray-100 text-gray-800",
};

export default function FornecedoresAdminPage() {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading, error } = useAdminFornecedores(page);
  const criarFornecedor = useCriarFornecedor();
  const excluirFornecedor = useExcluirFornecedor();

  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    email: "",
    tipo: "INDUSTRIA",
    senha: "",
    telefone: "",
  });
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      await criarFornecedor.mutateAsync({
        ...form,
        nome_fantasia: form.nome_fantasia || undefined,
        telefone: form.telefone || undefined,
      });
      setShowForm(false);
      setForm({ razao_social: "", nome_fantasia: "", cnpj: "", email: "", tipo: "INDUSTRIA", senha: "", telefone: "" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao criar fornecedor");
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Excluir o fornecedor "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await excluirFornecedor.mutateAsync(id);
    } catch {
      alert("Erro ao excluir fornecedor. Verifique se não há produtos ou pedidos vinculados.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie os fornecedores da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/fornecedores/aprovar"
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Pendentes de Aprovação
          </Link>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            {showForm ? "Cancelar" : "Adicionar Fornecedor"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Novo Fornecedor</h2>
          {formError && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{formError}</div>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Razão Social *</label>
              <input
                type="text"
                required
                minLength={3}
                value={form.razao_social}
                onChange={(e) => setForm({ ...form, razao_social: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Nome Fantasia</label>
              <input
                type="text"
                value={form.nome_fantasia}
                onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">CNPJ *</label>
              <input
                type="text"
                required
                value={form.cnpj}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                placeholder="00.000.000/0001-00"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Tipo *</label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="INDUSTRIA">Indústria</option>
                <option value="DISTRIBUIDOR">Distribuidor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Senha *</label>
              <input
                type="password"
                required
                minLength={8}
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={criarFornecedor.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {criarFornecedor.isPending ? "Criando..." : "Criar Fornecedor"}
          </button>
        </form>
      )}

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar fornecedores.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Nome Fantasia</th>
                  <th className="px-4 py-3 text-left font-medium">Razão Social</th>
                  <th className="px-4 py-3 text-left font-medium">CNPJ</th>
                  <th className="px-4 py-3 text-left font-medium">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Cadastro</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{f.nome_fantasia || "—"}</td>
                    <td className="px-4 py-3">{f.razao_social}</td>
                    <td className="px-4 py-3">{formatCpfCnpj(f.cnpj)}</td>
                    <td className="px-4 py-3">{f.tipo}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${statusColors[f.status] || ""}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(f.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/fornecedores/${f.id}`}
                          className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
                        >
                          Detalhes
                        </Link>
                        <button
                          onClick={() => handleExcluir(f.id, f.nome_fantasia || f.razao_social)}
                          disabled={excluirFornecedor.isPending}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum fornecedor encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} fornecedores)
              </p>
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
