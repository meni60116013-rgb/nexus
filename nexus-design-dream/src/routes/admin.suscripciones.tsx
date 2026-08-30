import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, formatDate, daysUntil } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/suscripciones")({ ssr: false, component: Suscripciones });

function Suscripciones() {
  const [rows, setRows] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ taller_id: "", plan_id: "" });

  const load = () => supabase.from("suscripciones_taller").select("*").order("proximo_cobro", { ascending: true }).then(({ data }: { data: any }) => setRows(data ?? []));
  useEffect(() => {
    load();
    supabase.from("profiles").select("id, nombre_taller, email").then(({ data }: { data: any }) => setTalleres(data ?? []));
    supabase.from("planes").select("id, nombre").eq("activo", true).then(({ data }: { data: any }) => setPlanes(data ?? []));
  }, []);

  const nombreTaller = (id: string) => talleres.find((t) => t.id === id)?.nombre_taller || talleres.find((t) => t.id === id)?.email || "—";
  const nombrePlan = (id: string) => planes.find((p) => p.id === id)?.nombre || "—";

  const crear = async () => {
    if (!form.taller_id) return toast.error("Selecciona un taller");
    const { error } = await supabase.from("suscripciones_taller").insert({ taller_id: form.taller_id, plan_id: form.plan_id || null });
    if (error) return toast.error(error.message);
    toast.success("Suscripción creada");
    setOpen(false);
    load();
  };

  const estadoVisual = (s: any) => {
    if (s.estado !== "activa") return <Badge variant="outline" className="capitalize">{s.estado}</Badge>;
    const d = daysUntil(s.proximo_cobro);
    if (d < 0) return <Badge variant="destructive">Vencida</Badge>;
    if (d <= 7) return <Badge className="bg-amber-500 text-black">Por vencer ({d}d)</Badge>;
    return <Badge variant="secondary">Activa</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display tracking-wide">Suscripciones</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">Nueva suscripción</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva suscripción</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Taller</Label>
                <Select value={form.taller_id} onValueChange={(v) => setForm({ ...form, taller_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona taller" /></SelectTrigger>
                  <SelectContent>{talleres.map((t) => <SelectItem key={t.id} value={t.id}>{t.nombre_taller || t.email}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={form.plan_id} onValueChange={(v) => setForm({ ...form, plan_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecciona plan" /></SelectTrigger>
                  <SelectContent>{planes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={crear}>Guardar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm">{rows.length} suscripciones</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Taller</TableHead><TableHead>Plan</TableHead><TableHead>Próximo cobro</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{nombreTaller(s.taller_id)}</TableCell>
                  <TableCell>{nombrePlan(s.plan_id)}</TableCell>
                  <TableCell>{formatDate(s.proximo_cobro)}</TableCell>
                  <TableCell>{estadoVisual(s)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin suscripciones.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
