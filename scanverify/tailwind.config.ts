import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0B0D",
        surface: "#131519",
        surface2: "#1A1D22",
        line: "#262A30",
        paper: "#F4F2EC",
        muted: "#8D9199",
        signal: "#4FA6D8",
        signalSoft: "#284454",
        correct: "#5FBE8A",
        correctSoft: "#1C2A22",
        issue: "#D9695F",
        issueSoft: "#2C1E1C",
        warn: "#D9A94A",
        warnSoft: "#2B2419",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0,0,0,0.35)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 40px rgba(0,0,0,0.3)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        driftSlow: {
          "0%": { transform: "translate(0,0)" },
          "50%": { transform: "translate(2%, -2%)" },
          "100%": { transform: "translate(0,0)" },
        },
      },
      animation: {
        scanline: "scanline 2.2s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
        driftSlow: "driftSlow 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
