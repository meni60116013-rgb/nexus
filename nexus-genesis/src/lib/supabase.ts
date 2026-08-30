import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Fallback público: son claves "anon/publishable", seguras de exponer en el
// cliente. Sirven como red de seguridad si algún día el entorno de build
// (Vercel, Netlify, lo que sea) no trae las variables VITE_*. Reemplázalas
// aquí si cambias de proyecto Supabase, y opcionalmente sigue usando
// variables de entorno para overridearlas en cada entorno.
const FALLBACK_URL = "";
const FALLBACK_KEY = "";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

export const supabaseReady = Boolean(SUPABASE_URL && SUPABASE_KEY);

// Si no hay configuración, exportamos null en vez de lanzar una excepción.
// Así la app entera nunca se queda en pantalla en blanco: las pantallas que
// necesiten datos reales simplemente muestran un aviso de "conecta tu base
// de datos" en vez de romper el árbol de React completo.
export const supabase: SupabaseClient | null = supabaseReady
  ? createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

if (!supabaseReady && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Nexus] Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en .env",
  );
}

