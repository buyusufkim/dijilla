import { supabase } from '@/supabase';

export async function requestApi(path: string, options: RequestInit = {}) {
  return authenticatedApi(`/api/requests${path}`, options);
}
export async function authenticatedApi(path: string, options: RequestInit = {}) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Devam etmek için giriş yapın.');
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  if (options.body && !(options.body instanceof File)) headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error?.fields?.map((v: { message: string }) => v.message).join(' ') || result?.error?.message || 'İşlem tamamlanamadı.');
  return result;
}
export const money = (minor: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(minor / 100);
