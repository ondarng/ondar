import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, serviceKey)
}

export interface UpsertCustomerParams {
  storeId: string
  name: string
  phone: string
  instagram?: string | null
  address?: string | null
  orderTotal?: number
  note?: string | null
}

/**
 * Normalizes Nigerian phone numbers for accurate deduplication
 * 08012345678, +2348012345678, 2348012345678 -> 08012345678
 */
export function normalizePhone(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/[^0-9]/g, '')
  if (digits.startsWith('234') && digits.length === 13) {
    return '0' + digits.slice(3)
  }
  return digits
}

/**
 * Deduplicates and updates customer records in CRM
 */
export async function upsertCustomerRecord(params: UpsertCustomerParams) {
  const { storeId, name, phone, instagram, address, orderTotal = 0, note } = params
  if (!storeId || !phone || phone === 'WhatsApp Order' || phone === 'No Phone') return null

  try {
    const supabase = getServiceClient()
    const cleanPhone = normalizePhone(phone)

    // 1. Look up existing customer by phone under this store
    const { data: existing, error: findError } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .or(`phone.eq.${phone},phone.eq.${cleanPhone},phone.eq.234${cleanPhone.replace(/^0/, '')}`)
      .maybeSingle()

    if (findError) {
      console.warn('Customer lookup notice:', findError.message)
    }

    if (existing) {
      // 2. Existing Customer: Increment total_orders and update latest profile
      const newOrdersCount = (Number(existing.total_orders) || 0) + 1
      const newTotalSpent = (Number(existing.total_spent) || 0) + Number(orderTotal)
      const existingNotes = Array.isArray(existing.notes) ? existing.notes : []
      const updatedNotes = note && !existingNotes.includes(note) ? [...existingNotes, note] : existingNotes

      const { data: updated, error: updateError } = await supabase
        .from('customers')
        .update({
          name: existing.name === 'WhatsApp Customer' || existing.name === 'Customer' ? (name || existing.name) : (name || existing.name),
          address: address || existing.address,
          instagram: instagram || existing.instagram,
          total_orders: newOrdersCount,
          total_spent: newTotalSpent,
          last_order_at: new Date().toISOString(),
          notes: updatedNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (updateError) {
        console.warn('Customer update retry notice:', updateError.message)
      }
      return updated || existing
    } else {
      // 3. New Customer: Insert fresh record
      const { data: created, error: insertError } = await supabase
        .from('customers')
        .insert({
          store_id: storeId,
          name: name || 'WhatsApp Customer',
          phone: phone,
          address: address || null,
          instagram: instagram || null,
          total_orders: 1,
          total_spent: Number(orderTotal) || 0,
          last_order_at: new Date().toISOString(),
          notes: note ? [note] : [],
        })
        .select()
        .single()

      if (insertError) {
        console.warn('Customer insert notice:', insertError.message)
      }
      return created
    }
  } catch (err) {
    console.warn('Could not auto-deduplicate customer in CRM:', err)
    return null
  }
}
