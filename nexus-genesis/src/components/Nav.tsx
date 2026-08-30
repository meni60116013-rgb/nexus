import { Link } from "react-router-dom";

export function Nav() {
  return (
    <header className="border-b border-line/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="font-display text-xl tracking-[0.3em] text-foreground">
          NEXUS
        </Link>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <Link to="/configurador" className="transition-colors hover:text-foreground">
            Configurador
          </Link>
          <Link
            to="/login"
            className="rounded-md border border-cyan/40 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan transition-colors hover:bg-cyan/10"
          >
            Acceder
          </Link>
        </nav>
      </div>
    </header>
  );
}

