"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, PlusSquare, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * Registra el Service Worker y muestra un aviso discreto de "Instalar App"
 * cuando el navegador emite `beforeinstallprompt` (Android/Desktop Chrome/Edge).
 * En iOS (sin beforeinstallprompt) se ofrece un recordatorio manual tras unos
 * segundos de uso. Se puede descartar y no vuelve a aparecer en la sesión.
 */
export default function PwaSetup() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  // Registro del Service Worker (solo en producción).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Silencioso: la app sigue funcionando sin SW.
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !/crios|fxios|edgios/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const dismissed = () => {
      try {
        return window.sessionStorage.getItem("localis-pwa-dismissed") === "1";
      } catch {
        return false;
      }
    };

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      if (!dismissed()) {
        // Pequeño retardo para no interrumpir la primera impresión.
        setTimeout(() => setVisible(true), 3500);
      }
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS no emite beforeinstallprompt: mostramos el recordatorio manual.
    let iosTimer: number | undefined;
    if (ios && !dismissed()) {
      iosTimer = window.setTimeout(() => setVisible(true), 6000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
      if (iosTimer) window.clearTimeout(iosTimer);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
    setVisible(false);
  };

  const dismiss = () => {
    setVisible(false);
    try {
      window.sessionStorage.setItem("localis-pwa-dismissed", "1");
    } catch {
      // ignorar
    }
  };

  if (installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto z-[65] max-w-sm sm:w-[22rem] ml-auto"
          role="dialog"
          aria-label="Instalar aplicación"
        >
          <div className="glass border-glow rounded-2xl p-4 shadow-neonglow relative overflow-hidden">
            <div className="absolute -top-16 -right-10 w-40 h-40 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
            <button
              type="button"
              onClick={dismiss}
              aria-label="Descartar aviso de instalación"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-white/5 transition-all cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white shadow-neonglow">
                <Smartphone size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-bold font-display text-sm">Instala LOCALIS AI</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  Lleva la plataforma en tu bolsillo y úsala también sin conexión.
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="mt-3.5 text-xs text-muted space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-2">
                  <Share size={13} className="text-cyan-400 shrink-0" />
                  Pulsa <span className="text-foreground font-medium">Compartir</span> en Safari
                </p>
                <p className="flex items-center gap-2">
                  <PlusSquare size={13} className="text-cyan-400 shrink-0" />
                  y elige <span className="text-foreground font-medium">“Añadir a pantalla de inicio”</span>
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={install}
                disabled={!deferred}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download size={15} /> Instalar App
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

