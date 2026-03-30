"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface RegistroClienteForm {
  nome: string;
  email: string;
  senha: string;
  confirmar_senha: string;
  cpf?: string;
  telefone?: string;
}

export default function RegistroClientePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistroClienteForm>();

  const onSubmit = async (data: RegistroClienteForm) => {
    if (data.senha !== data.confirmar_senha) {
      setError("As senhas não coincidem");
      return;
    }
    setError("");
    try {
      const { confirmar_senha, ...payload } = data;
      await apiClient.post(ENDPOINTS.CLIENTE.REGISTRO, payload);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Criar Conta</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Cadastre-se para comprar no marketplace
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Nome completo</label>
          <input
            {...register("nome", { required: "Nome é obrigatório" })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.nome && (
            <p className="mt-1 text-xs text-destructive">{errors.nome.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email é obrigatório" })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">CPF (opcional)</label>
          <input
            {...register("cpf")}
            placeholder="000.000.000-00"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone (opcional)</label>
          <input
            {...register("telefone")}
            placeholder="(11) 99999-9999"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            {...register("senha", { required: "Senha é obrigatória", minLength: { value: 6, message: "Mínimo 6 caracteres" } })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.senha && (
            <p className="mt-1 text-xs text-destructive">{errors.senha.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Confirmar senha</label>
          <input
            type="password"
            {...register("confirmar_senha", { required: "Confirme sua senha" })}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.confirmar_senha && (
            <p className="mt-1 text-xs text-destructive">{errors.confirmar_senha.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        É vendedor ou fornecedor?{" "}
        <Link href="/registro/vendedor" className="text-primary hover:underline">
          Cadastro empresarial
        </Link>
      </div>
    </div>
  );
}
