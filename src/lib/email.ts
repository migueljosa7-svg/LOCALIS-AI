// Servicio de email para leads via Resend API (fetch nativo, sin dependencias).
// REGLA ABSOLUTA: jamas lanza errores. El formulario siempre funciona aunque
// el proveedor falle, no haya API key o la red este caida.

import { env } from '@/lib/env';

const RESEND_API_URL = 'https://api.resend.com/emails';
const EMAIL_TIMEOUT_MS = 5000;

export interface LeadEmailData {
  businessName: string;
  sector: string;
  contactName: string;
  phone: string;
  email: string;
  source?: string | null;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value: string): string {
  return (
    '<tr><td style="padding:8px 0;color:#64748b;width:190px;vertical-align:top">' +
    esc(label) +
    '</td><td style="padding:8px 0;font-weight:bold;color:#0f172a">' +
    esc(value) +
    '</td></tr>'
  );
}

/** Envio individual con timeout. Devuelve true/false, nunca rechaza. */
async function sendOne(opts: {
  apiKey: string;
  from: string;
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), EMAIL_TIMEOUT_MS);
  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + opts.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: opts.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.warn('[email] Resend devolvio ' + res.status + ': ' + detail.slice(0, 200));
    }
    return res.ok;
  } catch (err) {
    console.warn('[email] fallo de envio (ignorado):', err instanceof Error ? err.message : err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Correo de AVISO al dueno del negocio (LEAD_INBOX_EMAIL). */
function adminHtml(lead: LeadEmailData, receivedAt: string): string {
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:24px">',
    '<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">',
    '<div style="background:#0B0F17;padding:18px 24px"><span style="color:#22d3ee;font-size:18px;font-weight:bold">LOCALIS AI</span><span style="color:#94a3b8;font-size:14px"> &middot; Nueva solicitud de cita</span></div>',
    '<div style="padding:24px">',
    '<h2 style="margin:0 0 14px;font-size:17px;color:#0f172a">Nueva solicitud de auditoria/demo</h2>',
    '<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.6">',
    row('Nombre del negocio', lead.businessName),
    row('Persona de contacto', lead.contactName),
    row('Servicio elegido', lead.sector),
    row('WhatsApp / Telefono', lead.phone),
    row('Email del cliente', lead.email),
    row('Origen del lead', lead.source || 'Formulario #cita'),
    row('Recibido', receivedAt),
    '</table>',
    '<p style="margin:18px 0 0;color:#64748b;font-size:12px">Responde a este correo o escribe por WhatsApp al <strong>+34 640 80 92 38</strong>.</p>',
    '</div></div></div>',
  ].join('');
}

/** Correo de CONFIRMACION automatico al cliente. */
function clientHtml(lead: LeadEmailData): string {
  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f6f8;padding:24px">',
    '<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">',
    '<div style="background:#0B0F17;padding:18px 24px"><span style="color:#22d3ee;font-size:18px;font-weight:bold">LOCALIS AI</span></div>',
    '<div style="padding:24px;color:#0f172a;font-size:15px;line-height:1.7">',
    '<h2 style="margin:0 0 12px;font-size:17px">Hola ' + esc(lead.contactName) + ',</h2>',
    '<p style="margin:0 0 14px">Hemos recibido tu solicitud de auditoria/demo para LOCALIS AI. En breve te contactamos por WhatsApp.</p>',
    '<table style="width:100%;border-collapse:collapse;font-size:14px">',
    row('Negocio', lead.businessName),
    row('Servicio', lead.sector),
    '</table>',
    '<p style="margin:16px 0 0;color:#64748b;font-size:13px">Si necesitas algo antes, contesta a este correo o llamanos al <strong>+34 640 80 92 38</strong> (Zaragoza).</p>',
    '</div></div></div>',
  ].join('');
}

export interface LeadEmailResult {
  attempted: boolean;
  notified: boolean;
  confirmed: boolean;
}

/**
 * Envia los 2 correos del circuito comercial en paralelo:
 *  1) Aviso al dueno (migueljosa7@gmail.com por defecto) con todos los datos.
 *  2) Confirmacion automatica al cliente.
 * Nunca lanza excepciones: siempre devuelve un resultado controlado.
 */
export async function sendLeadNotifications(lead: LeadEmailData): Promise<LeadEmailResult> {
  try {
    const apiKey = env.resendApiKey;
    if (!apiKey) {
      console.warn(
        '[email] RESEND_API_KEY sin configurar: aviso de lead omitido. ' +
          'Anade la clave en Vercel > Settings > Environment Variables.'
      );
      return { attempted: false, notified: false, confirmed: false };
    }

    const from = env.emailFrom;
    const inbox = env.leadInbox;
    const receivedAt = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    const [adminOk, clientOk] = await Promise.all([
      sendOne({
        apiKey,
        from,
        to: [inbox],
        subject: 'Nueva solicitud: ' + lead.businessName + ' (' + lead.sector + ')',
        html: adminHtml(lead, receivedAt),
        replyTo: lead.email,
      }),
      sendOne({
        apiKey,
        from,
        to: [lead.email],
        subject: 'Hemos recibido tu solicitud - LOCALIS AI',
        html: clientHtml(lead),
      }),
    ]);

    if (!adminOk) {
      console.warn('[email] no se pudo avisar al inbox: ' + inbox);
    }
    return { attempted: true, notified: adminOk, confirmed: clientOk };
  } catch (err) {
    console.warn('[email] error inesperado (ignorado):', err instanceof Error ? err.message : err);
    return { attempted: false, notified: false, confirmed: false };
  }
}
