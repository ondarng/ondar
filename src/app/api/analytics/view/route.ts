import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const { store_id, product_id } = await request.json()
    if (!store_id) {
      return NextResponse.json({ error: 'store_id is required' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'
    const supabase = getServiceClient()

    await supabase.from('store_views').insert({
      store_id,
      product_id: product_id || null,
      visitor_ip: ip,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    // Analytics logging should never throw or break page rendering
    console.error('Analytics error:', err)
    return NextResponse.json({ success: false })
  }
}
