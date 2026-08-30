import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B1114",
        surface: "#101A1E",
        surface2: "#16232A",
        line: "#22343B",
        foreground: "#EDEAE3",
        muted: "#8FA3AA",
        cyan: {
          DEFAULT: "#4FD8E0",
          dim: "#2C6E73",
        },
        amber: {
          DEFAULT: "#FF7A18",
          dim: "#8A4210",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(79,216,224,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(79,216,224,0.06) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
      keyframes: {
        draw: {
          from: { strokeDashoffset: "1400" },
          to: { strokeDashoffset: "0" },
        },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        draw: "draw 2.4s ease-out forwards",
        rise: "rise 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;

