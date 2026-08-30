import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { supabase, supabaseReady } from "@/lib/supabase";

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setChecked(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/login");
        return;
      }
      setEmail(data.session.user.email ?? null);
      setChecked(true);
    });
  }, [navigate]);

  if (!checked) return null;

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-4xl px-6 py-16">
        <p className="label-mono">Panel</p>
        <h1 className="mt-2 font-display text-3xl">
          {supabaseReady ? `Hola, ${email}` : "Panel de control"}
        </h1>
        {!supabaseReady && (
          <p className="mt-4 text-muted">
            Conectá Supabase (ver <code className="font-mono text-xs">.env.example</code>) para
            activar cuentas reales, órdenes y datos persistentes en este panel.
          </p>
        )}
      </section>
    </div>
  );
}

