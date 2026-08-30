import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Building2, Package, Receipt, RefreshCcw, BarChart3, Megaphone, KeyRound, Wrench, ScrollText, LogOut, Lock } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase, signOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { getAdminStatus, lockVault } from "@/lib/vcore/admin.functions";

const NAV = [
  { to: "/admin", label: "Panel", icon: LayoutDashboard, exact: true },
  { to: "/admin/talleres", label: "Talleres", icon: Building2, exact: false },
  { to: "/admin/productos", label: "Planes", icon: Package, exact: false },
  { to: "/admin/tokens", label: "Tokens", icon: KeyRound, exact: false },
  { to: "/admin/pagos", label: "Pagos", icon: Receipt, exact: false },
  { to: "/admin/suscripciones", label: "Suscripciones", icon: RefreshCcw, exact: false },
  { to: "/admin/analiticas", label: "Analíticas", icon: BarChart3, exact: false },
  { to: "/admin/actualizaciones", label: "Novedades", icon: Megaphone, exact: false },
  { to: "/admin/mantenimiento", label: "Mantenimiento", icon: Wrench, exact: false },
  { to: "/admin/auditoria", label: "Auditoría", icon: ScrollText, exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getAdminStatus().then((s) => {
      if (!mounted) return;
      setUnlocked(s.unlocked);
      if (!s.unlocked && location.pathname !== "/admin/bloqueo") {
        navigate({ to: "/admin/bloqueo" });
      }
    });
    return () => { mounted = false; };
  }, [location.pathname]);

  const cerrarBoveda = async () => {
    await lockVault();
    navigate({ to: "/admin/bloqueo" });
  };

  if (unlocked === null) return null;
  if (!unlocked && location.pathname !== "/admin/bloqueo") return null;

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar lg:block">
        <div className="border-b border-border px-5 py-4">
          <p className="font-display text-xl tracking-[0.25em] text-sidebar-foreground">NEXUS</p>
          <p className="text-xs text-muted-foreground">Panel administrador</p>
        </div>
        {unlocked && (
          <nav className="mt-3 space-y-1 px-3">
            {NAV.map(({ to, label, icon: Icon, exact }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact }}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeProps={{ className: "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-primary font-semibold" }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}
        <div className="absolute bottom-4 left-3 right-3 space-y-1">
          {unlocked && (
            <Button size="sm" variant="ghost" className="w-full justify-start gap-2" onClick={cerrarBoveda}>
              <Lock className="h-4 w-4" /> Cerrar bóveda
            </Button>
          )}
          <Button size="sm" variant="ghost" className="w-full justify-start gap-2" onClick={async () => { await signOut(); navigate({ to: "/login" }); }}>
            <LogOut className="h-4 w-4" /> Salir
          </Button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
          <p className="font-display tracking-widest">NEXUS ADMIN</p>
          <Button size="sm" variant="ghost" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}>
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        {unlocked && (
          <nav className="flex overflow-x-auto border-b border-border bg-sidebar px-2 py-1 lg:hidden">
            {NAV.map(({ to, label, exact }) => (
              <Link key={to} to={to} activeOptions={{ exact }} className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs text-muted-foreground" activeProps={{ className: "whitespace-nowrap rounded-md px-3 py-1.5 text-xs bg-sidebar-accent text-sidebar-primary font-semibold" }}>
                {label}
              </Link>
            ))}
          </nav>
        )}
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
