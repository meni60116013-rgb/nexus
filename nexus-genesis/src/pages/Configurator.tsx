import { useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { DragChart } from "@/components/DragChart";
import { cn, formatUSD } from "@/lib/utils";

type Option = { id: string; label: string; price: number; drag?: number; weight: number };

const CHASIS: Option[] = [
  { id: "trellis", label: "Trellis acero", price: 1200, weight: 42, drag: 1 },
  { id: "aluminio", label: "Aluminio 7075", price: 2600, weight: 30, drag: 0.95 },
  { id: "monocasco", label: "Monocasco carbono", price: 6400, weight: 19, drag: 0.88 },
];

const MOTOR: Option[] = [
  { id: "mono450", label: "Monocilíndrico 450", price: 3100, weight: 38 },
  { id: "bici900", label: "Bicilíndrico 900", price: 5800, weight: 54 },
  { id: "elec120", label: "Eléctrico 120 kW", price: 9200, weight: 61 },
];

const CARENADO: Option[] = [
  { id: "naked", label: "Naked", price: 700, weight: 6, drag: 1.15 },
  { id: "semi", label: "Semicarenado", price: 1500, weight: 9, drag: 0.92 },
  { id: "race", label: "Carenado race", price: 3300, weight: 11, drag: 0.74 },
];

function OptionGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div>
      <p className="label-mono mb-2">{title}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-md border px-3 py-3 text-left text-sm transition-colors",
              value === opt.id
                ? "border-cyan bg-cyan/10 text-foreground"
                : "border-line bg-surface text-muted hover:border-cyan/50",
            )}
          >
            <span className="block font-medium">{opt.label}</span>
            <span className="font-mono text-xs opacity-70">{formatUSD(opt.price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Configurator() {
  const [chasis, setChasis] = useState(CHASIS[0].id);
  const [motor, setMotor] = useState(MOTOR[1].id);
  const [carenado, setCarenado] = useState(CARENADO[1].id);
  const [tuning, setTuning] = useState(55);

  const picked = {
    chasis: CHASIS.find((o) => o.id === chasis)!,
    motor: MOTOR.find((o) => o.id === motor)!,
    carenado: CARENADO.find((o) => o.id === carenado)!,
  };

  const derived = useMemo(() => {
    const weight = picked.chasis.weight + picked.motor.weight + picked.carenado.weight + 44;
    const dragCoefficient = (picked.chasis.drag ?? 1) * (picked.carenado.drag ?? 1);
    const basePrice = picked.chasis.price + picked.motor.price + picked.carenado.price;
    const tuningCost = Math.round((tuning / 100) * 2800);
    const total = basePrice + tuningCost;
    const topSpeed = Math.round(220 - dragCoefficient * 55 - weight * 0.35);
    return { weight, dragCoefficient, total, tuningCost, topSpeed };
  }, [picked, tuning]);

  return (
    <div className="min-h-screen">
      <Nav />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="label-mono">Editor visual</p>
        <h1 className="mt-2 font-display text-4xl">Configura tu prototipo</h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="space-y-6 rounded-lg border border-line bg-surface p-6">
            <OptionGroup title="Chasis" options={CHASIS} value={chasis} onChange={setChasis} />
            <OptionGroup title="Motor" options={MOTOR} value={motor} onChange={setMotor} />
            <OptionGroup
              title="Carenado"
              options={CARENADO}
              value={carenado}
              onChange={setCarenado}
            />
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <p className="label-mono">Nivel de afinación</p>
                <span className="font-mono text-sm text-cyan">{tuning}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={tuning}
                onChange={(e) => setTuning(Number(e.target.value))}
                className="w-full accent-cyan"
                aria-label="Nivel de afinación"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="label-mono">Simulación aerodinámica</p>
              <h3 className="mt-1 font-display text-2xl">Arrastre vs. velocidad</h3>
              <div className="mt-4 h-52">
                <DragChart dragCoefficient={derived.dragCoefficient} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Cx estimado" value={derived.dragCoefficient.toFixed(2)} />
                <Stat label="Peso seco" value={`${derived.weight} kg`} />
                <Stat label="Vel. máx." value={`${derived.topSpeed} km/h`} />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface p-6">
              <p className="label-mono">Resumen de costos</p>
              <ul className="mt-4 space-y-2 text-sm">
                <Line label={`Chasis · ${picked.chasis.label}`} value={picked.chasis.price} />
                <Line label={`Motor · ${picked.motor.label}`} value={picked.motor.price} />
                <Line
                  label={`Carenado · ${picked.carenado.label}`}
                  value={picked.carenado.price}
                />
                <Line label="Afinación y validación" value={derived.tuningCost} />
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
                <span className="label-mono">Costo unitario estimado</span>
                <span className="font-display text-3xl text-amber">
                  {formatUSD(derived.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-background/60 px-3 py-2">
      <p className="label-mono">{label}</p>
      <p className="mt-1 font-mono text-lg">{value}</p>
    </div>
  );
}

function Line({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex justify-between border-b border-line/60 pb-2">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{formatUSD(value)}</span>
    </li>
  );
}

