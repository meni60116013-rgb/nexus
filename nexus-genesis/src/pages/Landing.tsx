import { Link } from "react-router-dom";
import { ArrowUpRight, Gauge, LineChart, Ruler } from "lucide-react";
import { Nav } from "@/components/Nav";
import { BlueprintChassis } from "@/components/BlueprintChassis";

const capabilities = [
  {
    icon: Ruler,
    title: "Piezas paramétricas",
    body: "Chasis, motor y carenado se ajustan entre sí: cambiar uno recalcula peso, costo y geometría de los demás.",
  },
  {
    icon: Gauge,
    title: "Simulación en vivo",
    body: "Arrastre aerodinámico, distribución de peso y velocidad máxima estimada, recalculados en cada decisión.",
  },
  {
    icon: LineChart,
    title: "Costo real desde el día uno",
    body: "Cada pieza lleva su precio de mercado. El presupuesto final aparece antes de dibujar el primer boceto.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Nav />

      <section className="blueprint-grid relative overflow-hidden border-b border-line/70">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="animate-rise">
            <p className="label-mono mb-4">Plataforma de ingeniería abierta</p>
            <h1 className="font-display text-6xl font-semibold leading-[0.98] sm:text-7xl">
              El chasis nace
              <br />
              <span className="text-cyan">en tu pantalla.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted">
              Nexus convierte el diseño de una motocicleta en un plano vivo:
              elegís cada pieza y el sistema recalcula geometría,
              aerodinámica y presupuesto al instante.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/configurador"
                className="inline-flex items-center gap-2 rounded-md bg-amber px-6 py-3 font-display text-lg tracking-wide text-background transition-transform hover:scale-[1.02]"
              >
                Abrir el configurador
                <ArrowUpRight className="h-5 w-5" />
              </Link>
              <span className="label-mono">120+ componentes reales</span>
            </div>
          </div>
          <BlueprintChassis className="w-full animate-rise" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-px overflow-hidden rounded-lg border border-line/70 bg-line/70 sm:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <article key={title} className="bg-background p-8">
              <Icon className="h-6 w-6 text-cyan" />
              <h2 className="mt-5 font-display text-xl">{title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line/70 bg-surface/60">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">
            Dibujá el prototipo antes de gastar en él.
          </h2>
          <p className="mt-5 text-muted">
            Sin cuenta, sin instalación. Abrí el configurador y armá tu
            primera versión en menos de dos minutos.
          </p>
          <Link
            to="/configurador"
            className="mt-9 inline-flex items-center gap-2 rounded-md border border-cyan/50 px-8 py-4 font-display text-lg tracking-wide text-cyan transition-colors hover:bg-cyan/10"
          >
            Empezar a diseñar
          </Link>
        </div>
      </section>

      <footer className="border-t border-line/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted">
          <span className="label-mono">Nexus · plataforma de diseño</span>
          <span className="label-mono">2026</span>
        </div>
      </footer>
    </div>
  );
}

