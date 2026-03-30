"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useClienteMe, useAtualizarPerfil } from "@/lib/api/hooks/use-cliente";

interface PerfilForm {
  nome: string;
  telefone: string;
  endereco: string;
}

export default function ClientePerfilPage() {
  const { data: cliente, isLoading } = useClienteMe();
  const atualizar = useAtualizarPerfil();
  const { register, handleSubmit, reset } = useForm<PerfilForm>();

  useEffect(() => {
    if (cliente) {
      reset({
        nome: cliente.nome,
        telefone: cliente.telefone ?? "",
        endereco: cliente.endereco ?? "",
      });
    }
  }, [cliente, reset]);

  const onSubmit = async (data: PerfilForm) => {
    await atualizar.mutateAsync({
      nome: data.nome,
      telefone: data.telefone || undefined,
      endereco: data.endereco || undefined,
    });
    alert("Perfil atualizado com sucesso!");
  };

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
      <p className="mt-2 text-muted-foreground">Atualize suas informações pessoais</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 max-w-lg space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={cliente?.email ?? ""}
            disabled
            className="w-full rounded-md border px-3 py-2 text-sm bg-muted/50 text-muted-foreground"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Nome completo</label>
          <input
            {...register("nome", { required: true })}
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Telefone</label>
          <input
            {...register("telefone")}
            placeholder="(11) 99999-9999"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Endereço</label>
          <textarea
            {...register("endereco")}
            rows={3}
            placeholder="Rua, número, bairro, cidade, estado"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={atualizar.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {atualizar.isPending ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
}
