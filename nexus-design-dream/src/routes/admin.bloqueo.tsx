import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/hooks/use-auth";
import { getAdminStatus, createMasterToken, unlockVault } from "@/lib/vcore/admin.functions";
import { registrarPasskey, verificarPasskey, capturarVcoreBio } from "@/lib/vcore/biometria";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Fingerprint, ScanFace, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/bloqueo")({ ssr: false, component: Bloqueo });

function Bloqueo() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ hasMaster: boolean } | null>(null);
  const [nuevoToken, setNuevoToken] = useState<string | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [bioNota, setBioNota] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminStatus().then((s) => {
      if (s.unlocked) { navigate({ to: "/admin" }); return; }
      setStatus(s);
    });
  }, []);

  const generar = async () => {
    setBusy(true);
    try {
      const r = await createMasterToken({ data: {} });
      if (!r.ok) return toast.error(r.error);
      setNuevoToken(r.token);
    } finally { setBusy(false); }
  };

  const desbloquear = async () => {
    setBusy(true);
    try {
      const r = await unlockVault({ data: { token: tokenInput, biometria: bioNota ?? undefined } });
      if (!r.ok) return toast.error("Tokenmaster inválido");
      toast.success("Bóveda abierta");
      navigate({ to: "/admin" });
    } finally { setBusy(false); }
  };

  const conPasskey = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setBusy(true);
    try {
      const { data: creds } = await supabase.from("admin_biometria").select("credential_id").eq("owner_id", user.id).eq("tipo", "passkey").eq("activo", true);
      const ids = (creds ?? []).map((c: any) => c.credential_id).filter(Boolean);
      if (ids.length === 0) {
        await registrarPasskey(user.id, user.email ?? "Administrador");
        toast.success("Passkey registrada en este dispositivo. Ahora úsala para verificar.");
        return;
      }
      const ok = await verificarPasskey(ids);
      if (ok) setBioNota((n) => (n ? `${n} + passkey` : "passkey"));
      toast[ok ? "success" : "error"](ok ? "Verificado con passkey" : "No se pudo verificar");
    } catch (e: any) {
      toast.error(e.message ?? "Passkey no disponible");
    } finally { setBusy(false); }
  };

  const conBio = async () => {
    setBusy(true);
    try {
      await capturarVcoreBio();
      setBioNota((n) => (n ? `${n} + rostro/voz` : "rostro/voz"));
      toast.success("Captura registrada para la auditoría");
    } catch {
      toast.error("No se pudo acceder a cámara/micrófono");
    } finally { setBusy(false); }
  };

  if (!status) return null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Shield className="h-10 w-10 text-primary" />
        <h1 className="font-display text-xl tracking-widest">BÓVEDA NEXUS</h1>
        <p className="text-sm text-muted-foreground">Acceso exclusivo del administrador maestro</p>
      </div>

      {!status.hasMaster ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generar Tokenmaster</CardTitle>
            <CardDescription>Se genera una sola vez. Solo se guarda su huella cifrada; el valor en claro se muestra aquí una única vez.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!nuevoToken ? (
              <Button className="w-full" disabled={busy} onClick={generar}>Generar mi Tokenmaster</Button>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-3 font-mono text-sm break-all">
                  {nuevoToken}
                  <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(nuevoToken); toast.success("Copiado"); }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-destructive">Cópialo ahora. No se volverá a mostrar.</p>
                <Button className="w-full" variant="outline" onClick={() => window.location.reload()}>
                  Ya lo copié, ir a desbloquear
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="text-base">Desbloquear</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Tokenmaster</Label>
              <Input type="password" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} placeholder="NXM-XXXXXX-XXXXXX-XXXXXX-XXXXXX" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" disabled={busy} onClick={conPasskey} className="gap-2"><Fingerprint className="h-4 w-4" /> Passkey</Button>
              <Button variant="outline" disabled={busy} onClick={conBio} className="gap-2"><ScanFace className="h-4 w-4" /> VCORE Bio</Button>
            </div>
            {bioNota && <p className="text-xs text-muted-foreground">Verificación adicional lista: {bioNota}</p>}
            <Button className="w-full" disabled={busy || !tokenInput} onClick={desbloquear}>Abrir bóveda</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
