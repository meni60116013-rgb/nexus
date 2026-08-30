import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase, formatMoney } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/analiticas")({ ssr: false, component: Analiticas });

function monthKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function monthLabel(k: string) { const [y, m] = k.split("-"); return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("es-MX", { month: "short", year: "2-digit" }); }

function Analiticas() {
  const [pagos, setPagos] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("pagos_admin").select("*").then(({ data }) => setPagos(data ?? []));
    supabase.from("profiles").select("id, nombre_taller, email").then(({ data }) => setTalleres(data ?? []));
  }, []);

  const pagados = pagos.filter((p) => p.estado === "pagado");
  const totalIngresos = pagados.reduce((s, p) => s + Number(p.monto), 0);
  const tasaCobro = pagos.length ? Math.round((pagados.length / pagos.length) * 100) : 0;

  const byMonth = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) months.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
    return months.map((m) => ({
      mes: monthLabel(m),
      ingresos: pagados.filter((p) => monthKey(new Date(`${p.fecha}T00:00:00`)) === m).reduce((s, p) => s + Number(p.monto), 0),
    }));
  }, [pagados]);

  const porMetodo = useMemo(() => {
    const acc: Record<string, number> = {};
    pagados.forEach((p) => { acc[p.metodo] = (acc[p.metodo] ?? 0) + Number(p.monto); });
    return Object.entries(acc);
  }, [pagados]);

  const topTalleres = useMemo(() => {
    const acc: Record<string, number> = {};
    pagados.forEach((p) => { if (p.taller_id) acc[p.taller_id] = (acc[p.taller_id] ?? 0) + Number(p.monto); });
    return Object.entries(acc)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, total]) => ({ nombre: talleres.find((t) => t.id === id)?.nombre_taller || talleres.find((t) => t.id === id)?.email || "—", total }));
  }, [pagados, talleres]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display tracking-wide">Analíticas</h1>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Ingresos totales</p><p className="text-xl font-semibold">{formatMoney(totalIngresos)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Tasa de cobro</p><p className="text-xl font-semibold">{tasaCobro}%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pagos registrados</p><p className="text-xl font-semibold">{pagos.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Ingresos últimos 6 meses</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" fontSize={11} />
              <YAxis fontSize={11} width={50} />
              <Tooltip formatter={(v: number) => formatMoney(v)} />
              <Bar dataKey="ingresos" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Ingresos por método de pago</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {porMetodo.map(([m, total]) => (
              <div key={m} className="flex justify-between border-b border-border/60 pb-1 text-sm capitalize"><span>{m}</span><span className="font-medium">{formatMoney(total)}</span></div>
            ))}
            {porMetodo.length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Top talleres por ingreso</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {topTalleres.map((t) => (
              <div key={t.nombre} className="flex justify-between border-b border-border/60 pb-1 text-sm"><span>{t.nombre}</span><span className="font-medium">{formatMoney(t.total)}</span></div>
            ))}
            {topTalleres.length === 0 && <p className="text-sm text-muted-foreground">Sin datos.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
