"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { produtoSchema, type ProdutoFormData } from "@/lib/validations/produto";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { useAuthStore } from "@/stores/auth-store";

export default function NovoProdutoPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [error, setError] = useState("");
  const [imagensInput, setImagensInput] = useState("");
  const [videosInput, setVideosInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      estoque_disponivel: 0,
      imagens: [],
      videos: [],
    },
  });

  const onSubmit = async (data: ProdutoFormData) => {
    setError("");
    try {
      await apiClient.post(ENDPOINTS.FORNECEDOR.PRODUTOS, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      router.push("/fornecedor/produtos");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar produto");
    }
  };

  const handleImagensChange = (value: string) => {
    setImagensInput(value);
    const urls = value.split("\n").map((u) => u.trim()).filter(Boolean);
    setValue("imagens", urls, { shouldValidate: true });
  };

  const handleVideosChange = (value: string) => {
    setVideosInput(value);
    const urls = value.split("\n").map((u) => u.trim()).filter(Boolean);
    setValue("videos", urls, { shouldValidate: true });
  };

  const inputCls = "mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm";
  const labelCls = "block text-sm font-medium";
  const errorCls = "mt-1 text-xs text-destructive";

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
      <p className="mt-2 text-muted-foreground">Cadastre um novo produto no catálogo</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
        )}

        {/* Identificação */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Identificação</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SKU <span className="text-destructive">*</span></label>
              <input {...register("sku")} className={inputCls} placeholder="EX-001" />
              {errors.sku && <p className={errorCls}>{errors.sku.message}</p>}
            </div>
            <div>
              <label className={labelCls}>EAN (código de barras) <span className="text-destructive">*</span></label>
              <input {...register("ean")} className={inputCls} placeholder="7891234567890" />
              {errors.ean && <p className={errorCls}>{errors.ean.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Nome <span className="text-destructive">*</span></label>
              <input {...register("nome")} className={inputCls} />
              {errors.nome && <p className={errorCls}>{errors.nome.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Marca <span className="text-destructive">*</span></label>
              <input {...register("marca")} className={inputCls} />
              {errors.marca && <p className={errorCls}>{errors.marca.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Modelo <span className="text-destructive">*</span></label>
              <input {...register("modelo")} className={inputCls} />
              {errors.modelo && <p className={errorCls}>{errors.modelo.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Categoria</label>
              <input
                {...register("categoria_id")}
                className={inputCls}
                placeholder="ID da categoria (opcional)"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                As categorias serão disponibilizadas em breve
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Descrição</label>
            <textarea {...register("descricao")} rows={3} className={inputCls} />
          </div>
        </section>

        {/* Preço e Estoque */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Preço e Estoque</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Preço Base (R$) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" {...register("preco_base")} className={inputCls} />
              {errors.preco_base && <p className={errorCls}>{errors.preco_base.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Estoque Inicial</label>
              <input type="number" {...register("estoque_disponivel")} className={inputCls} />
              {errors.estoque_disponivel && <p className={errorCls}>{errors.estoque_disponivel.message}</p>}
            </div>
          </div>
        </section>

        {/* Medidas da Embalagem */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Medidas da Embalagem</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className={labelCls}>Comprimento (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" {...register("comprimento_cm")} className={inputCls} />
              {errors.comprimento_cm && <p className={errorCls}>{errors.comprimento_cm.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Largura (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" {...register("largura_cm")} className={inputCls} />
              {errors.largura_cm && <p className={errorCls}>{errors.largura_cm.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Altura (cm) <span className="text-destructive">*</span></label>
              <input type="number" step="0.01" {...register("altura_cm")} className={inputCls} />
              {errors.altura_cm && <p className={errorCls}>{errors.altura_cm.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Peso (kg) <span className="text-destructive">*</span></label>
              <input type="number" step="0.001" {...register("peso_kg")} className={inputCls} />
              {errors.peso_kg && <p className={errorCls}>{errors.peso_kg.message}</p>}
            </div>
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
              placeholder="https://exemplo.com/foto1.jpg&#10;https://exemplo.com/foto2.jpg"
              value={imagensInput}
              onChange={(e) => handleImagensChange(e.target.value)}
            />
            {errors.imagens && <p className={errorCls}>{errors.imagens.message}</p>}
          </div>
          <div className="mt-4">
            <label className={labelCls}>
              Vídeos{" "}
              <span className="text-xs font-normal text-muted-foreground">(opcional — uma URL por linha)</span>
            </label>
            <textarea
              rows={2}
              className={inputCls}
              placeholder="https://youtube.com/watch?v=..."
              value={videosInput}
              onChange={(e) => handleVideosChange(e.target.value)}
            />
            {errors.videos && <p className={errorCls}>{errors.videos.message}</p>}
          </div>
        </section>

        {/* Local de origem */}
        <section>
          <h2 className="mb-3 text-base font-semibold">Local de Origem</h2>
          <div>
            <label className={labelCls}>Endereço de origem do produto</label>
            <input
              {...register("local_origem")}
              className={inputCls}
              placeholder="Ex: Rua das Flores, 100 – São Paulo, SP"
            />
          </div>
        </section>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Produto"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
