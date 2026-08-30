import { createFileRoute, Link } from "@tanstack/react-router";
import { Configurator } from "@/components/nexus/Configurator";
import heroImage from "@/assets/nexus-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nexus — Diseña tu moto desde cero" },
      {
        name: "description",
        content:
          "Nexus es la plataforma que democratiza el diseño de motocicletas: componentes, materiales, simulación aerodinámica y costos en un solo entorno visual.",
      },
      { property: "og:title", content: "Nexus — Diseña tu moto desde cero" },
      {
        property: "og:description",
        content:
          "Demo de la visión Nexus: editor visual, simulación aerodinámica y análisis de costos para diseñar una motocicleta completa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PILLARS = [
  {
    k: "01",
    t: "Diseño abierto",
    d: "Del ingeniero al entusiasta: cualquiera arma un chasis, elige materiales y define proporciones.",
  },
  {
    k: "02",
    t: "Simulación integrada",
    d: "Resistencia, aerodinámica y peso se recalculan en vivo con cada decisión de diseño.",
  },
  {
    k: "03",
    t: "Economía real",
    d: "Cada pieza lleva costo asociado; el proyecto muestra su viabilidad antes de fabricarse.",
  },
  {
    k: "04",
    t: "Ecosistema futuro",
    d: "Diseño colaborativo, marketplace de piezas y simulaciones avanzadas sobre la misma base.",
  },
];

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <span className="font-display text-2xl tracking-[0.3em]">VCORE NEXUS</span>
          <Link
            to="/app"
            className="rounded-md bg-primary px-4 py-2 font-display text-lg tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            ABRIR SUITE
          </Link>
        </div>
      </header>

      <section className="blueprint-grid relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="label-mono">Plataforma de diseño industrial</p>
            <h1 className="mt-4 text-6xl leading-[0.95] sm:text-7xl">
              Diseña tu moto <span className="text-ember">desde cero</span>
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground">
              Componentes, materiales y pruebas virtuales en un mismo lienzo. Lo que antes vivía
              dentro de las grandes fábricas, ahora se abre a cualquiera con una idea.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                ["+120", "piezas paramétricas"],
                ["3", "motores de simulación"],
                ["1", "lienzo compartido"],
              ].map(([n, l]) => (
                <div key={l}>
                  <p className="font-display text-4xl text-foreground">{n}</p>
                  <p className="label-mono">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImage}
              alt="Prototipo de motocicleta Nexus con superposición de plano técnico"
              width={1536}
              height={1024}
              className="w-full rounded-lg border border-border object-cover"
              style={{ boxShadow: "var(--shadow-ember)" }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Configurator />
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-px bg-border px-0 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <article key={p.k} className="bg-background p-8">
              <span className="font-mono text-sm text-primary">{p.k}</span>
              <h2 className="mt-4 text-2xl">{p.t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="blueprint-grid">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-5xl leading-tight sm:text-6xl">
            Sé parte del futuro del diseño con Nexus
          </h2>
          <p className="mt-5 text-muted-foreground">
            Este demo muestra la visión. El ecosistema completo —colaboración, marketplace y
            simulación avanzada— se está construyendo ahora.
          </p>
          <a
            href="mailto:meni60116013@gmail.com?subject=Quiero%20conocer%20Nexus"
            className="mt-9 inline-flex items-center justify-center rounded-md px-8 py-4 font-display text-2xl tracking-widest text-primary-foreground transition-transform hover:scale-[1.02]"
            style={{ backgroundImage: "var(--gradient-ember)", boxShadow: "var(--shadow-ember)" }}
          >
            SOLICITAR ACCESO
          </a>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="label-mono">Nexus · demo publicitario</span>
          <span className="label-mono">2026</span>
        </div>
      </footer>
    </main>
  );
}
