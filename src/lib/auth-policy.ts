export function isVerifiedUser(user: { email_confirmed_at?: string; is_anonymous?: boolean } | null | undefined): boolean {
  return Boolean(user?.email_confirmed_at && !user.is_anonymous);
}

export function safeReturnPath(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || /[\\\s%]/.test(value) || value.startsWith('//')) return '/home';
  if (['/', '/login', '/reset-password'].includes(value.split(/[?#]/)[0])) return '/home';
  return value;
}
