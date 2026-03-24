"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const cartCount = hydrated ? totalItems() : 0;

  const dashboardHref = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "fornecedor"
      ? "/fornecedor"
      : "/vendedor"
    : "/login";

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            Marketplace CB
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link href="/catalogo" className="text-muted-foreground hover:text-foreground">
              Catálogo
            </Link>
            <Link href="/rastreio" className="text-muted-foreground hover:text-foreground">
              Rastrear Pedido
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/carrinho"
            className="relative rounded-md px-3 py-1.5 text-sm hover:bg-muted"
          >
            Carrinho
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {hydrated && isAuthenticated && user ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {user.nome} ({user.role})
              </Link>
              <button
                onClick={logout}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
              >
                Sair
              </button>
            </>
          ) : hydrated ? (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm hover:bg-muted"
              >
                Entrar
              </Link>
              <Link
                href="/registro/vendedor"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
              >
                Cadastrar
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
