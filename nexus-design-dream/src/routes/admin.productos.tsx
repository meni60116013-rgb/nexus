import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, formatMoney } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/productos")({ ssr: false, component: Productos });

function Productos() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nombre: "", precio: "0", moneda: "MXN", periodo: "mensual" });

  const load = () => supabase.from("planes").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const crear = async () => {
    const { error } = await supabase.from("planes").insert({ nombre: form.nombre, precio: Number(form.precio) || 0, moneda: form.moneda, periodo: form.periodo });
    if (error) return toast.error(error.message);
    toast.success("Plan creado");
    setOpen(false);
    setForm({ nombre: "", precio: "0", moneda: "MXN", periodo: "mensual" });
    load();
  };

  const toggleActivo = async (id: string, activo: boolean) => {
    await supabase.from("planes").update({ activo: !activo }).eq("id", id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display tracking-wide">Planes / Productos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">Nuevo plan</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo plan</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nombre</Label><Input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
              <div><Label>Precio</Label><Input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} /></div>
              <div>
                <Label>Periodo</Label>
                <Select value={form.periodo} onValueChange={(v) => setForm({ ...form, periodo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={crear} disabled={!form.nombre}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">{rows.length} planes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Precio</TableHead><TableHead>Periodo</TableHead><TableHead>Activo</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.nombre}</TableCell>
                  <TableCell>{formatMoney(p.precio, p.moneda)}</TableCell>
                  <TableCell className="capitalize">{p.periodo}</TableCell>
                  <TableCell><Switch checked={p.activo} onCheckedChange={() => toggleActivo(p.id, p.activo)} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin planes aún.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
