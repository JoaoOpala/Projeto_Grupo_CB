"use client";

import { createContext, useContext } from "react";
import { useAuthStore } from "@/stores/auth-store";

type UserRole = "vendedor" | "fornecedor" | "admin";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; nome: string; role: UserRole } | null;
  accessToken: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, accessToken, setAuth, logout } = useAuthStore();

  const login = async (email: string, senha: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/auth/login/json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      }
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Falha na autenticação");
    }

    const data = await res.json();

    // Decodificar payload do JWT para obter dados do usuário
    const payload = JSON.parse(atob(data.access_token.split(".")[1]));
    setAuth(
      { id: payload.sub, email: payload.email, nome: payload.email, role: payload.role },
      data.access_token
    );
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
