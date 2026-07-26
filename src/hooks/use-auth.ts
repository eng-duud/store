"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function useRequireAuth(redirectTo = "/login") {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set("callbackUrl", pathname);
      router.replace(url.toString());
    }
  }, [status, router, redirectTo, pathname]);

  return { session, status, isLoading: status === "loading" };
}

export function useRequireAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const url = new URL("/login", window.location.origin);
      url.searchParams.set("callbackUrl", pathname);
      router.replace(url.toString());
    } else if (status === "authenticated") {
      const role = session?.user?.role;
      if (role !== "ADMIN" && role !== "EMPLOYEE") {
        router.replace("/");
      }
    }
  }, [status, session, router, pathname]);

  return { session, status, isLoading: status === "loading" };
}
