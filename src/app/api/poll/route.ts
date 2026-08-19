import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { vendor_name, vendor_contact, top_feature, sales_frequency, willingness_to_pay, feedback } = body

    const supabase = getServiceClient()

    const { error } = await supabase.from('vendor_polls').insert({
      vendor_name: vendor_name || 'Anonymous Vendor',
      vendor_contact: vendor_contact || null,
      top_feature: top_feature || null,
      sales_frequency: sales_frequency || null,
      willingness_to_pay: willingness_to_pay || null,
      feedback: feedback || null,
    })

    if (error) {
      console.warn('Poll DB insert notice:', error.message)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Poll submission error:', err)
    return NextResponse.json({ success: true }) // Never fail the UI for merchant
  }
}

export async function GET() {
  try {
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('vendor_polls')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ polls: data || [] })
  } catch (err: any) {
    return NextResponse.json({ polls: [], error: err.message })
  }
}
