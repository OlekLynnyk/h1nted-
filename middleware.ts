import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const traceId = (globalThis as any).crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const url = req.nextUrl;
  const path = url.pathname;

  const isBypassedPath = path.startsWith('/api/ai/') || path.startsWith('/api/stripe/');
  if (isBypassedPath) {
    const passthrough = NextResponse.next({ request: { headers: req.headers } });
    passthrough.headers.set('x-trace-id', traceId);
    return passthrough;
  }

  const host = req.headers.get('host') || url.host;
  if (host === 'www.h1nted.com') {
    const redirectUrl = url.clone();
    redirectUrl.host = 'h1nted.com';
    const redirectRes = NextResponse.redirect(redirectUrl, 308);
    redirectRes.headers.set('x-trace-id', traceId);
    return redirectRes;
  }

  if (url.searchParams.has('checkout')) {
    const clean = url.clone();
    clean.searchParams.delete('checkout');
    return NextResponse.redirect(clean, 307);
  }

  const res = NextResponse.next({ request: { headers: req.headers } });
  res.headers.set('x-trace-id', traceId);

  const reportOnlyCSP = `
    default-src 'self' https: data: blob:;
    base-uri 'self';
    object-src 'none';
    frame-ancestors 'none';
    script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline' https:;
    img-src 'self' data: blob: https:;
    connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.stripe.com https://r.stripe.com https://www.google-analytics.com https://region1.google-analytics.com;
    frame-src https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com;
    worker-src 'self' blob:;
  `;
  res.headers.set(
    'Content-Security-Policy-Report-Only',
    reportOnlyCSP
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
  );

  const supabase = createMiddlewareClient({ req, res });

  const isReturningFromCheckout = req.nextUrl.searchParams.get('checkout') === 'success';

  let {
    data: { session },
  } = await supabase.auth.getSession().catch(() => ({ data: { session: null } as any }));
  console.log('🧩 [middleware] Session ID:', session?.user?.id || 'No session');

  if (!session && isReturningFromCheckout) {
    for (let i = 0; i < 1; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      ({
        data: { session },
      } = await supabase.auth.getSession().catch(() => ({ data: { session: null } as any })));
      if (session) break;
    }
  }

  const protectedPaths = ['/settings'];
  const isProtected = protectedPaths.some((prefix) => path.startsWith(prefix));

  if (session) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser().catch((err) => ({ data: { user: null }, error: err }) as any);

    if (error || !user) {
      try {
        await supabase.auth.signOut();
      } catch {}
      session = null;
    } else {
      const isVerified = !!user.email_confirmed_at;

      if (!isVerified && !path.startsWith('/login')) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('unverified', '1');
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  if (!session && isProtected) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|auth/callback|_next/static|_next/image|favicon.ico|images|fonts).*)'],
};
