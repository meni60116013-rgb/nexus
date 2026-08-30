import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVcore, currency, orderTotal } from "@/lib/vcore/store";

export const Route = createFileRoute("/app/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes y flotas — VCORE Nexus" },
      {
        name: "description",
        content:
          "Directorio de clientes particulares y flotas del taller, con vehículos asociados y facturación acumulada.",
      },
      { property: "og:title", content: "Clientes y flotas — VCORE Nexus" },
      {
        property: "og:description",
        content: "Gestiona clientes particulares y flotas de micromovilidad desde un solo lugar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Clients,
});

function Clients() {
  const { state, addClient } = useVcore();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "particular" as "particular" | "flota",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    addClient(form);
    setForm({ name: "", phone: "", email: "", type: "particular" });
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">CRM del taller</p>
        <h1 className="mt-1 text-4xl">Clientes</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {state.clients.map((c) => {
            const vehicles = state.vehicles.filter((v) => v.clientId === c.id);
            const billed = state.orders
              .filter((o) => o.clientId === c.id)
              .reduce((s, o) => s + orderTotal(o), 0);
            return (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl">{c.name}</h2>
                    <Badge variant={c.type === "flota" ? "default" : "secondary"}>{c.type}</Badge>
                    <span className="ml-auto font-mono text-sm">{currency(billed)}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {c.phone} · {c.email}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {vehicles.length} vehículo(s):{" "}
                    {vehicles.map((v) => `${v.brand} ${v.model}`).join(", ") || "—"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-2xl">Alta de cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={submit}>
              <div>
                <Label htmlFor="cn">Nombre</Label>
                <Input
                  id="cn"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cp">Teléfono</Label>
                <Input
                  id="cp"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ce">Correo</Label>
                <Input
                  id="ce"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as "particular" | "flota" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="flota">Flota / B2B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Guardar cliente
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
