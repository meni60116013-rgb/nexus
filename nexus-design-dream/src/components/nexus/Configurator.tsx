import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type OptionGroup = {
  id: "frame" | "engine" | "fairing";
  label: string;
  options: { id: string; name: string; cost: number; weight: number; cx: number }[];
};

const GROUPS: OptionGroup[] = [
  {
    id: "frame",
    label: "Chasis",
    options: [
      { id: "steel", name: "Trellis acero", cost: 1200, weight: 14, cx: 0.06 },
      { id: "alu", name: "Aluminio 7075", cost: 2600, weight: 9, cx: 0.04 },
      { id: "carbon", name: "Monocasco carbono", cost: 6400, weight: 6, cx: 0.03 },
    ],
  },
  {
    id: "engine",
    label: "Motor",
    options: [
      { id: "single", name: "Monocilíndrico 450", cost: 3100, weight: 38, cx: 0.02 },
      { id: "twin", name: "Bicilíndrico 900", cost: 5800, weight: 52, cx: 0.03 },
      { id: "electric", name: "Eléctrico 120 kW", cost: 9200, weight: 62, cx: 0.01 },
    ],
  },
  {
    id: "fairing",
    label: "Carenado",
    options: [
      { id: "naked", name: "Naked", cost: 700, weight: 4, cx: 0.14 },
      { id: "street", name: "Semicarenado", cost: 1500, weight: 7, cx: 0.09 },
      { id: "race", name: "Carenado race", cost: 3300, weight: 11, cx: 0.05 },
    ],
  },
];

const currency = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export function Configurator() {
  const [selection, setSelection] = useState<Record<string, number>>({
    frame: 0,
    engine: 1,
    fairing: 1,
  });
  const [tuning, setTuning] = useState(55);

  const picked = GROUPS.map((g) => g.options[selection[g.id] ?? 0]!);

  const stats = useMemo(() => {
    const cost = picked.reduce((a, o) => a + o.cost, 0) + tuning * 42;
    const weight = 88 + picked.reduce((a, o) => a + o.weight, 0) - tuning * 0.12;
    const cd = picked.reduce((a, o) => a + o.cx, 0) - tuning * 0.0006;
    const topSpeed = Math.round(95 + (tuning * 0.9) / Math.max(cd, 0.05) / 6);
    return { cost, weight, cd, topSpeed };
  }, [picked, tuning]);

  const drag = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const speed = 40 + i * 20;
        return {
          speed,
          arrastre: Math.round(0.5 * 1.2 * stats.cd * 2.1 * Math.pow(speed / 3.6, 2)),
        };
      }),
    [stats.cd],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="label-mono">Editor visual · demo</p>
        <h3 className="mt-2 text-3xl">Configura tu prototipo</h3>

        <div className="mt-6 space-y-6">
          {GROUPS.map((group) => (
            <div key={group.id}>
              <p className="label-mono mb-2">{group.label}</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {group.options.map((opt, i) => {
                  const active = selection[group.id] === i;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setSelection((s) => ({ ...s, [group.id]: i }))}
                      className={`rounded-md border px-3 py-3 text-left text-sm transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <span className="block font-semibold">{opt.name}</span>
                      <span className="font-mono text-xs opacity-70">{currency(opt.cost)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <div className="mb-3 flex items-baseline justify-between">
              <p className="label-mono">Nivel de afinación</p>
              <span className="font-mono text-sm text-primary">{tuning}%</span>
            </div>
            <Slider value={[tuning]} onValueChange={(v) => setTuning(v[0] ?? 0)} min={0} max={100} step={1} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="label-mono">Simulación aerodinámica</p>
          <h3 className="mt-2 text-3xl">Arrastre vs. velocidad</h3>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={drag} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="ember" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="speed" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} N`, "Arrastre"]}
                  labelFormatter={(l) => `${l} km/h`}
                />
                <Area
                  type="monotone"
                  dataKey="arrastre"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#ember)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["Cx estimado", stats.cd.toFixed(3)],
              ["Peso seco", `${stats.weight.toFixed(0)} kg`],
              ["Vel. máx.", `${stats.topSpeed} km/h`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-md border border-border bg-secondary/40 px-3 py-2">
                <p className="label-mono">{k}</p>
                <p className="mt-1 font-mono text-lg text-foreground">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <p className="label-mono">Resumen de costos</p>
          <ul className="mt-4 space-y-2 text-sm">
            {GROUPS.map((g, i) => (
              <li key={g.id} className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">
                  {g.label} · {picked[i]!.name}
                </span>
                <span className="font-mono">{currency(picked[i]!.cost)}</span>
              </li>
            ))}
            <li className="flex justify-between border-b border-border/60 pb-2">
              <span className="text-muted-foreground">Afinación y validación</span>
              <span className="font-mono">{currency(tuning * 42)}</span>
            </li>
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="label-mono">Costo unitario estimado</span>
            <span className="font-display text-4xl text-ember">{currency(stats.cost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
