"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const redirectMap: Record<string, string> = {
        admin: "/admin",
        vendedor: "/vendedor",
        fornecedor: "/fornecedor",
        cliente: "/cliente",
      };
      router.push(redirectMap[user.role] || "/");
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  if (!hydrated) return null;
  if (!isAuthenticated) return null;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
