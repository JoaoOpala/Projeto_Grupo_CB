"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useProdutoFornecedor, useUpdateProdutoFornecedor } from "@/lib/api/hooks/use-fornecedor";

export default function EditarProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const { data: produto, isLoading } = useProdutoFornecedor(accessToken, id);
  const updateProduto = useUpdateProdutoFornecedor(accessToken);

  const [form, setForm] = useState({
    nome: "",
    marca: "",
    modelo: "",
    descricao: "",
    preco_base: "",
    comprimento_cm: "",
    largura_cm: "",
    altura_cm: "",
    peso_kg: "",
  });
  const [imagensInput, setImagensInput] = useState("");
  const [videosInput, setVideosInput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (produto && !loaded) {
      setForm({
        nome: produto.nome,
        marca: produto.marca || "",
        modelo: produto.modelo || "",
        descricao: produto.descricao || "",
        preco_base: String(produto.preco_base),
        comprimento_cm: produto.comprimento_cm ? String(produto.comprimento_cm) : "",
        largura_cm: produto.largura_cm ? String(produto.largura_cm) : "",
        altura_cm: produto.altura_cm ? String(produto.altura_cm) : "",
        peso_kg: produto.peso_kg ? String(produto.peso_kg) : "",
      });
      setImagensInput((produto.imagens || []).join("\n"));
      setVideosInput((produto.videos || []).join("\n"));
      setLoaded(true);
    }
  }, [produto, loaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const imagens = imagensInput.split("\n").map((u) => u.trim()).filter(Boolean);
    const videos = videosInput.split("\n").map((u) => u.trim()).filter(Boolean);
    if (imagens.length === 0) {
      setError("Pelo menos 1 foto é obrigatória");
      return;
    }
    if (imagens.length > 15) {
      setError("Máximo de 15 fotos permitidas");
      return;
    }
    try {
      await updateProduto.mutateAsync({
        id,
        data: {
          nome: form.nome,
          marca: form.marca || undefined,
          modelo: form.modelo || undefined,
          descricao: form.descricao || undefined,
          preco_base: Number(form.preco_base),
          imagens,
          videos: videos.length > 0 ? videos : undefined,
          comprimento_cm: form.comprimento_cm ? Number(form.comprimento_cm) : undefined,
          largura_cm: form.largura_cm ? Number(form.largura_cm) : undefined,
          altura_cm: form.altura_cm ? Number(form.altura_cm) : undefined,
          peso_kg: form.peso_kg ? Number(form.peso_kg) : undefined,
        },
      });
      setSuccess("Produto atualizado com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar produto");
    }
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  const inputCls = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium";

  return (
    <div className="max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-primary hover:underline">
        &larr; Voltar
      </button>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">Editar Produto</h1>
      <p className="mt-1 text-sm text-muted-foreground font-mono">
        SKU: {produto?.sku} · EAN: {produto?.ean || "—"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{success}</div>
        )}

        {/* Identificação */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Identificação</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Nome <span className="text-destructive">*</span></label>
              <input
                required
                minLength={3}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Marca</label>
              <input
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Modelo</label>
              <input
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Preço Base (R$) <span className="text-destructive">*</span></label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={form.preco_base}
                onChange={(e) => setForm({ ...form, preco_base: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Descrição</label>
            <textarea
              rows={3}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              className={inputCls}
            />
          </div>
        </section>

        {/* Medidas */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Medidas da Embalagem</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Comprimento (cm)", key: "comprimento_cm" },
              { label: "Largura (cm)", key: "largura_cm" },
              { label: "Altura (cm)", key: "altura_cm" },
              { label: "Peso (kg)", key: "peso_kg" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <input
                  type="number"
                  step="0.001"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Mídia */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Fotos e Vídeos</h2>
          <div>
            <label className={labelCls}>
              Fotos <span className="text-destructive">*</span>{" "}
              <span className="text-xs font-normal text-muted-foreground">(mín. 1, máx. 15 — uma URL por linha)</span>
            </label>
            <textarea
              rows={4}
              className={inputCls}
              value={imagensInput}
              onChange={(e) => setImagensInput(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className={labelCls}>
              Vídeos{" "}
              <span className="text-xs font-normal text-muted-foreground">(opcional — uma URL por linha)</span>
            </label>
            <textarea
              rows={2}
              className={inputCls}
              value={videosInput}
              onChange={(e) => setVideosInput(e.target.value)}
            />
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={updateProduto.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {updateProduto.isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
          <button type="button" onClick={() => router.back()} className="rounded-md border px-4 py-2 text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
