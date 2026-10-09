"use client";

import { useState } from "react";
import { FileText, Download, Send, CheckCircle2 } from "lucide-react";
import { AppModal } from "./StellaActions";

const INVOICE_ITEMS = [
  { d: "Manzanas Fuji 1kg", q: 3, p: 4.5, t: 13.5 },
  { d: "Peras Victoria 1kg", q: 2, p: 5.2, t: 10.4 },
  { d: "Naranjas 800g", q: 4, p: 3.0, t: 12.0 },
];

export function InvoiceCard({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="border-glow rounded-xl p-4 bg-background/60 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-emerald-400" />
        <p className="text-xs font-semibold">Factura INV-2026-104 · lista</p>
      </div>
      <p className="text-sm font-bold">Fruteria Pepe · 42,36 EUR</p>
      <p className="text-xs text-muted mt-1">IVA 21% incluido · vence el 16 sept</p>
      <button
        type="button"
        onClick={onOpen}
        className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-all hover:scale-[1.02]"
      >
        Abrir factura →
      </button>
    </div>
  );
}

export function InvoiceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  const subtotal = 35.9;
  const iva = 6.46;
  const total = 42.36;

  const download = () => {
    const html = `<html><body style="font-family:sans-serif;padding:32px">
      <h2>FACTURA INV-2026-104</h2><p>Fruteria Pepe · 10/09/2026</p>
      <table border="1" cellpadding="6" cellspacing="0">
      <tr><th>Concepto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>
      ${INVOICE_ITEMS.map((i) => `<tr><td>${i.d}</td><td>${i.q}</td><td>${i.p} EUR</td><td>${i.t} EUR</td></tr>`).join("")}
      </table>
      <p>Subtotal: ${subtotal} EUR · IVA 21%: ${iva} EUR</p><p><b>TOTAL: ${total} EUR</b></p>
      <p style="color:#888">Generado por LOCALIS AI (demo)</p></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "factura-INV-2026-104.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppModal open={open} onClose={onClose} title="Factura INV-2026-104">
      <div className="rounded-xl border border-border bg-background/60 p-4 text-sm space-y-3">
        <div className="flex justify-between text-xs text-muted">
          <span>LOCALIS AI Store (emisor)</span>
          <span>10/09/2026</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-muted border-b border-border">
              <th className="pb-1 font-medium">Concepto</th>
              <th className="pb-1 font-medium">Cant.</th>
              <th className="pb-1 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {INVOICE_ITEMS.map((i) => (
              <tr key={i.d} className="border-b border-border/40">
                <td className="py-1.5">{i.d}</td>
                <td className="py-1.5 text-muted">{i.q}</td>
                <td className="py-1.5 text-right">{i.t.toFixed(2)} EUR</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between text-xs text-muted">
          <span>Subtotal</span>
          <span>{subtotal} EUR</span>
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>IVA 21%</span>
          <span>{iva} EUR</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
          <span>TOTAL</span>
          <span className="text-emerald-400">{total} EUR</span>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={download}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl glass border border-border text-sm font-semibold hover:border-cyan-500/40 transition-all cursor-pointer"
          >
            <Download size={14} /> Descargar
          </button>
          <button
            type="button"
            onClick={() => setSent(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold btn-glow transition-all cursor-pointer"
          >
            {sent ? <CheckCircle2 size={14} /> : <Send size={14} />}
            {sent ? "Enviada" : "Enviar"}
          </button>
        </div>
      </div>
    </AppModal>
  );
}
