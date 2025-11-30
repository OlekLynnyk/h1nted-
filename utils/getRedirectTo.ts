// utils/getRedirectTo.ts
export function getRedirectTo(path = '/auth/callback') {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin.replace(/\/$/, '');
    return `${origin}${path}`;
  }

  const base = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  return base ? `${base}${path}` : undefined;
}
