"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Nombre de la sección (para el mensaje y el registro). */
  name: string;
  /** Altura mínima del hueco de reserva: evita saltos de layout si algo falla. */
  minHeight?: number;
}

interface State {
  hasError: boolean;
}

/**
 * Error Boundary por sección: si un componente interactivo falla, solo esa
 * sección muestra un aviso amable con "Reintentar"; el resto de la página
 * (y el formulario de contacto) sigue funcionando.
 */
export default class SafeBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Registro discreto (sin ruido en producción salvo el error real).
    console.error(`[LOCALIS] Error en la sección «${this.props.name}»:`, error.message, info.componentStack?.split("\n")[1]?.trim() ?? "");
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        className="mx-auto my-10 max-w-xl px-4"
        style={{ minHeight: this.props.minHeight }}
      >
        <div className="border-glow rounded-3xl p-6 text-center">
          <p className="font-display font-semibold">No hemos podido cargar «{this.props.name}»</p>
          <p className="mt-2 text-sm text-muted">El resto de la web funciona con normalidad. Puedes reintentarlo o escribirnos directamente.</p>
          <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
            <button type="button" onClick={() => this.setState({ hasError: false })} className="btn btn-ghost text-sm">
              <RefreshCw size={15} aria-hidden="true" /> Reintentar
            </button>
            <a href="/disena-tu-web#cita" className="btn btn-primary text-sm">
              Pedir auditoría gratis
            </a>
          </div>
        </div>
      </div>
    );
  }
}
