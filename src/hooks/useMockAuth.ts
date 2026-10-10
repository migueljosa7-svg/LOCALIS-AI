"use client";

import { useCallback, useEffect, useState } from "react";

export interface MockUser {
  email: string;
  name: string;
  businessName: string;
  plan: string;
}

const STORAGE_KEY = "localis-dashboard-session";

function readSession(): MockUser | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] || "usuario";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || local;
}

/**
 * Autenticación simulada para la demo del dashboard.
 * Acepta cualquier email/contraseña o el acceso directo "Entrar como Demo".
 * Persiste la sesión en localStorage y evita el flash de hidratación
 * exponiendo un flag `hydrated` hasta que se lee el almacenamiento.
 */
export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setHydrated(true);
  }, []);

  const login = useCallback((email: string, opts?: { demo?: boolean }) => {
    const demo = opts?.demo ?? false;
    const u: MockUser = demo
      ? { email: "demo@localis.ai", name: "Equipo Demo", businessName: "Frutería El Dorado", plan: "pro" }
      : { email, name: nameFromEmail(email), businessName: "Tu Negocio", plan: "trial" };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // almacenamiento no disponible: la sesión solo vivirá en memoria.
    }
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignorar
    }
    setUser(null);
  }, []);

  return { user, hydrated, login, logout };
}
