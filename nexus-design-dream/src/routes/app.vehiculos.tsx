import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVcore, STATUS_LABEL } from "@/lib/vcore/store";
import { healthScore, predictService } from "@/lib/vcore/engines";
import type { Vehicle } from "@/lib/vcore/types";

export const Route = createFileRoute("/app/vehiculos")({
  head: () => ({
    meta: [
      { title: "Vehículos e historial — VCORE Nexus" },
      {
        name: "description",
        content:
          "Historial técnico por motocicleta, scooter o e-bike: kilometraje, salud del vehículo, servicios previos y próxima intervención.",
      },
      { property: "og:title", content: "Vehículos e historial — VCORE Nexus" },
      {
        property: "og:description",
        content: "Ficha técnica y salud de cada unidad conectada al núcleo VCORE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vehicles,
});

function Vehicles() {
  const { state, addVehicle } = useVcore();
  const [form, setForm] = useState({
    clientId: state.clients[0]?.id ?? "",
    brand: "",
    model: "",
    year: "2025",
    plate: "",
    vin: "",
    km: "0",
    kind: "motocicleta" as Vehicle["kind"],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand || !form.model) return;
    addVehicle({
      clientId: form.clientId,
      brand: form.brand,
      model: form.model,
      year: Number(form.year) || 2025,
      plate: form.plate,
      vin: form.vin,
      km: Number(form.km) || 0,
      kind: form.kind,
    });
    setForm({ ...form, brand: "", model: "", plate: "", vin: "", km: "0" });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">Historial técnico</p>
        <h1 className="mt-1 text-4xl">Vehículos</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {state.vehicles.map((v) => {
            const reading = state.telemetry.filter((t) => t.vehicleId === v.id).at(-1);
            const health = reading ? healthScore(reading) : 100;
            const pred = predictService(v, reading);
            const history = state.orders.filter((o) => o.vehicleId === v.id);
            const client = state.clients.find((c) => c.id === v.clientId);
            return (
              <Card key={v.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl">
                      {v.brand} {v.model} <span className="text-muted-foreground">{v.year}</span>
                    </h2>
                    <Badge variant="outline">{v.kind}</Badge>
                    <span className="ml-auto font-mono text-sm">{v.km.toLocaleString("es-MX")} km</span>
                  </div>
                  <p className="label-mono mt-2">
                    {v.plate} · VIN {v.vin} · {client?.name ?? "sin cliente"}
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Índice de salud</span>
                        <span>{health}%</span>
                      </div>
                      <Progress value={health} className="mt-2" />
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Próximo servicio en </span>
                      <span className="font-mono text-primary">{pred.remaining} km</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                    {history.map((o) => (
                      <p key={o.id}>
                        {o.folio} · {o.title} — {STATUS_LABEL[o.status]}
                      </p>
                    ))}
                    {history.length === 0 && <p>Sin historial de servicio.</p>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-2xl">Alta de vehículo</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <Label>Cliente</Label>
                <Select
                  value={form.clientId}
                  onValueChange={(v) => setForm({ ...form, clientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {state.clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="br">Marca</Label>
                  <Input
                    id="br"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="mo">Modelo</Label>
                  <Input
                    id="mo"
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="yr">Año</Label>
                  <Input
                    id="yr"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="km">Kilometraje</Label>
                  <Input
                    id="km"
                    type="number"
                    value={form.km}
                    onChange={(e) => setForm({ ...form, km: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pl">Placa</Label>
                <Input
                  id="pl"
                  value={form.plate}
                  onChange={(e) => setForm({ ...form, plate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={form.vin}
                  onChange={(e) => setForm({ ...form, vin: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.kind}
                  onValueChange={(v) => setForm({ ...form, kind: v as Vehicle["kind"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motocicleta">Motocicleta</SelectItem>
                    <SelectItem value="scooter">Scooter</SelectItem>
                    <SelectItem value="e-bike">E-bike</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Guardar vehículo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
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
