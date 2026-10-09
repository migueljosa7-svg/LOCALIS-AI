"use client";

import { useState } from "react";
import { Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginTab({ setAuthMode, setIsLoginOpen, authMode }: {
  setAuthMode: (m: "google" | "email") => void;
  setIsLoginOpen: (v: boolean) => void;
  authMode: "google" | "email";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-display">Iniciar sesión</h2>
        <p className="text-sm text-muted mt-1">Acceso a tu panel de administración</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setAuthMode("google")}
          className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
            authMode === "google"
              ? "bg-white/10 border-cyan-500/30 text-cyan-400"
              : "glass text-foreground border-border hover:border-cyan-500/20"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M17.5 13.536L9 2.036 0.5 13.536h16.5z" fill="#4285F4" />
            <path d="M9 18L0.5 12.036L9 8.536L17.5 16.036L9 18Z" fill="#34A853" />
          </svg>
          Continuar con Google
        </button>
        <button
          onClick={() => setAuthMode("email")}
          className={`flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${
            authMode === "email"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "glass text-foreground border-border hover:border-emerald-500/20"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="4" width="14" height="12" rx="2" fill="currentColor" className="text-cyan-400" fillOpacity="0.3" />
            <path d="M2 7L9 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" />
          </svg>
          Continuar con Email
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted mb-3">O usa tu correo empresarial:</p>
        <div className="max-w-xs mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="flex-1 px-4 py-3 rounded-xl glass text-sm bg-background border border-border focus-ring text-foreground placeholder:text-muted"
            />
            <button
              onClick={() => setIsLoginOpen(false)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white text-sm font-semibold hover:shadow-neonglow transition-all active:scale-95"
            >
              Entrar
            </button>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          No tienes cuenta? <button className="text-cyan-400 hover:text-cyan-300">Contactar ventas</button>
        </p>
      </div>
    </div>
  );
}
