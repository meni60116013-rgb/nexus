import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function DragChart({ dragCoefficient }: { dragCoefficient: number }) {
  const data = Array.from({ length: 9 }, (_, i) => {
    const speed = i * 25; // km/h
    const drag = Math.round(dragCoefficient * speed * speed * 0.18);
    return { speed, drag };
  });

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="dragFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4FD8E0" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4FD8E0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="speed"
          tick={{ fill: "#8FA3AA", fontSize: 10 }}
          axisLine={{ stroke: "#22343B" }}
          tickLine={false}
          unit=" km/h"
        />
        <YAxis
          tick={{ fill: "#8FA3AA", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={30}
        />
        <Tooltip
          contentStyle={{
            background: "#101A1E",
            border: "1px solid #22343B",
            borderRadius: 6,
            fontSize: 12,
          }}
          labelFormatter={(v) => `${v} km/h`}
          formatter={(v: number) => [`${v} N`, "Arrastre"]}
        />
        <Area
          type="monotone"
          dataKey="drag"
          stroke="#4FD8E0"
          strokeWidth={2}
          fill="url(#dragFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

