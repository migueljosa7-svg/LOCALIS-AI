"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Soluciones", href: "#soluciones" },
  { label: "Stella IA (ERP)", href: "#stella" },
  { label: "Módulo GPS", href: "#gps" },
  { label: "Sectores", href: "#sectores" },
  { label: "Precios", href: "#precios" },
  { label: "Demo Interactiva", href: "#demo" },
];

export default function Header({ scrolled, mobileMenuOpen, setMobileMenuOpen }: {
  scrolled: boolean;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <header
      className={cn(
        "w-full sticky top-0 z-50 backdrop-blur-md transition-all duration-300",
        scrolled
          ? "bg-[#0B0F17]/90 border-b border-white/10 shadow-lg"
          : "bg-[#0B0F17]/80 border-b border-white/10"
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white shadow-neonglow-x group-hover:shadow-neonglow transition-shadow">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 3C6.23858 3 4 5.23858 4 8C4 9.65685 5.65685 11 7.5 11C8.33795 11 9 10.3379 9 9.5C9 9.22386 8.77614 9 8.5 9C8.22386 9 8 9.22386 8 9.5C8 10.3379 8.66205 11 9.5 11C11.3431 11 13 9.65685 13 8C13 5.23858 10.7614 3 9 3Z" fill="currentColor" className="text-cyan-400" fillOpacity="0.3" />
                <path d="M9 5.5C8.44772 5.5 8 5.94772 8 6.5C8 7.05228 8.44772 7.5 9 7.5C9.55228 7.5 10 7.05228 10 6.5C10 5.94772 9.55228 5.5 9 5.5Z" fill="currentColor" className="text-cyan-400" />
              </svg>
            </div>
            <span className="text-lg font-bold font-display gradient-text tracking-tight">LOCALIS AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-xl text-sm font-medium text-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="#demo"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all"
            >
              Probar Demo
            </Link>
            <Link
              href="#contacto"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/30 transition-all"
            >
              Acceso Negocios
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden glass p-2 rounded-xl border border-glass-border cursor-pointer hover:scale-[1.02] transition-all"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="px-4 pb-6 pt-2 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-3 border-t border-border">
                <Link
                  href="#demo"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cobalt-500 text-white font-semibold text-sm btn-glow hover:shadow-neonglow transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Probar Demo
                </Link>
                <Link
                  href="#contacto"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass text-foreground font-semibold text-sm border border-glass-border hover:border-cyan-500/30 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Acceso Negocios
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
