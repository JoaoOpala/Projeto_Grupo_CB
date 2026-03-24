"use client";

import { useState } from "react";

export default function ConfiguracoesSistemaPage() {
  const [form, setForm] = useState({
    nome_plataforma: "Marketplace CB",
    descricao: "Plataforma B2B2C de dropshipping",
    comissao_plataforma: "5",
    moderacao_automatica: false,
  });
  const [success, setSuccess] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Configurações salvas com sucesso!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
      <p className="mt-2 text-muted-foreground">
        Parâmetros técnicos e integrações
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        <div>
          <label className="block text-sm font-medium">Nome da Plataforma</label>
          <input
            type="text"
            value={form.nome_plataforma}
            onChange={(e) => setForm({ ...form, nome_plataforma: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Comissão da Plataforma (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={form.comissao_plataforma}
            onChange={(e) => setForm({ ...form, comissao_plataforma: e.target.value })}
            className="mt-1 w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="moderacao"
            checked={form.moderacao_automatica}
            onChange={(e) =>
              setForm({ ...form, moderacao_automatica: e.target.checked })
            }
          />
          <label htmlFor="moderacao" className="text-sm font-medium">
            Aprovar produtos automaticamente (sem moderação)
          </label>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Salvar Configurações
        </button>
      </form>

      <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        As configurações são salvas localmente. A persistência no backend será implementada
        quando o módulo de configurações do sistema estiver completo.
      </div>
    </div>
  );
}
