import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Bike,
  Activity,
  Ruler,
  BarChart3,
  Package,
  Menu,
  X,
  CloudOff,
  Cloud,
  LogOut,
  Database,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useVcore } from "@/lib/vcore/store";
import { useAuth, signOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/app", label: "Panel", icon: LayoutDashboard, exact: true },
  { to: "/app/ordenes", label: "Órdenes", icon: ClipboardList, exact: false },
  { to: "/app/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/app/vehiculos", label: "Vehículos", icon: Bike, exact: false },
  { to: "/app/diagnostico", label: "Diagnóstico", icon: Activity, exact: false },
  { to: "/app/ingenieria", label: "Ingeniería", icon: Ruler, exact: false },
  { to: "/app/piezas", label: "Piezas", icon: Package, exact: false },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3, exact: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, syncAll, isSyncing, loadDemoData, isLoadingDemo } = useVcore();
  const pending = state.orders.filter((o) => !o.synced).length;
  const empty = state.clients.length === 0 && state.orders.length === 0;


  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[248px_1fr]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar transition-transform lg:static lg:w-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Link to="/" className="font-display text-xl tracking-[0.25em] text-sidebar-foreground">
            VCORE
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="px-5 pt-4 label-mono">Micro-núcleo Nexus</p>
        <nav className="mt-3 space-y-1 px-3 pb-6">
          {NAV.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              activeProps={{
                className:
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm bg-sidebar-accent text-sidebar-primary font-semibold",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mx-3 rounded-md border border-border p-3">
          <div className="flex items-center gap-2 text-xs">
            {pending ? (
              <CloudOff className="h-4 w-4 text-primary" />
            ) : (
              <Cloud className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">
              {pending ? `${pending} órdenes sin sincronizar` : "Todo sincronizado"}
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full"
            disabled={!pending || isSyncing}
            onClick={syncAll}
          >
            {isSyncing ? "Sincronizando…" : "Sincronizar núcleo"}
          </Button>
          {empty && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              disabled={isLoadingDemo}
              onClick={loadDemoData}
            >
              <Database className="mr-2 h-4 w-4" />
              Cargar datos de ejemplo
            </Button>
          )}
        </div>

      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <div className="min-w-0">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </button>
          <span className="label-mono">Suite VCORE Nexus · Mobile Workshop</span>
          <span className="ml-auto hidden max-w-[220px] truncate text-xs text-muted-foreground sm:inline">
            {user?.email}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              await signOut();
              void navigate({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Salir
          </Button>

        </header>
        <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
