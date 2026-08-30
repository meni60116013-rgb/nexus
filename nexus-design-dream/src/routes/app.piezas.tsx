import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useVcore, currency } from "@/lib/vcore/store";

export const Route = createFileRoute("/app/piezas")({
  head: () => ({
    meta: [
      { title: "Catálogo de piezas e inventario — VCORE Nexus" },
      { name: "description", content: "PartsCatalogCore: inventario real del taller con existencias, mínimos, costo, precio y margen por refacción." },
    ],
  }),
  component: Parts,
});

const emptyForm = { sku: "", name: "", category: "General", stock: "0", minStock: "0", cost: "0", price: "0" };

function Parts() {
  const { state, addPart, isAddingPart } = useVcore();
  const [form, setForm] = useState(emptyForm);
  const value = state.parts.reduce((s, p) => s + p.stock * p.cost, 0);
  const low = state.parts.filter((p) => p.stock <= p.minStock);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name) return;
    addPart({
      sku: form.sku, name: form.name, category: form.category,
      stock: Number(form.stock) || 0, minStock: Number(form.minStock) || 0,
      cost: Number(form.cost) || 0, price: Number(form.price) || 0,
    });
    setForm(emptyForm);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">PartsCatalogCore</p>
        <h1 className="mt-1 text-4xl">Piezas e inventario</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Valor de inventario", currency(value)], ["SKUs activos", String(state.parts.length)], ["Bajo mínimo", String(low.length)]].map(([l, v]) => (
          <Card key={l}>
            <CardContent className="pt-6">
              <p className="label-mono">{l}</p>
              <p className="mt-2 font-display text-4xl">{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle className="text-2xl">Catálogo</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead><TableHead>Pieza</TableHead><TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock</TableHead><TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Precio</TableHead><TableHead className="text-right">Margen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.parts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right">{p.stock <= p.minStock ? <Badge variant="destructive">{p.stock}</Badge> : p.stock}</TableCell>
                    <TableCell className="text-right font-mono">{currency(p.cost)}</TableCell>
                    <TableCell className="text-right font-mono">{currency(p.price)}</TableCell>
                    <TableCell className="text-right font-mono text-primary">{p.price ? Math.round(((p.price - p.cost) / p.price) * 100) : 0}%</TableCell>
                  </TableRow>
                ))}
                {state.parts.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sin piezas todavía.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader><CardTitle className="text-2xl">Nueva pieza</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={submit}>
              <div><Label htmlFor="sku">SKU</Label><Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label htmlFor="name">Nombre</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label htmlFor="cat">Categoría</Label><Input id="cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
                <div><Label htmlFor="min">Mínimo</Label><Input id="min" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="cost">Costo</Label><Input id="cost" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
                <div><Label htmlFor="price">Precio</Label><Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              </div>
              <Button type="submit" className="w-full" disabled={isAddingPart}>Agregar al inventario</Button>
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
