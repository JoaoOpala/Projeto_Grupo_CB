"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import {
  registroVendedorSchema,
  type RegistroVendedorFormData,
} from "@/lib/validations/vendedor";

export default function RegistroVendedorPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroVendedorFormData>({
    resolver: zodResolver(registroVendedorSchema),
    defaultValues: { tipo_pessoa: "FISICA" },
  });

  const onSubmit = async (data: RegistroVendedorFormData) => {
    setError("");
    try {
      const { confirmar_senha, ...payload } = data;
      await apiClient.post("/auth/registro/vendedor", payload);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Cadastro de Vendedor</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Crie sua conta e comece a vender sem estoque
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
            {...register("nome")}
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
            {...register("email")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">CPF/CNPJ</label>
          <input
            {...register("cpf_cnpj")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.cpf_cnpj && (
            <p className="mt-1 text-xs text-destructive">{errors.cpf_cnpj.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Tipo de pessoa</label>
          <select
            {...register("tipo_pessoa")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="FISICA">Pessoa Física</option>
            <option value="JURIDICA">Pessoa Jurídica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone (opcional)</label>
          <input
            {...register("telefone")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Senha</label>
          <input
            type="password"
            {...register("senha")}
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
            {...register("confirmar_senha")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {errors.confirmar_senha && (
            <p className="mt-1 text-xs text-destructive">
              {errors.confirmar_senha.message}
            </p>
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
    </div>
  );
}
