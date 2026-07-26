"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useRequireAuth(redirectTo = "/login") {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname;
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set("callbackUrl", currentPath);
      window.location.href = url.toString();
    }
  }, [status, redirectTo]);

  return { session, status, isLoading: status === "loading" };
}

export function useRequireAdmin() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentPath = window.location.pathname;
      const url = new URL("/login", window.location.origin);
      url.searchParams.set("callbackUrl", currentPath);
      window.location.href = url.toString();
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "ADMIN" && role !== "EMPLOYEE") {
        window.location.href = "/";
      }
    }
  }, [status, session]);

  return { session, status, isLoading: status === "loading" };
}
