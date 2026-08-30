import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVcore, currency, orderTotal, STATUS_LABEL } from "@/lib/vcore/store";
import { workshopKpis, healthScore } from "@/lib/vcore/engines";
import type { OrderStatus } from "@/lib/vcore/types";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics del taller — VCORE Nexus" },
      {
        name: "description",
        content:
          "AnalyticsCore convierte la operación del taller en indicadores: ingresos, productividad, estado de flota y salud de vehículos.",
      },
      { property: "og:title", content: "Analytics del taller — VCORE Nexus" },
      {
        property: "og:description",
        content: "Indicadores B2B de operación, ingresos y flota sobre el núcleo VCORE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Analytics,
});

const STATUS_COLORS: Record<OrderStatus, string> = {
  abierta: "var(--chart-1)",
  en_proceso: "var(--chart-3)",
  espera_piezas: "var(--chart-4)",
  cerrada: "var(--chart-2)",
};

function Analytics() {
  const { state, resetDemo } = useVcore();
  const kpi = workshopKpis(state.orders);

  const byStatus = (Object.keys(STATUS_COLORS) as OrderStatus[]).map((s) => ({
    name: STATUS_LABEL[s],
    key: s,
    value: state.orders.filter((o) => o.status === s).length,
  }));

  const revenueByTech = Object.values(
    state.orders.reduce<Record<string, { tech: string; monto: number }>>((acc, o) => {
      acc[o.technician] ??= { tech: o.technician, monto: 0 };
      acc[o.technician]!.monto += orderTotal(o);
      return acc;
    }, {}),
  );

  const fleetHealth = state.vehicles.map((v) => {
    const r = state.telemetry.filter((t) => t.vehicleId === v.id).at(-1);
    return { name: `${v.brand} ${v.model}`, salud: r ? healthScore(r) : 100 };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono">Nivel 3 · Negocio</p>
          <h1 className="mt-1 text-4xl">Analytics</h1>
        </div>
        <Button variant="outline" size="sm" onClick={resetDemo}>
          Restablecer datos demo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Ingreso facturado", currency(kpi.revenue)],
          ["Ticket promedio", currency(kpi.ticket)],
          ["Horas técnicas", `${kpi.hours} h`],
          ["Órdenes cerradas", `${kpi.closed}/${kpi.total}`],
        ].map(([l, v]) => (
          <Card key={l}>
            <CardContent className="pt-6">
              <p className="label-mono">{l}</p>
              <p className="mt-2 font-display text-4xl">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Distribución de órdenes</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>
                  {byStatus.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Facturación por técnico</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByTech}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="tech" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="monto" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Salud de la flota</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetHealth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                  }}
                />
                <Bar dataKey="salud" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
