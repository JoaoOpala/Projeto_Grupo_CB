"use client";

import { useState } from "react";
import Link from "next/link";
import { useAdminLojas, useVerificarLoja, useDesverificarLoja } from "@/lib/api/hooks/use-admin";

export default function LojasAdminPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminLojas(page);
  const verificar = useVerificarLoja();
  const desverificar = useDesverificarLoja();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Influences Verificados</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie quais lojas aparecem como influences verificados na página inicial
          </p>
        </div>
        {data && (
          <div className="rounded-lg border px-4 py-2 text-sm">
            <span className="font-semibold text-yellow-600">
              {data.items.filter((l) => l.verificado).length}
            </span>{" "}
            verificado(s) de{" "}
            <span className="font-semibold">{data.total}</span> loja(s)
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Lojas marcadas como <strong>Verificado</strong> aparecem na seção de{" "}
        <strong>Influences Verificados</strong> da página inicial do marketplace.
        Clientes acessam cada loja pelo seu link exclusivo.
      </div>

      {isLoading && <p className="mt-6 text-muted-foreground">Carregando...</p>}
      {error && <p className="mt-6 text-red-500">Erro ao carregar lojas.</p>}

      {data && (
        <>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Loja</th>
                  <th className="px-4 py-3 text-left font-medium">Slug / Link</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Verificado</th>
                  <th className="px-4 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.items.map((loja) => (
                  <tr key={loja.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {loja.logo_url ? (
                          <img
                            src={loja.logo_url}
                            alt={loja.nome_loja}
                            className="h-9 w-9 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                            {loja.nome_loja.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{loja.nome_loja}</p>
                          {loja.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {loja.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs text-muted-foreground">
                          /loja/{loja.slug}
                        </code>
                        <Link
                          href={`/loja/${loja.slug}`}
                          target="_blank"
                          className="text-xs text-primary hover:underline"
                        >
                          Abrir →
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          loja.ativa
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {loja.ativa ? "Ativa" : "Inativa"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {loja.verificado ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                          ✓ Verificado
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                          Não verificado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {loja.verificado ? (
                        <button
                          onClick={() => desverificar.mutate(loja.id)}
                          disabled={desverificar.isPending}
                          className="rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 disabled:opacity-50"
                        >
                          Remover verificação
                        </button>
                      ) : (
                        <button
                          onClick={() => verificar.mutate(loja.id)}
                          disabled={verificar.isPending}
                          className="rounded bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                        >
                          ⭐ Verificar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma loja cadastrada ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.total_pages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.total_pages} ({data.total} lojas)
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
