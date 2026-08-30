import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, formatMoney, formatDate, toCsv, downloadCsv } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ESTADOS = ["pagado", "pendiente", "vencido", "reembolsado"];
const METODOS = ["transferencia", "efectivo", "tarjeta", "otro"];

export const Route = createFileRoute("/admin/pagos")({ ssr: false, component: Pagos });

function Pagos() {
  const [rows, setRows] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ taller_id: "", monto: "0", metodo: "transferencia", estado: "pagado", notas: "" });

  const load = () => supabase.from("pagos_admin").select("*").order("fecha", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    load();
    supabase.from("profiles").select("id, nombre_taller, email").then(({ data }) => setTalleres(data ?? []));
  }, []);

  const nombreTaller = (id: string) => talleres.find((t) => t.id === id)?.nombre_taller || talleres.find((t) => t.id === id)?.email || "—";

  const registrar = async () => {
    const { error } = await supabase.from("pagos_admin").insert({
      taller_id: form.taller_id || null, monto: Number(form.monto) || 0, metodo: form.metodo, estado: form.estado, notas: form.notas,
    });
    if (error) return toast.error(error.message);
    toast.success("Pago registrado");
    setOpen(false);
    setForm({ taller_id: "", monto: "0", metodo: "transferencia", estado: "pagado", notas: "" });
    load();
  };

  const filtered = filtroEstado === "todos" ? rows : rows.filter((r) => r.estado === filtroEstado);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-display tracking-wide">Pagos</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => downloadCsv("pagos.csv", toCsv(filtered))}>Exportar CSV</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm">Registrar pago</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Taller</Label>
                  <Select value={form.taller_id} onValueChange={(v) => setForm({ ...form, taller_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un taller" /></SelectTrigger>
                    <SelectContent>{talleres.map((t) => <SelectItem key={t.id} value={t.id}>{t.nombre_taller || t.email}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Monto</Label><Input type="number" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} /></div>
                <div>
                  <Label>Método</Label>
                  <Select value={form.metodo} onValueChange={(v) => setForm({ ...form, metodo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{METODOS.map((m) => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={(v) => setForm({ ...form, estado: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{ESTADOS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Notas</Label><Input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} /></div>
                <Button className="w-full" onClick={registrar}>Guardar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          {ESTADOS.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Card>
        <CardHeader><CardTitle className="text-sm">{filtered.length} pagos</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Folio</TableHead><TableHead>Taller</TableHead><TableHead>Monto</TableHead><TableHead>Fecha</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.folio}</TableCell>
                  <TableCell>{nombreTaller(p.taller_id)}</TableCell>
                  <TableCell>{formatMoney(p.monto, p.moneda)}</TableCell>
                  <TableCell>{formatDate(p.fecha)}</TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{p.estado}</Badge></TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin pagos.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
