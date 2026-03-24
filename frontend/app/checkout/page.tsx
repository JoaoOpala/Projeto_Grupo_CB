"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useCartStore } from "@/stores/cart-store";

interface CheckoutForm {
  cliente_nome: string;
  cliente_email: string;
  cliente_telefone: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [pedidoNumero, setPedidoNumero] = useState("");

  const [form, setForm] = useState<CheckoutForm>({
    cliente_nome: "",
    cliente_email: "",
    cliente_telefone: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (pedidoNumero) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="rounded-lg border bg-green-50 p-8">
          <h1 className="text-3xl font-bold text-green-800">Pedido Realizado!</h1>
          <p className="mt-4 text-green-700">
            Seu pedido <span className="font-mono font-bold">{pedidoNumero}</span> foi
            criado com sucesso.
          </p>
          <p className="mt-2 text-sm text-green-600">
            Você pode acompanhar o status na página de rastreamento.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => router.push(`/rastreio?numero=${pedidoNumero}`)}
              className="rounded-md bg-green-600 px-6 py-2 text-sm font-medium text-white"
            >
              Rastrear Pedido
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-md border px-6 py-2 text-sm"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
        <button
          onClick={() => router.push("/catalogo")}
          className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
        >
          Ir para o catálogo
        </button>
      </div>
    );
  }

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Group items by loja_id (each loja generates a separate order)
      const lojaGroups = items.reduce<Record<string, typeof items>>((acc, item) => {
        if (!acc[item.loja_id]) acc[item.loja_id] = [];
        acc[item.loja_id].push(item);
        return acc;
      }, {});

      let lastNumeroPedido = "";

      for (const [lojaId, lojaItems] of Object.entries(lojaGroups)) {
        const payload = {
          loja_id: lojaId,
          cliente_nome: form.cliente_nome,
          cliente_email: form.cliente_email,
          cliente_telefone: form.cliente_telefone || undefined,
          endereco_entrega: {
            logradouro: form.logradouro,
            numero: form.numero,
            complemento: form.complemento || undefined,
            bairro: form.bairro,
            cidade: form.cidade,
            estado: form.estado,
            cep: form.cep,
            pais: "Brasil",
          },
          itens: lojaItems.map((i) => ({
            produto_id: i.produto_id,
            quantidade: i.quantidade,
          })),
        };

        const result = await apiClient.post<{ numero_pedido: string }>(
          "/pedidos",
          payload
        );
        lastNumeroPedido = result.numero_pedido;
      }

      clearCart();
      setPedidoNumero(lastNumeroPedido);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao finalizar pedido"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-3xl font-bold tracking-tight">Finalizar Compra</h1>

      {/* Resumo */}
      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Resumo do Pedido</h2>
        <div className="mt-2 divide-y text-sm">
          {items.map((item) => (
            <div key={item.produto_id} className="flex justify-between py-2">
              <span>
                {item.nome} x{item.quantidade}
              </span>
              <span className="font-medium">
                R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-2 font-bold">
            <span>Total</span>
            <span>R$ {totalPrice().toFixed(2)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Dados pessoais */}
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Dados Pessoais</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Nome Completo *</label>
              <input
                type="text"
                required
                minLength={3}
                value={form.cliente_nome}
                onChange={(e) => handleChange("cliente_nome", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Email *</label>
              <input
                type="email"
                required
                value={form.cliente_email}
                onChange={(e) => handleChange("cliente_email", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <input
                type="text"
                value={form.cliente_telefone}
                onChange={(e) => handleChange("cliente_telefone", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Logradouro *</label>
              <input
                type="text"
                required
                value={form.logradouro}
                onChange={(e) => handleChange("logradouro", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Número *</label>
              <input
                type="text"
                required
                value={form.numero}
                onChange={(e) => handleChange("numero", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Complemento</label>
              <input
                type="text"
                value={form.complemento}
                onChange={(e) => handleChange("complemento", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Bairro *</label>
              <input
                type="text"
                required
                value={form.bairro}
                onChange={(e) => handleChange("bairro", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Cidade *</label>
              <input
                type="text"
                required
                value={form.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Estado *</label>
              <input
                type="text"
                required
                maxLength={2}
                value={form.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                placeholder="SP"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">CEP *</label>
              <input
                type="text"
                required
                value={form.cep}
                onChange={(e) => handleChange("cep", e.target.value)}
                placeholder="00000-000"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {submitting ? "Processando..." : `Finalizar Pedido - R$ ${totalPrice().toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
