import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://novix.tv';

// Gate every page: must be signed in AND have an active subscription.
//  - not signed in        → /login
//  - signed in, no sub     → <main site>/pay
//  - signed in + active    → allow (and bounce away from /login)
export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isLogin = path === '/login';
  // /auth/callback establishes the session client-side, so it must run unauthenticated.
  const isPublic = isLogin || path === '/auth/callback';

  if (!user) {
    if (isPublic) return response;
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Signed in — require an active (or past_due) subscription.
  const { data: row } = await supabase
    .from('users')
    .select('subscription_status')
    .eq('auth_id', user.id)
    .single();
  const active = row?.subscription_status === 'active' || row?.subscription_status === 'past_due';

  if (!active) {
    return NextResponse.redirect(`${MAIN_SITE}/pay`);
  }

  if (isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
