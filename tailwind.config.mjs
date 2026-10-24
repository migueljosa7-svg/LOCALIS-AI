/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        foreground: "#E2E8F0",
        surface: {
          DEFAULT: "#111827",
          elevated: "#0E1420",
          card: "#131B2A",
        },
        // #94A3B8 sobre #0B0F17 = contraste 7.4:1 (WCAG AAA para texto normal).
        muted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.08)",
        cyan: {
          DEFAULT: "#00F2FE",
          300: "#67F8FF",
          400: "#22E6F5",
          500: "#00F2FE",
          600: "#00C2CB",
          700: "#00939A",
        },
        cobalt: {
          DEFAULT: "#3B82F6",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        // Esmeralda: reservado a métricas operativas, "En vivo" y "Sin comisiones".
        emerald: {
          DEFAULT: "#10B981",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        glass: {
          DEFAULT: "rgba(17, 24, 39, 0.55)",
          border: "rgba(255, 255, 255, 0.10)",
          glow: "rgba(0, 242, 254, 0.4)",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      boxShadow: {
        glass: "0 10px 40px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        neonglow: "0 0 24px rgba(0, 242, 254, 0.35), 0 0 48px rgba(59, 130, 246, 0.18)",
        "cta": "0 10px 30px -10px rgba(0, 242, 254, 0.55)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(4%, -6%, 0) scale(1.06)" },
          "66%": { transform: "translate3d(-5%, 4%, 0) scale(0.96)" },
        },
        rise: {
          from: { transform: "translate3d(0, 14px, 0)" },
          to: { transform: "translate3d(0, 0, 0)" },
        },
        "fade-rise": {
          from: { opacity: "0", transform: "translate3d(0, 10px, 0)" },
          to: { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        ping2: {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
      animation: {
        drift: "drift 26s ease-in-out infinite",
        "drift-slow": "drift 34s ease-in-out infinite reverse",
        rise: "rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-rise": "fade-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        ping2: "ping2 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};
