import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, serviceKey)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { store_id, email, source = 'storefront_newsletter' } = body

    if (!store_id || !email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email and store ID are required.' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()
    const supabase = getServiceClient()

    // 1. Save to leads table
    const { data, error } = await supabase.from('leads').insert({
      store_id,
      email: cleanEmail,
      source,
      created_at: new Date().toISOString(),
    }).select().single()

    if (error) {
      // If table already has unique index or leads table insert, handle gracefully
      console.warn('Newsletter subscription notice:', error.message)
    }

    // 2. Also record in customers table if not existing
    await supabase.from('customers').upsert({
      store_id,
      name: cleanEmail.split('@')[0],
      phone: 'Newsletter Subscriber',
      notes: [`Subscribed via storefront email newsletter on ${new Date().toLocaleDateString()}`],
      last_order_at: new Date().toISOString(),
      total_orders: 0,
      total_spent: 0,
    }, { onConflict: 'store_id,phone' })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
