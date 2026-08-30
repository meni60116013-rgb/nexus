import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/adminNexus";
import { generarTokenCliente, cambiarEstadoToken } from "@/lib/vcore/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy } from "lucide-react";

const TIPOS = ["acceso", "licencia", "activacion", "invitacion"];

export const Route = createFileRoute("/admin/tokens")({ ssr: false, component: Tokens });

function Tokens() {
  const [rows, setRows] = useState<any[]>([]);
  const [talleres, setTalleres] = useState<any[]>([]);
  const [planes, setPlanes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [nuevo, setNuevo] = useState<string | null>(null);
  const [form, setForm] = useState({ tallerId: "", tipo: "acceso", etiqueta: "", dias: "365", maxDispositivos: "1", planId: "" });

  const load = () => supabase.from("tokens_cliente").select("*").order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => {
    load();
    supabase.from("profiles").select("id, nombre_taller, email").then(({ data }) => setTalleres(data ?? []));
    supabase.from("planes").select("id, nombre").then(({ data }) => setPlanes(data ?? []));
  }, []);

  const nombreTaller = (id: string) => talleres.find((t) => t.id === id)?.nombre_taller || talleres.find((t) => t.id === id)?.email || "—";

  const generar = async () => {
    if (!form.tallerId) return toast.error("Selecciona un taller");
    const r = await generarTokenCliente({
      data: {
        tallerId: form.tallerId, tipo: form.tipo, etiqueta: form.etiqueta,
        dias: Number(form.dias) || 0, maxDispositivos: Number(form.maxDispositivos) || 1,
        planId: form.planId || null,
      },
    });
    if (!r.ok) return toast.error(r.error);
    setNuevo(r.token);
    load();
  };

  const cambiar = async (id: string, estado: string) => {
    const r = await cambiarEstadoToken({ data: { id, estado } });
    if (!r.ok) return toast.error(r.error);
    toast.success(`Token ${estado}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display tracking-wide">Tokens de clientes</h1>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setNuevo(null); }}>
          <DialogTrigger asChild><Button size="sm">Generar token</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Generar token</DialogTitle></DialogHeader>
            {!nuevo ? (
              <div className="space-y-3">
                <div>
                  <Label>Taller</Label>
                  <Select value={form.tallerId} onValueChange={(v) => setForm({ ...form, tallerId: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecciona un taller" /></SelectTrigger>
                    <SelectContent>{talleres.map((t) => <SelectItem key={t.id} value={t.id}>{t.nombre_taller || t.email}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIPOS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Etiqueta (opcional)</Label><Input value={form.etiqueta} onChange={(e) => setForm({ ...form, etiqueta: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Vigencia (días, 0 = sin vencer)</Label><Input type="number" value={form.dias} onChange={(e) => setForm({ ...form, dias: e.target.value })} /></div>
                  <div><Label>Máx. dispositivos</Label><Input type="number" value={form.maxDispositivos} onChange={(e) => setForm({ ...form, maxDispositivos: e.target.value })} /></div>
                </div>
                <div>
                  <Label>Plan (opcional)</Label>
                  <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                    <SelectTrigger><SelectValue placeholder="Sin plan asociado" /></SelectTrigger>
                    <SelectContent>{planes.map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={generar}>Generar</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3 font-mono text-sm break-all">
                  {nuevo}
                  <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(nuevo); toast.success("Copiado"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">Cópialo ahora, no se volverá a mostrar.</p>
                <Button className="w-full" variant="outline" onClick={() => setOpen(false)}>Cerrar</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{rows.length} tokens</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Prefijo</TableHead><TableHead>Taller</TableHead><TableHead>Tipo</TableHead><TableHead>Estado</TableHead><TableHead>Vence</TableHead><TableHead>Usos</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>
              {rows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs">{t.prefijo}</TableCell>
                  <TableCell>{nombreTaller(t.taller_id)}</TableCell>
                  <TableCell className="capitalize">{t.tipo}</TableCell>
                  <TableCell><Badge variant={t.estado === "activo" ? "default" : "secondary"} className="capitalize">{t.estado}</Badge></TableCell>
                  <TableCell>{t.expira_en ? new Date(t.expira_en).toLocaleDateString("es-MX") : "Sin vencimiento"}</TableCell>
                  <TableCell>{t.usos}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    {t.estado !== "revocado" && <Button size="sm" variant="ghost" onClick={() => cambiar(t.id, "revocado")}>Revocar</Button>}
                    {t.estado === "activo" && <Button size="sm" variant="ghost" onClick={() => cambiar(t.id, "suspendido")}>Suspender</Button>}
                    {t.estado === "suspendido" && <Button size="sm" variant="ghost" onClick={() => cambiar(t.id, "activo")}>Reactivar</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">Sin tokens generados.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
