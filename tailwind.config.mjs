/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F17",
        foreground: "#E2E8F0",
        surface: {
          DEFAULT: "#111827",
          elevated: "#1F2937",
          card: "#1A2332",
        },
        muted: "#94A3B8",
        border: "rgba(255, 255, 255, 0.1)",
        cyan: {
          DEFAULT: "#00F2FE",
          400: "#22D3EE",
          500: "#00F2FE",
          600: "#00C2C8",
          700: "#0099A0",
        },
        emerald: {
          DEFAULT: "#10B981",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        cobalt: {
          DEFAULT: "#3B82F6",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        glass: {
          DEFAULT: "rgba(16, 185, 129, 0.08)",
          border: "rgba(255, 255, 255, 0.12)",
          glow: "rgba(0, 242, 254, 0.4)",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Space Grotesk"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 242, 254, 0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
        neon: "0 0 20px rgba(0, 242, 254, 0.35), 0 0 40px rgba(0, 242, 254, 0.15)",
        neonglow: "0 0 30px rgba(0, 242, 254, 0.5), 0 0 60px rgba(0, 242, 254, 0.2)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,242,254,0.3)" },
          "50%": { boxShadow: "0 0 35px rgba(0,242,254,0.6)" },
        },
        typing: {
          "0%, 100%": { width: "0%" },
          "50%": { width: "60%" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        pulseGlow: "pulseGlow 3s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        glowPulse: "glowPulse 2.5s ease-in-out infinite",
        typing: "typing 1.2s ease-in-out forwards",
      },
    },
  },
  plugins: [],
};
