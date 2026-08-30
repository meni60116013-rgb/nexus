import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Configurator } from "@/components/nexus/Configurator";
import { aeroAnalysis, suspensionSetup } from "@/lib/vcore/engines";

export const Route = createFileRoute("/app/ingenieria")({
  head: () => ({
    meta: [
      { title: "Módulos de ingeniería — VCORE Nexus" },
      {
        name: "description",
        content:
          "SuspensionCore, AerodynamicsCore y FrameDesignCore: cálculo de sag, constante de resorte, arrastre aerodinámico y configuración de chasis.",
      },
      { property: "og:title", content: "Módulos de ingeniería — VCORE Nexus" },
      {
        property: "og:description",
        content: "Ingeniería aplicada: suspensión, aerodinámica y diseño de chasis en el núcleo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Engineering,
});

function Engineering() {
  const [rider, setRider] = useState(78);
  const [bike, setBike] = useState(165);
  const [travel, setTravel] = useState(120);
  const [usage, setUsage] = useState(3);
  const sus = suspensionSetup(rider, bike, travel, usage);

  const [cd, setCd] = useState(0.62);
  const [area, setArea] = useState(0.58);
  const [speed, setSpeed] = useState(110);
  const aero = aeroAnalysis(cd, area, speed, rider + bike);

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">Engineering Cores</p>
        <h1 className="mt-1 text-4xl">Ingeniería aplicada</h1>
      </div>

      <Tabs defaultValue="suspension">
        <TabsList>
          <TabsTrigger value="suspension">Suspensión</TabsTrigger>
          <TabsTrigger value="aero">Aerodinámica</TabsTrigger>
          <TabsTrigger value="chasis">Chasis</TabsTrigger>
        </TabsList>

        <TabsContent value="suspension" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl">SuspensionCore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderField label="Peso del piloto" value={rider} unit="kg" min={45} max={140} onChange={setRider} />
                <SliderField label="Peso de la moto" value={bike} unit="kg" min={70} max={320} onChange={setBike} />
                <SliderField label="Recorrido" value={travel} unit="mm" min={70} max={300} onChange={setTravel} />
                <SliderField label="Exigencia de uso" value={usage} unit="/5" min={1} max={5} onChange={setUsage} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Configuración sugerida</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Sag objetivo", `${sus.sagMm} mm`],
                  ["Constante de resorte", `${sus.springRate} N/mm`],
                  ["Precarga", `${sus.preloadMm} mm`],
                  ["Amortiguación", `${sus.dampingClicks} clicks`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-md border border-border p-5">
                    <p className="label-mono">{l}</p>
                    <p className="mt-2 font-display text-4xl text-primary">{v}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aero" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl">AerodynamicsCore</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <SliderField label="Coeficiente Cd" value={cd} unit="" min={0.3} max={1.1} step={0.01} onChange={setCd} />
                <SliderField label="Área frontal" value={area} unit="m²" min={0.3} max={1.2} step={0.01} onChange={setArea} />
                <SliderField label="Velocidad" value={speed} unit="km/h" min={40} max={220} onChange={setSpeed} />
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    ["Arrastre", `${aero.dragN} N`],
                    ["Rodadura", `${aero.rollingN} N`],
                    ["Potencia", `${aero.powerHp} hp`],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <p className="label-mono">{l}</p>
                      <p className="font-mono text-lg text-primary">{v}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Curva de arrastre y potencia</CardTitle>
              </CardHeader>
              <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={aero.curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="kmh" stroke="var(--muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="drag"
                      name="Arrastre (N)"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.18}
                    />
                    <Area
                      type="monotone"
                      dataKey="hp"
                      name="Potencia (hp)"
                      stroke="var(--chart-2)"
                      fill="var(--chart-2)"
                      fillOpacity={0.12}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chasis" className="mt-6">
          <Configurator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SliderField({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="font-mono text-sm text-primary">
          {value} {unit}
        </span>
      </div>
      <Slider
        className="mt-3"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v ?? min)}
      />
    </div>
  );
}
