import { z } from 'zod';

export function dateStatus(value: string | null | undefined, now = new Date()): 'unknown' | 'valid' | 'warning' | 'expired' {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'unknown';
  const expiry = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(expiry) || new Date(expiry).toISOString().slice(0, 10) !== value) return 'unknown';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  const days = (expiry - Date.parse(`${today}T00:00:00Z`)) / 86400000;
  return days < 0 ? 'expired' : days <= 30 ? 'warning' : 'valid';
}
export const documentSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  type: z.enum(['license', 'insurance', 'registration', 'other']),
  expiry_date: z.string().nullable().refine(v => v === null || dateStatus(v) !== 'unknown', 'Geçerli bir tarih girin.'),
}).strict();
export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export function documentExtension(bytes: Uint8Array, mime: string): 'pdf' | 'jpg' | 'png' | null {
  if (!bytes.length || bytes.length > MAX_DOCUMENT_BYTES) return null;
  if (mime === 'application/pdf' && [37,80,68,70,45].every((v,i) => bytes[i] === v)) return 'pdf';
  if (mime === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpg';
  if (mime === 'image/png' && [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v)) return 'png';
  return null;
}
