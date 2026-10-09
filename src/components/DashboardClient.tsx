"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone } from "lucide-react";
import { SAMPLE_BUSINESSES } from "@/lib/demoSamples";
import LoginTab from "./LoginTab";
import DashboardShell from "./DashboardShell";

export default function DashboardClient() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"google" | "email">("google");
  const [activeBusiness] = useState(SAMPLE_BUSINESSES[0]);

  return (
    <div id="demo" className="w-full py-20 lg:py-28 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            Demo interactiva
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display">
            Explora el <span className="gradient-text">dashboard cliente</span>
          </h2>
          <p className="mt-4 text-muted max-w-2xl mx-auto text-lg">
            Inicia sesión para ver una simulación del dashboard donde interactúan
            la IA Stella y el módulo GPS.
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all"
          >
            <Smartphone size={16} /> Iniciar sesión
          </button>
        </div>

        <AnimatePresence>
          {isLoginOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsLoginOpen(false)}
            >
              <div
                className="glass rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-border"
                onClick={(e) => e.stopPropagation()}
              >
                <LoginTab
                  setAuthMode={setAuthMode}
                  setIsLoginOpen={setIsLoginOpen}
                  authMode={authMode}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <DashboardShell activeBusiness={activeBusiness} />
        </motion.div>
      </div>
    </div>
  );
}
