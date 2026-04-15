"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminCriarProduto, useAdminFornecedores } from "@/lib/api/hooks/use-admin";

const labelCls = "block text-sm font-medium mb-1";
const inputCls = "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";
const errorCls = "mt-1 text-xs text-destructive";
const sectionCls = "mt-6 rounded-lg border p-6";
const sectionTitle = "mb-4 text-base font-semibold";

export default function AdminNovoProdutoPage() {
  const router = useRouter();
  const criarProduto = useAdminCriarProduto();
  const { data: fornecedoresData } = useAdminFornecedores(1, 100);

  const [form, setForm] = useState({
    fornecedor_id: "",
    sku: "",
    ean: "",
    nome: "",
    marca: "",
    modelo: "",
    descricao: "",
    preco_base: "",
    preco_venda: "",
    estoque_disponivel: "0",
    comprimento_cm: "",
    largura_cm: "",
    altura_cm: "",
    peso_kg: "",
    local_origem: "",
  });
  const [fotosInput, setFotosInput] = useState("");
  const [videosInput, setVideosInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fornecedor_id) e.fornecedor_id = "Selecione um fornecedor";
    if (!form.sku) e.sku = "SKU obrigatório";
    if (!form.ean) e.ean = "EAN obrigatório";
    if (!form.nome) e.nome = "Nome obrigatório";
    if (!form.marca) e.marca = "Marca obrigatória";
    if (!form.modelo) e.modelo = "Modelo obrigatório";
    if (!form.preco_base || Number(form.preco_base) <= 0) e.preco_base = "Preço base inválido";
    if (!form.comprimento_cm || Number(form.comprimento_cm) <= 0) e.comprimento_cm = "Obrigatório";
    if (!form.largura_cm || Number(form.largura_cm) <= 0) e.largura_cm = "Obrigatório";
    if (!form.altura_cm || Number(form.altura_cm) <= 0) e.altura_cm = "Obrigatório";
    if (!form.peso_kg || Number(form.peso_kg) <= 0) e.peso_kg = "Obrigatório";
    const fotos = fotosInput.split("\n").map((u) => u.trim()).filter(Boolean);
    if (fotos.length === 0) e.fotos = "Pelo menos 1 foto obrigatória";
    if (fotos.length > 15) e.fotos = "Máximo de 15 fotos";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const fotos = fotosInput.split("\n").map((u) => u.trim()).filter(Boolean);
    const videos = videosInput.split("\n").map((u) => u.trim()).filter(Boolean);

    try {
      await criarProduto.mutateAsync({
        fornecedor_id: form.fornecedor_id,
        sku: form.sku,
        ean: form.ean,
        nome: form.nome,
        marca: form.marca,
        modelo: form.modelo,
        descricao: form.descricao || undefined,
        preco_base: Number(form.preco_base),
        preco_venda: form.preco_venda ? Number(form.preco_venda) : undefined,
        estoque_disponivel: Number(form.estoque_disponivel),
        imagens: fotos,
        videos,
        comprimento_cm: Number(form.comprimento_cm),
        largura_cm: Number(form.largura_cm),
        altura_cm: Number(form.altura_cm),
        peso_kg: Number(form.peso_kg),
        local_origem: form.local_origem || undefined,
      });
      router.push("/admin/produtos");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Erro ao criar produto");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Adicionar Produto</h1>
          <p className="mt-2 text-muted-foreground">Cadastre um produto em nome de um fornecedor</p>
        </div>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
        >
          Cancelar
        </button>
      </div>

      {apiError && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Fornecedor */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Fornecedor</h2>
          <div>
            <label className={labelCls}>Fornecedor <span className="text-destructive">*</span></label>
            <select
              value={form.fornecedor_id}
              onChange={(e) => set("fornecedor_id", e.target.value)}
              className={inputCls}
            >
              <option value="">Selecione um fornecedor...</option>
              {fornecedoresData?.items.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_fantasia || f.razao_social} — {f.cnpj}
                </option>
              ))}
            </select>
            {errors.fornecedor_id && <p className={errorCls}>{errors.fornecedor_id}</p>}
          </div>
        </div>

        {/* Identificação */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Identificação</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>SKU <span className="text-destructive">*</span></label>
              <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={inputCls} placeholder="SKU-001" />
              {errors.sku && <p className={errorCls}>{errors.sku}</p>}
            </div>
            <div>
              <label className={labelCls}>EAN (código de barras) <span className="text-destructive">*</span></label>
              <input value={form.ean} onChange={(e) => set("ean", e.target.value)} className={inputCls} placeholder="7891234567890" />
              {errors.ean && <p className={errorCls}>{errors.ean}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome do produto <span className="text-destructive">*</span></label>
              <input value={form.nome} onChange={(e) => set("nome", e.target.value)} className={inputCls} />
              {errors.nome && <p className={errorCls}>{errors.nome}</p>}
            </div>
            <div>
              <label className={labelCls}>Marca <span className="text-destructive">*</span></label>
              <input value={form.marca} onChange={(e) => set("marca", e.target.value)} className={inputCls} />
              {errors.marca && <p className={errorCls}>{errors.marca}</p>}
            </div>
            <div>
              <label className={labelCls}>Modelo <span className="text-destructive">*</span></label>
              <input value={form.modelo} onChange={(e) => set("modelo", e.target.value)} className={inputCls} />
              {errors.modelo && <p className={errorCls}>{errors.modelo}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                rows={3}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Preços e Estoque */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Preços e Estoque</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>Preço base (R$) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" min="0" value={form.preco_base} onChange={(e) => set("preco_base", e.target.value)} className={inputCls} placeholder="0,00" />
              {errors.preco_base && <p className={errorCls}>{errors.preco_base}</p>}
            </div>
            <div>
              <label className={labelCls}>Preço de venda (R$)</label>
              <input type="number" step="0.01" min="0" value={form.preco_venda} onChange={(e) => set("preco_venda", e.target.value)} className={inputCls} placeholder="0,00" />
              <p className="mt-1 text-xs text-muted-foreground">Definido pela plataforma</p>
            </div>
            <div>
              <label className={labelCls}>Estoque inicial</label>
              <input type="number" min="0" value={form.estoque_disponivel} onChange={(e) => set("estoque_disponivel", e.target.value)} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Medidas */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Medidas da Embalagem</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className={labelCls}>Comprimento (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" min="0" value={form.comprimento_cm} onChange={(e) => set("comprimento_cm", e.target.value)} className={inputCls} />
              {errors.comprimento_cm && <p className={errorCls}>{errors.comprimento_cm}</p>}
            </div>
            <div>
              <label className={labelCls}>Largura (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" min="0" value={form.largura_cm} onChange={(e) => set("largura_cm", e.target.value)} className={inputCls} />
              {errors.largura_cm && <p className={errorCls}>{errors.largura_cm}</p>}
            </div>
            <div>
              <label className={labelCls}>Altura (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" min="0" value={form.altura_cm} onChange={(e) => set("altura_cm", e.target.value)} className={inputCls} />
              {errors.altura_cm && <p className={errorCls}>{errors.altura_cm}</p>}
            </div>
            <div>
              <label className={labelCls}>Peso (kg) <span className="text-destructive">*</span></label>
              <input type="number" step="0.001" min="0" value={form.peso_kg} onChange={(e) => set("peso_kg", e.target.value)} className={inputCls} />
              {errors.peso_kg && <p className={errorCls}>{errors.peso_kg}</p>}
            </div>
          </div>
        </div>

        {/* Fotos e Vídeos */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Mídia</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>
                Fotos (URLs) <span className="text-destructive">*</span>
                <span className="ml-1 font-normal text-muted-foreground">— mínimo 1, máximo 15 — uma por linha</span>
              </label>
              <textarea
                value={fotosInput}
                onChange={(e) => setFotosInput(e.target.value)}
                rows={4}
                className={inputCls}
                placeholder={"https://exemplo.com/foto1.jpg\nhttps://exemplo.com/foto2.jpg"}
              />
              {errors.fotos && <p className={errorCls}>{errors.fotos}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {fotosInput.split("\n").filter((u) => u.trim()).length} / 15 fotos
              </p>
            </div>
            <div>
              <label className={labelCls}>
                Vídeos (URLs)
                <span className="ml-1 font-normal text-muted-foreground">— opcional — um por linha</span>
              </label>
              <textarea
                value={videosInput}
                onChange={(e) => setVideosInput(e.target.value)}
                rows={2}
                className={inputCls}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>
        </div>

        {/* Local de Origem */}
        <div className={sectionCls}>
          <h2 className={sectionTitle}>Logística</h2>
          <div>
            <label className={labelCls}>Local de origem</label>
            <input value={form.local_origem} onChange={(e) => set("local_origem", e.target.value)} className={inputCls} placeholder="Ex: São Paulo, SP" />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-6 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={criarProduto.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {criarProduto.isPending ? "Salvando..." : "Cadastrar Produto"}
          </button>
        </div>
      </form>
    </div>
  );
}
