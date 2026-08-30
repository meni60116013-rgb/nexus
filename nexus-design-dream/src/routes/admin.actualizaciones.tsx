import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, formatDate } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ETIQUETAS = ["nota", "mejora", "correccion", "aviso"];

export const Route = createFileRoute("/admin/actualizaciones")({ ssr: false, component: Actualizaciones });

function Actualizaciones() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ titulo: "", contenido: "", etiqueta: "nota" });

  const load = () => supabase.from("actualizaciones_admin").select("*").order("publicado_en", { ascending: false }).then(({ data }) => setRows(data ?? []));
  useEffect(() => { load(); }, []);

  const publicar = async () => {
    if (!form.titulo) return toast.error("Falta el título");
    const { error } = await supabase.from("actualizaciones_admin").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Publicado");
    setOpen(false);
    setForm({ titulo: "", contenido: "", etiqueta: "nota" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display tracking-wide">Novedades</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm">Publicar</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva novedad</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Título</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></div>
              <div><Label>Contenido</Label><Textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} /></div>
              <div>
                <Label>Etiqueta</Label>
                <Select value={form.etiqueta} onValueChange={(v) => setForm({ ...form, etiqueta: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ETIQUETAS.map((e) => <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={publicar}>Publicar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-3">
        {rows.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">{u.etiqueta}</Badge>
                <CardTitle className="text-sm">{u.titulo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{u.contenido}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDate(u.publicado_en)}</p>
            </CardContent>
          </Card>
        ))}
        {rows.length === 0 && <p className="text-sm text-muted-foreground">Sin novedades publicadas aún.</p>}
      </div>
    </div>
  );
}
