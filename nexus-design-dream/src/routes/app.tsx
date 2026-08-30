import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/vcore/AppShell";

export const Route = createFileRoute("/app")({
  // La sesión vive en el navegador, por eso el guard corre solo en cliente.
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}


export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div style={{ padding: "40px 20px", color: "#ffffff", backgroundColor: "#0a0a0a", minHeight: "100vh", textAlign: "center", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>Error al cargar el Panel Operativo</h2>
      <p style={{ color: "#ff6b6b", fontSize: "0.9rem", marginBottom: "20px" }}>{error?.message || "Fallo inesperado de ejecución en el servidor."}</p>
      <button 
        onClick={() => typeof window !== "undefined" && window.location.reload()}
        style={{ padding: "10px 24px", backgroundColor: "#ea580c", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
      >
        Reintentar
      </button>
    </div>
  );
}
