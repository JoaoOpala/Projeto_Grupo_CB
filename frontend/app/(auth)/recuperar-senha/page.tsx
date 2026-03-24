"use client";

import { useState } from "react";
import Link from "next/link";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Backend não tem endpoint de recuperação de senha implementado ainda.
    // Simulamos o fluxo para UX completa.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Email Enviado</h2>
        <p className="mt-4 text-sm text-muted-foreground">
          Se o email <strong>{email}</strong> estiver cadastrado, você receberá
          um link para redefinir sua senha.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Voltar ao Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Recuperar Senha</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Informe seu email para receber o link de recuperação
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="seu@email.com"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Enviar Link de Recuperação
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}
