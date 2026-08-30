import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { supabase, supabaseReady } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate("/panel");
  }

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mx-auto flex max-w-md flex-col justify-center px-6 py-24">
        <p className="label-mono">Acceso</p>
        <h1 className="mt-2 font-display text-3xl">Entrar al taller</h1>

        {!supabaseReady ? (
          <div className="mt-8 rounded-md border border-amber/40 bg-amber/10 p-4 text-sm">
            <p className="font-medium text-amber">La base de datos aún no está conectada.</p>
            <p className="mt-2 text-muted">
              Definí <code className="font-mono text-xs">VITE_SUPABASE_URL</code> y{" "}
              <code className="font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> en{" "}
              <code className="font-mono text-xs">.env</code> (mirá{" "}
              <code className="font-mono text-xs">.env.example</code>) y volvé a desplegar. La app
              no se rompe mientras tanto: esta pantalla simplemente espera esa configuración.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="label-mono mb-1 block" htmlFor="email">
                Correo
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-cyan"
              />
            </div>
            <div>
              <label className="label-mono mb-1 block" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-cyan"
              />
            </div>
            {error && <p className="text-sm text-amber">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-cyan py-2.5 font-display tracking-wide text-background transition-opacity disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

