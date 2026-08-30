import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  sessionConfig,
  type VaultSession,
  assertAdmin,
  createToken,
  hashToken,
  audit,
  VAULT_MINUTES,
} from "./admin-core";

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) return { isAdmin: false, hasMaster: false, unlocked: false, expiresAt: null };

    const { data: master } = await supabase
      .from("admin_master_token")
      .select("id, prefijo, created_at, ultimo_uso")
      .eq("activo", true)
      .maybeSingle();

    const session = await useSession<VaultSession>(sessionConfig());
    const expiresAt = session.data.expiresAt ?? 0;
    const unlocked =
      session.data.unlocked === true &&
      session.data.userId === context.userId &&
      expiresAt > Date.now();

    return {
      isAdmin: true,
      hasMaster: Boolean(master),
      masterPrefix: master?.prefijo ?? null,
      unlocked,
      expiresAt: unlocked ? expiresAt : null,
    };
  });

/** Genera el Tokenmaster una sola vez. El valor en claro solo se devuelve aquí. */
export const createMasterToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { etiqueta?: string; rotate?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);

    const { data: existing } = await supabase
      .from("admin_master_token")
      .select("id")
      .eq("activo", true);

    if (existing && existing.length > 0) {
      if (!data.rotate) return { ok: false as const, error: "Ya existe un Tokenmaster activo." };
      const session = await useSession<VaultSession>(sessionConfig());
      if (!session.data.unlocked || session.data.userId !== context.userId) {
        return { ok: false as const, error: "Desbloquea la bóveda para rotar el Tokenmaster." };
      }
      await supabase.from("admin_master_token").update({ activo: false }).eq("activo", true);
    }

    const token = createToken("NXM");
    const { error } = await supabase.from("admin_master_token").insert({
      owner_id: context.userId,
      token_hash: await hashToken(token),
      prefijo: token.slice(0, 11),
      etiqueta: data.etiqueta?.trim() || "Tokenmaster",
    });
    if (error) return { ok: false as const, error: error.message };

    await audit(supabase, context, data.rotate ? "tokenmaster_rotado" : "tokenmaster_creado");
    return { ok: true as const, token };
  });

export const unlockVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { token: string; biometria?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context);
    const hash = await hashToken(data.token.trim());

    const { data: match } = await supabase
      .from("admin_master_token")
      .select("id")
      .eq("activo", true)
      .eq("token_hash", hash)
      .maybeSingle();

    if (!match) {
      await audit(supabase, context, "acceso_denegado", "Tokenmaster inválido");
      return { ok: false as const };
    }

    const expiresAt = Date.now() + VAULT_MINUTES * 60_000;
    const session = await useSession<VaultSession>(sessionConfig());
    await session.update({ unlocked: true, userId: context.userId, expiresAt });
    await supabase
      .from("admin_master_token")
      .update({ ultimo_uso: new Date().toISOString() })
      .eq("id", match.id);
    await audit(
      supabase,
      context,
      "boveda_abierta",
      data.biometria ? `Biometría: ${data.biometria}` : "Solo Tokenmaster",
    );
    return { ok: true as const, expiresAt };
  });

export const lockVault = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const session = await useSession<VaultSession>(sessionConfig());
    await session.clear();
    const supabase = context.supabase;
    await audit(supabase, context, "boveda_cerrada");
    return { ok: true as const };
  });

export const generarTokenCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      tallerId: string;
      tipo: string;
      etiqueta?: string;
      dias: number;
      maxDispositivos: number;
      planId?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context, true);
    const token = createToken("NXC");
    const expira =
      data.dias > 0 ? new Date(Date.now() + data.dias * 86_400_000).toISOString() : null;

    const { error } = await supabase.from("tokens_cliente").insert({
      taller_id: data.tallerId,
      tipo: data.tipo,
      etiqueta: data.etiqueta?.trim() || "Token de acceso",
      prefijo: token.slice(0, 11),
      token_hash: await hashToken(token),
      plan_id: data.planId || null,
      max_dispositivos: data.maxDispositivos,
      expira_en: expira,
    });
    if (error) return { ok: false as const, error: error.message };

    await audit(supabase, context, "token_generado", `${data.tipo} · taller ${data.tallerId}`);
    return { ok: true as const, token };
  });

export const cambiarEstadoToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; estado: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = await assertAdmin(context, true);
    const { error } = await supabase
      .from("tokens_cliente")
      .update({ estado: data.estado })
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    await audit(supabase, context, `token_${data.estado}`, data.id);
    return { ok: true as const };
  });
