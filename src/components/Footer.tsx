"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-bg-elevated border-t border-border mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold font-display">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2C4.79086 2 3 3.79086 3 6C3 7.65685 4.65685 9 6.5 9C7.33795 9 8 8.33795 8 7.5C8 7.22386 7.77614 7 7.5 7C7.22386 7 7 7.22386 7 7.5C7 8.33795 7.66205 9 8.5 9C10.3431 9 12 7.65685 12 6C12 3.79086 9.20914 2 7 2Z" fill="currentColor" className="text-cyan-400" fillOpacity="0.3" />
                  <circle cx="7" cy="6" r="1.5" fill="currentColor" className="text-cyan-400" />
                  <path d="M7 4.5C6.44772 4.5 6 4.94772 6 5.5C6 6.05228 6.44772 6.5 7 6.5C7.55228 6.5 8 6.05228 8 5.5C8 4.94772 7.55228 4.5 7 4.5Z" fill="currentColor" className="text-cyan-400" />
                </svg>
              </div>
              <span className="gradient-text">LOCALIS AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              La primera plataforma web con IA Autónoma y GPS Integrado para tu negocio.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Soluciones</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Stella AI</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Módulo GPS</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Facturación</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Agenda Inteligente</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Nosotros</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Prensa</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Carreras</Link></li>
              <li><Link href="#" className="hover:text-cyan-400 transition-all">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-cyan-400" />
                <a href="mailto:hola@localis.ai" className="hover:text-cyan-400 transition-all">hola@localis.ai</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-cyan-400" />
                <a href="tel:+34912345678" className="hover:text-cyan-400 transition-all">+34 912 345 678</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={12} className="text-cyan-400" />
                <span>Madrid, España</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; 2026 LOCALIS AI. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-cyan-400 transition-all">Términos</Link>
            <Link href="#" className="hover:text-cyan-400 transition-all">Privacidad</Link>
            <Link href="#" className="hover:text-cyan-400 transition-all">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
