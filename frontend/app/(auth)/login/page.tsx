"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema, type LoginFormData } from "@/lib/validations/vendedor";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await login(data.email, data.senha);
      const store = useAuthStore.getState();
      const role = store.user?.role;
      const redirectMap: Record<string, string> = {
        admin: "/admin",
        vendedor: "/vendedor",
        fornecedor: "/fornecedor",
      };
      router.push(redirectMap[role || ""] || "/vendedor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Acesse sua conta no Marketplace CB
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/recuperar-senha" className="hover:underline">
          Esqueceu a senha?
        </Link>
      </div>
      <div className="mt-2 text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/registro/vendedor" className="text-primary hover:underline">
          Cadastre-se como vendedor
        </Link>{" "}
        ou{" "}
        <Link href="/registro/fornecedor" className="text-primary hover:underline">
          como fornecedor
        </Link>
      </div>
    </div>
  );
}
