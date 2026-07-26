import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  const role = session?.user?.role;

  if (!session || (role !== "ADMIN" && role !== "EMPLOYEE")) {
    throw new Error("UNAUTHORIZED");
  }

  return session;
}
