import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVcore, useOrderParts, currency, orderTotal, STATUS_LABEL } from "@/lib/vcore/store";
import type { OrderStatus } from "@/lib/vcore/types";

export const Route = createFileRoute("/app/ordenes")({
  head: () => ({
    meta: [
      { title: "Órdenes de trabajo — VCORE Nexus" },
      { name: "description", content: "Órdenes de trabajo con BOM de piezas real, mano de obra y sincronización con Supabase." },
    ],
  }),
  component: Orders,
});

const STATUSES: OrderStatus[] = ["abierta", "en_proceso", "espera_piezas", "cerrada"];

function OrderBom({ ordenId, parts }: { ordenId: string; parts: ReturnType<typeof useVcore>["state"]["parts"] }) {
  const { lines, addLine, removeLine, isAdding } = useOrderParts(ordenId);
  const [piezaId, setPiezaId] = useState(parts[0]?.id ?? "");
  const [cantidad, setCantidad] = useState("1");

  const add = () => {
    const p = parts.find((x) => x.id === piezaId);
    if (!p) return;
    addLine(p.id, Number(cantidad) || 1, p.price);
    setCantidad("1");
  };

  return (
    <div className="mt-3 rounded-md border border-border p-3">
      <p className="label-mono mb-2">BOM · piezas usadas en esta orden</p>
      {lines.length === 0 && <p className="text-xs text-muted-foreground">Sin piezas agregadas.</p>}
      {lines.map((l) => (
        <div key={l.id} className="flex items-center justify-between border-b border-border/50 py-1 text-sm">
          <span>{l.cantidad}× {l.piezaNombre} <span className="text-muted-foreground">({l.piezaSku})</span></span>
          <div className="flex items-center gap-3">
            <span className="font-mono">{currency(l.cantidad * l.precioUnitario)}</span>
            <button className="text-xs text-destructive" onClick={() => removeLine(l.id)}>quitar</button>
          </div>
        </div>
      ))}
      {parts.length > 0 && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="w-48">
            <Select value={piezaId} onValueChange={setPiezaId}>
              <SelectTrigger><SelectValue placeholder="Pieza" /></SelectTrigger>
              <SelectContent>
                {parts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-20">
            <Input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
          </div>
          <Button size="sm" onClick={add} disabled={isAdding}>+ agregar</Button>
        </div>
      )}
    </div>
  );
}

function Orders() {
  const { state, addOrder, updateOrderStatus } = useVcore();
  const [filter, setFilter] = useState<"todas" | OrderStatus>("todas");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", vehicleId: state.vehicles[0]?.id ?? "", technician: "M. Rivas", laborHours: "2",
  });

  const list = state.orders.filter((o) => filter === "todas" || o.status === filter);
  const vehicle = (id: string) => state.vehicles.find((v) => v.id === id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = vehicle(form.vehicleId);
    if (!form.title || !v) return;
    addOrder({
      title: form.title, description: form.description, clientId: v.clientId, vehicleId: v.id,
      status: "abierta", technician: form.technician, laborHours: Number(form.laborHours) || 0,
      partsCost: 0, laborRate: 320,
    });
    setForm({ ...form, title: "", description: "" });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">Operación diaria</p>
        <h1 className="mt-1 text-4xl">Órdenes de trabajo</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["todas", ...STATUSES] as const).map((s) => (
              <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)}>
                {s === "todas" ? "Todas" : STATUS_LABEL[s]}
              </Button>
            ))}
          </div>

          {list.map((o) => {
            const v = vehicle(o.vehicleId);
            const isOpen = expanded === o.id;
            return (
              <Card key={o.id}>
                <CardContent className="space-y-3 pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-primary">{o.folio}</span>
                    <h2 className="text-xl">{o.title}</h2>
                    {!o.synced && <Badge variant="outline">pendiente de sync</Badge>}
                    <span className="ml-auto font-mono">{currency(orderTotal(o))}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{o.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span>{v ? `${v.brand} ${v.model} · ${v.plate}` : "—"}</span>
                    <span>Técnico: {o.technician}</span>
                    <span>{o.laborHours} h · piezas {currency(o.partsCost)}</span>
                    <button className="text-primary" onClick={() => setExpanded(isOpen ? null : o.id)}>
                      {isOpen ? "ocultar BOM" : "ver/editar BOM"}
                    </button>
                    <div className="ml-auto w-44">
                      <Select value={o.status} onValueChange={(val) => updateOrderStatus(o.id, val as OrderStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {isOpen && <OrderBom ordenId={o.id} parts={state.parts} />}
                </CardContent>
              </Card>
            );
          })}
          {list.length === 0 && <p className="text-sm text-muted-foreground">No hay órdenes en este estado.</p>}
        </div>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-2xl">Nueva orden</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div><Label htmlFor="title">Título</Label><Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Servicio menor 5,000 km" /></div>
              <div><Label htmlFor="desc">Descripción</Label><Textarea id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              <div>
                <Label>Vehículo</Label>
                <Select value={form.vehicleId} onValueChange={(v) => setForm({ ...form, vehicleId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    {state.vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} · {v.plate}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label htmlFor="hrs">Horas de mano de obra</Label><Input id="hrs" type="number" step="0.5" value={form.laborHours} onChange={(e) => setForm({ ...form, laborHours: e.target.value })} /></div>
              <div><Label htmlFor="tech">Técnico</Label><Input id="tech" value={form.technician} onChange={(e) => setForm({ ...form, technician: e.target.value })} /></div>
              <Button type="submit" className="w-full">Registrar orden</Button>
              <p className="text-[11px] text-muted-foreground">
                Las piezas se agregan después desde "ver/editar BOM" — el costo se calcula solo.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
