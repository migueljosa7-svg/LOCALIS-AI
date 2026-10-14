"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function LoginTab({
  setAuthMode,
  setIsLoginOpen,
  authMode,
}: {
  setAuthMode: (m: "google" | "email") => void;
  setIsLoginOpen: (v: boolean) => void;
  authMode: "google" | "email";
}) {
  const [email, setEmail] = useState("");

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-display">Iniciar sesion</h2>
        <p className="text-sm text-muted mt-1">Acceso a tu panel de administracion</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => setAuthMode("google")}
          className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer",
            authMode === "google"
              ? "bg-white/10 border-cyan-500/30 text-cyan-400"
              : "glass text-foreground border-border hover:border-cyan-500/20",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
            <path d="M17.5 13.536L9 2.036 0.5 13.536h16.5z" fill="#4285F4" />
            <path d="M9 18L0.5 12.036L9 8.536L17.5 16.036L9 18Z" fill="#34A853" />
          </svg>
          Continuar con Google
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("email")}
          className={cn(
            "flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all cursor-pointer",
            authMode === "email"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "glass text-foreground border-border hover:border-emerald-500/20",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <rect x="2" y="4" width="14" height="12" rx="2" fill="currentColor" className="text-cyan-400" fillOpacity="0.3" />
            <path d="M2 7L9 12L16 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" />
          </svg>
          Continuar con Email
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted mb-3">O usa tu correo empresarial:</p>
        <form
          className="max-w-xs mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setIsLoginOpen(false);
          }}
        >
          <div className="flex gap-2">
            <label htmlFor="login-email" className="sr-only">
              Correo empresarial
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@empresa.com"
              className="flex-1 min-w-0 px-4 py-3 rounded-xl glass text-sm bg-background border border-border focus-ring text-foreground placeholder:text-muted"
            />
            <button
              type="submit"
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white text-sm font-semibold hover:shadow-neonglow transition-all active:scale-95 cursor-pointer"
            >
              Entrar
            </button>
          </div>
        </form>
        <p className="text-xs text-muted mt-3">
          No tienes cuenta? <span className="text-cyan-400">Contacta con ventas desde la demo</span>
        </p>
      </div>
    </div>
  );
}
