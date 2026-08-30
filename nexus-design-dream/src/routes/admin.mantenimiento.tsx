import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase, formatDate } from "@/lib/adminNexus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/mantenimiento")({ ssr: false, component: Mantenimiento });

function Mantenimiento() {
  const [global, setGlobal] = useState<any>(null);
  const [mensaje, setMensaje] = useState("Estamos realizando mantenimiento del núcleo VCORE.");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("mantenimiento").select("*").is("taller_id", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    setGlobal(data);
    if (data?.mensaje) setMensaje(data.mensaje);
  };
  useEffect(() => { load(); }, []);

  const activar = async () => {
    setBusy(true);
    try {
      if (global) {
        await supabase.from("mantenimiento").update({ activo: true, mensaje, fin: null }).eq("id", global.id);
      } else {
        await supabase.from("mantenimiento").insert({ activo: true, mensaje, taller_id: null });
      }
      toast.success("Mantenimiento global activado");
      load();
    } finally { setBusy(false); }
  };

  const desactivar = async () => {
    if (!global) return;
    setBusy(true);
    try {
      await supabase.from("mantenimiento").update({ activo: false, fin: new Date().toISOString() }).eq("id", global.id);
      toast.success("Mantenimiento desactivado");
      load();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display tracking-wide">Mantenimiento</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Modo mantenimiento global</CardTitle>
          <CardDescription>Con esto activo, todos los talleres ven una pantalla de servicio en lugar de su panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={!!global?.activo} disabled={busy} onCheckedChange={(v) => (v ? activar() : desactivar())} />
            <Label>{global?.activo ? "Activo" : "Inactivo"}</Label>
          </div>
          <div>
            <Label>Mensaje para los talleres</Label>
            <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
          </div>
          {global?.activo && <Button size="sm" variant="outline" onClick={activar} disabled={busy}>Actualizar mensaje</Button>}
          {global?.inicio && <p className="text-xs text-muted-foreground">Desde: {formatDate(global.inicio?.slice(0, 10))}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
