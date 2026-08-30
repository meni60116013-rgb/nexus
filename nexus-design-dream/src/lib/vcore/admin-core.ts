import { useSession } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const VAULT_MINUTES = 30;

export type VaultSession = {
  unlocked?: boolean;
  userId?: string;
  expiresAt?: number;
};

export function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "nexus-vault",
    maxAge: VAULT_MINUTES * 60,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createToken(prefix: string): string {
  const bytes = new Uint8Array(30);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  return `${prefix}-${body.slice(0, 6)}-${body.slice(6, 12)}-${body.slice(12, 18)}-${body.slice(18, 24)}`;
}

export async function hashToken(token: string): Promise<string> {
  const pepper = process.env["SESSION_SECRET"] ?? "";
  const data = new TextEncoder().encode(`${pepper}::${token}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

type Ctx = { supabase: SupabaseClient<any, any, any>; userId: string; claims?: Record<string, any> };

/** Verifica rol admin y, opcionalmente, que la bóveda esté abierta. */
export async function assertAdmin(context: Ctx, requireUnlocked = false) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Acceso restringido al administrador maestro.");

  if (requireUnlocked) {
    const session = await useSession<VaultSession>(sessionConfig());
    const ok =
      session.data.unlocked === true &&
      session.data.userId === context.userId &&
      (session.data.expiresAt ?? 0) > Date.now();
    if (!ok) throw new Error("Bóveda cerrada. Verifica tu Tokenmaster.");
  }
  return context.supabase;
}

export async function audit(
  supabase: SupabaseClient<any, any, any>,
  context: Ctx,
  accion: string,
  detalle?: string,
) {
  await supabase.from("admin_auditoria").insert({
    actor_id: context.userId,
    actor_email: (context.claims?.["email"] as string) ?? null,
    accion,
    detalle: detalle ?? null,
  });
}
