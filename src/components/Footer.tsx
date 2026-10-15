import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-card border-t border-border mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold font-display">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cobalt-500 flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 2C4.79086 2 3 3.79086 3 6C3 7.65685 4.655685 9 6.5 9C7.33795 9 8 8.33795 8 7.5C8 7.22386 7.77614 7 7.5 7C7.223886 7 7 7.22386 7 7.5C7 8.33795 7.66205 9 8.5 9C10.3431 9 12 7.65685 12 6C12 3.79086 9.20914 2 7 2Z" fill="currentColor" className="text-cyan-400" fillOpacity="0.3" />
                  <circle cx="7" cy="6" r="1.5" fill="currentColor" className="text-cyan-400" />
                  <path d="M7 4.5C6.44772 4.5 6 4.94772 6 5.5C6 6.05228 6.44772 6.5 7 6.5C7.55228 6.5 8 6.05228 8 5.5C8 4.94772 7.55228 4.5 7 4.5Z" fill="currentColor" className="text-cyan-400" />
                </svg>
              </div>
              <span className="gradient-text">LOCALIS AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted">
              La primera plataforma web con IA Autonoma y GPS Integrado para tu negocio en Zaragoza y Aragón.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Soluciones</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="#web" className="hover:text-cyan-400 transition-all">Diseño Web Zaragoza</Link></li>
              <li><Link href="#stella" className="hover:text-cyan-400 transition-all">Stella IA 24/7</Link></li>
              <li><Link href="#reparto" className="hover:text-cyan-400 transition-all">Seguimiento Reparto GPS</Link></li>
              <li><Link href="#cita" className="hover:text-cyan-400 transition-all">Pedir Cita Gratuita</Link></li>
              <li><Link href="#demo" className="hover:text-cyan-400 transition-all">Ver Demo</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="#sectores" className="hover:text-cyan-400 transition-all">Sectores</Link></li>
              <li><Link href="#precios" className="hover:text-cyan-400 transition-all">Precios</Link></li>
              <li><Link href="#demo" className="hover:text-cyan-400 transition-all">Demo</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-400 transition-all">Aviso Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Mail size={12} className="text-cyan-400" />
                <a href="mailto:migueljosa7@gmail.com" className="hover:text-cyan-400 transition-all">migueljosa7@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={12} className="text-cyan-400" />
                <a href="tel:+34640809238" className="hover:text-cyan-400 transition-all">+34 640 80 92 38</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={12} className="text-cyan-400" />
                <span>Zaragoza, Aragon, Espana</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border flex flex-col l md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; 2026 LOCALIS AI. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-cyan-400 transition-all">Aviso Legal</Link>
            <Link href="/privacy" className="hover:text-cyan-400 transition-all">Politica de Privacidad</Link>
            <Link href="/cookies" className="hover:text-cyan-400 transition-all">Politica de Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
