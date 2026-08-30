import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useVcore } from "@/lib/vcore/store";
import { runDiagnostics, healthScore, predictService } from "@/lib/vcore/engines";

export const Route = createFileRoute("/app/diagnostico")({
  head: () => ({
    meta: [
      { title: "Diagnóstico y telemetría OBD-II — VCORE Nexus" },
      {
        name: "description",
        content:
          "DiagnosticsCore interpreta temperatura, presión de aceite, vibración, voltaje y códigos DTC para convertir telemetría en acciones de taller.",
      },
      { property: "og:title", content: "Diagnóstico y telemetría OBD-II — VCORE Nexus" },
      {
        property: "og:description",
        content: "De la lectura OBD-II al hallazgo accionable y al mantenimiento predictivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Diagnostics,
});

function Diagnostics() {
  const { state } = useVcore();
  const [selected, setSelected] = useState(state.telemetry[0]?.id ?? "");
  const reading = state.telemetry.find((t) => t.id === selected) ?? state.telemetry[0];

  if (!reading) return <p className="text-muted-foreground">Sin lecturas de telemetría.</p>;

  const vehicle = state.vehicles.find((v) => v.id === reading.vehicleId);
  const findings = runDiagnostics(reading);
  const health = healthScore(reading);
  const pred = vehicle ? predictService(vehicle, reading) : null;

  const metrics = [
    ["Temperatura", `${reading.engineTempC} °C`, reading.engineTempC >= 112],
    ["Presión aceite", `${reading.oilPressureBar.toFixed(1)} bar`, reading.oilPressureBar > 0 && reading.oilPressureBar < 1.8],
    ["Vibración", `${reading.vibrationG.toFixed(2)} G`, reading.vibrationG >= 1],
    ["RPM", reading.rpm.toLocaleString("es-MX"), false],
    ["Voltaje", `${reading.batteryV.toFixed(1)} V`, reading.batteryV < 12.4 && reading.batteryV < 20],
    ["Códigos DTC", reading.dtc.length ? reading.dtc.join(", ") : "ninguno", reading.dtc.length > 0],
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <p className="label-mono">DiagnosticsCore · TelemetrySchema</p>
        <h1 className="mt-1 text-4xl">Diagnóstico y telemetría</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {state.telemetry.map((t) => {
          const v = state.vehicles.find((x) => x.id === t.vehicleId);
          return (
            <Button
              key={t.id}
              size="sm"
              variant={t.id === reading.id ? "default" : "outline"}
              onClick={() => setSelected(t.id)}
            >
              {v ? `${v.brand} ${v.model}` : t.vehicleId}
              {t.sos && " · SOS"}
            </Button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Lectura en vivo — {vehicle ? `${vehicle.brand} ${vehicle.model}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {metrics.map(([label, value, bad]) => (
                <div
                  key={label}
                  className={`rounded-md border p-4 ${bad ? "border-destructive" : "border-border"}`}
                >
                  <p className="label-mono">{label}</p>
                  <p className={`mt-2 font-mono text-lg ${bad ? "text-destructive" : ""}`}>{value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Hallazgos del motor de diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {findings.map((f, i) => (
                <div key={`${f.code}-${i}`} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-xs text-primary">{f.code}</span>
                    <h3 className="text-lg">{f.title}</h3>
                    <Badge
                      className="ml-auto"
                      variant={
                        f.severity === "critico"
                          ? "destructive"
                          : f.severity === "aviso"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {f.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{f.detail}</p>
                  <p className="mt-2 text-sm">
                    <span className="label-mono">Acción · </span>
                    {f.action}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Índice de salud</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-6xl text-primary">{health}%</p>
              <Progress value={health} className="mt-3" />
              <p className="mt-3 text-xs text-muted-foreground">
                Calculado por el núcleo a partir de temperatura, presión, vibración, DTC y alertas SOS.
              </p>
            </CardContent>
          </Card>

          {pred && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Mantenimiento predictivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-display text-5xl">{pred.remaining} km</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Intervalo base {pred.interval.toLocaleString("es-MX")} km, ajustado por el estrés
                  detectado en telemetría.
                </p>
                <Badge className="mt-3" variant={pred.urgency === "ok" ? "secondary" : "destructive"}>
                  urgencia: {pred.urgency}
                </Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
