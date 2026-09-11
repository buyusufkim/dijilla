import { z } from 'zod';
import { requestKinds } from './requests.js';

const phone = z.string().transform(value => {
  let digits = value.replace(/[\s()+.-]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (/^0\d{10}$/.test(digits)) digits = `90${digits.slice(1)}`;
  if (/^[1-9]\d{9}$/.test(digits)) digits = `90${digits}`;
  return digits;
}).pipe(z.string().regex(/^(?:90[1-9]\d{9})?$/, 'Telefonu 05xx xxx xx xx veya +90 biçiminde girin.'));
export const applicationSettingsSchema = z.object({
  version: z.number().int().positive(),
  phone, whatsapp: phone,
  privacy_text: z.string().trim().max(20000),
  requests_enabled: z.boolean(),
  business_name: z.string().trim().max(160).default(''),
  support_email: z.union([z.email('Geçerli bir e-posta adresi girin.'), z.literal('')]).default(''),
  support_hours: z.string().trim().max(160).default(''),
  enabled_kinds: z.array(z.enum(requestKinds)).max(5).default([...requestKinds]),
}).strict().superRefine((value,ctx) => {
  if (!value.requests_enabled) return;
  if (!value.phone) ctx.addIssue({code:'custom',path:['phone'],message:'Talep alımını açmak için çağrı merkezi telefonu gerekli.'});
  if (value.privacy_text.length < 20) ctx.addIssue({code:'custom',path:['privacy_text'],message:'Talep alımını açmak için bilgilendirme metnini tamamlayın (en az 20 karakter).'});
  if (!value.enabled_kinds.length) ctx.addIssue({code:'custom',path:['enabled_kinds'],message:'En az bir talep türünü açık bırakın.'});
});
export type ApplicationSettings = z.infer<typeof applicationSettingsSchema>;
