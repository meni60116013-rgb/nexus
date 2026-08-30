import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVcore, currency, orderTotal, STATUS_LABEL } from "@/lib/vcore/store";
import { runDiagnostics, workshopKpis, healthScore, predictService } from "@/lib/vcore/engines";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Panel operativo — VCORE Mobile Workshop" },
      {
        name: "description",
        content:
          "Panel del taller digital VCORE: órdenes activas, alertas de telemetría, ingresos y estado de sincronización offline-first.",
      },
      { property: "og:title", content: "Panel operativo — VCORE Mobile Workshop" },
      {
        property: "og:description",
        content: "Órdenes, telemetría, mantenimiento predictivo y analítica del taller en un panel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useVcore();
  const kpi = workshopKpis(state.orders);

  const alerts = state.telemetry
    .flatMap((r) =>
      runDiagnostics(r)
        .filter((f) => f.severity !== "ok")
        .map((f) => ({ ...f, reading: r })),
    )
    .sort((a, b) => (a.severity === "critico" ? -1 : 1))
    .slice(0, 5);

  const vehicleName = (id: string) => {
    const v = state.vehicles.find((x) => x.id === id);
    return v ? `${v.brand} ${v.model} · ${v.plate}` : id;
  };

  const nextServices = state.vehicles
    .map((v) => ({
      v,
      p: predictService(
        v,
        state.telemetry.filter((t) => t.vehicleId === v.id).at(-1),
      ),
    }))
    .sort((a, b) => a.p.remaining - b.p.remaining)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">Nivel 1 · Producto</p>
        <h1 className="mt-1 text-4xl">Panel del taller</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Órdenes activas", String(kpi.open), `${kpi.total} totales`],
          ["Ingreso cerrado", currency(kpi.revenue), `Ticket ${currency(kpi.ticket)}`],
          ["Pipeline", currency(kpi.pipeline), `${kpi.hours} h de mano de obra`],
          ["Pendiente de sync", String(kpi.pendingSync), "cambios locales"],
        ].map(([label, value, hint]) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="label-mono">{label}</p>
              <p className="mt-2 font-display text-4xl">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Órdenes recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {state.orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                to="/app/ordenes"
                className="flex flex-wrap items-center gap-3 rounded-md border border-border p-3 transition-colors hover:bg-accent/40"
              >
                <span className="font-mono text-xs text-primary">{o.folio}</span>
                <span className="text-sm">{o.title}</span>
                <span className="text-xs text-muted-foreground">{vehicleName(o.vehicleId)}</span>
                <span className="ml-auto flex items-center gap-2">
                  <Badge variant={o.status === "cerrada" ? "secondary" : "default"}>
                    {STATUS_LABEL[o.status]}
                  </Badge>
                  <span className="font-mono text-sm">{currency(orderTotal(o))}</span>
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Alertas de telemetría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((a, i) => (
              <div key={`${a.code}-${i}`} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{a.title}</span>
                  <Badge variant={a.severity === "critico" ? "destructive" : "outline"}>
                    {a.severity}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {vehicleName(a.reading.vehicleId)} · salud {healthScore(a.reading)}%
                </p>
              </div>
            ))}
            {alerts.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin alertas abiertas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mantenimiento predictivo</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {nextServices.map(({ v, p }) => (
            <div key={v.id} className="rounded-md border border-border p-4">
              <p className="text-sm font-semibold">
                {v.brand} {v.model}
              </p>
              <p className="label-mono mt-1">{v.plate}</p>
              <p className="mt-3 font-display text-3xl text-primary">{p.remaining} km</p>
              <p className="text-xs text-muted-foreground">
                para servicio (intervalo {p.interval.toLocaleString("es-MX")} km)
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
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
