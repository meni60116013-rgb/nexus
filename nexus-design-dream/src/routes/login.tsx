import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Acceso al taller — VCORE Nexus" },
      {
        name: "description",
        content:
          "Inicia sesión o registra tu taller para acceder al panel VCORE Mobile Workshop con datos privados por taller.",
      },
      { property: "og:title", content: "Acceso al taller — VCORE Nexus" },
      {
        property: "og:description",
        content: "Autenticación de talleres para la suite VCORE Nexus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [taller, setTaller] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.session.user.id).maybeSingle();
        void navigate({ to: profile?.is_admin ? "/admin" : "/app" });
      }
    });
  }, [navigate]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Sesión iniciada");
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user.id;
    let destino: "/admin" | "/app" = "/app";
    if (uid) {
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", uid).maybeSingle();
      if (profile?.is_admin) destino = "/admin";
    }
    void navigate({ to: destino });
  };

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { nombre_taller: taller || "Mi taller" },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Taller registrado. Si se requiere confirmación, revisa tu correo.");
    const { data } = await supabase.auth.getSession();
    if (data.session) {
        const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.session.user.id).maybeSingle();
        void navigate({ to: profile?.is_admin ? "/admin" : "/app" });
      }
  };

  return (
    <main className="blueprint-grid flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="label-mono">
          ← Volver al sitio
        </Link>
        <h1 className="mt-4 font-display text-5xl tracking-[0.12em]">VCORE NEXUS</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acceso al panel operativo del taller. Cada taller ve únicamente sus propios datos.
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Acceso</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="w-full">
                <TabsTrigger className="flex-1" value="login">
                  Iniciar sesión
                </TabsTrigger>
                <TabsTrigger className="flex-1" value="signup">
                  Registrar taller
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <form className="space-y-4" onSubmit={login}>
                  <div>
                    <Label htmlFor="le">Correo</Label>
                    <Input
                      id="le"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lp">Contraseña</Label>
                    <Input
                      id="lp"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Entrar al panel
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form className="space-y-4" onSubmit={signup}>
                  <div>
                    <Label htmlFor="st">Nombre del taller</Label>
                    <Input
                      id="st"
                      value={taller}
                      onChange={(e) => setTaller(e.target.value)}
                      placeholder="Taller Nexus Centro"
                    />
                  </div>
                  <div>
                    <Label htmlFor="se">Correo</Label>
                    <Input
                      id="se"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sp">Contraseña</Label>
                    <Input
                      id="sp"
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    Crear taller
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
