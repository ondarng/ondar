import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL — but validate it's a safe relative path
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = (rawNext.startsWith('/') && !rawNext.startsWith('//')) ? rawNext : '/dashboard'

  // Netlify / Cloud CDN forwards the true client host in x-forwarded-host
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const trueOrigin = forwardedHost ? `${protocol}://${forwardedHost}` : new URL(request.url).origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options })
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Create a safe absolute URL for the redirect using the true origin
      const redirectUrl = new URL(next, trueOrigin)
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // If there's an error, send them back to login with a message
  const errorUrl = new URL('/login', trueOrigin)
  errorUrl.searchParams.set('error', 'Could not authenticate')
  return NextResponse.redirect(errorUrl.toString())
}
