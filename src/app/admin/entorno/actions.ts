"use server";

import { checkSupabase, sendTestEmail, type CheckResult, type MailResult } from "@/lib/admin/integrations";

// Comprobaciones lanzadas a mano desde /admin/entorno (solo con sesión del panel: el middleware protege /admin).
export interface DbState {
  results?: CheckResult[];
}
export interface MailState {
  result?: MailResult;
}

export async function checkSupabaseAction(prev: DbState): Promise<DbState> {
  void prev;
  return { results: await checkSupabase() };
}

export async function sendTestEmailAction(prev: MailState): Promise<MailState> {
  void prev;
  return { result: await sendTestEmail() };
}
