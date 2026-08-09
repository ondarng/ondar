import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Server-side Supabase client with service role for validated operations
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, serviceKey)
}

interface OrderItem {
  product_id: string
  quantity: number
  variant_name: string | null
}

interface CheckoutRequest {
  store_id: string
  items: OrderItem[]
  customer_name: string
  customer_phone: string
  customer_instagram?: string
  delivery_address: string
  checkout_mode: 'direct' | 'whatsapp'
  payment_receipt_url?: string
  customer_note?: string
  payment_method?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json()

    // 1. Validate required fields
    if (!body.store_id || !body.items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: store_id, items' },
        { status: 400 }
      )
    }

    const isWhatsAppCheckout = body.checkout_mode === 'whatsapp'
    
    // For direct checkout, we require full customer details
    if (!isWhatsAppCheckout && (!body.customer_name || !body.customer_phone || !body.delivery_address)) {
      return NextResponse.json(
        { error: 'Missing required customer details: customer_name, customer_phone, delivery_address' },
        { status: 400 }
      )
    }

    // Assign safe defaults for conversational/WhatsApp checkouts
    const customerName = body.customer_name || 'WhatsApp Customer'
    const customerPhone = body.customer_phone || 'WhatsApp Checkout'
    const deliveryAddress = body.delivery_address || '[WHATSAPP] To Be Decided'

    if (body.items.some(item => !item.product_id || !item.quantity || item.quantity < 1)) {
      return NextResponse.json(
        { error: 'Each item must have a valid product_id and quantity >= 1' },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()

    // 2. Verify the store exists
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('id, store_name')
      .eq('id', body.store_id)
      .maybeSingle()

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // 3. Fetch ALL referenced products in one query to verify prices
    const productIds = [...new Set(body.items.map(item => item.product_id))]
    
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, variants, stock_quantity, store_id')
      .in('id', productIds)
      .eq('store_id', body.store_id)

    if (productsError || !products) {
      return NextResponse.json(
        { error: 'Failed to verify products' },
        { status: 500 }
      )
    }

    // 4. Build a lookup map
    const productMap = new Map(products.map(p => [p.id, p]))

    // 5. Validate each item: product exists, belongs to store, check stock, resolve verified price
    const validatedItems: Array<{
      product_id: string
      product_name: string
      quantity: number
      verified_price: number
      total_price: number
      specification: string | null
    }> = []

    for (const item of body.items) {
      const product = productMap.get(item.product_id)

      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.product_id}" not found or does not belong to this store` },
          { status: 400 }
        )
      }

      // Check stock
      if (product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, Requested: ${item.quantity}` },
          { status: 400 }
        )
      }

      // Resolve the verified price — check variants if specified
      let verifiedPrice = Number(product.price)
      
      if (item.variant_name) {
        const variants: Array<{ name: string; price: number | null }> = Array.isArray(product.variants) ? product.variants : []
        const matchedVariant = variants.find(v => v.name === item.variant_name)
        
        if (matchedVariant && matchedVariant.price != null) {
          verifiedPrice = Number(matchedVariant.price)
        }
        // If variant name doesn't match any known variant, use base price (safe default)
      }

      validatedItems.push({
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        verified_price: verifiedPrice,
        total_price: verifiedPrice * item.quantity,
        specification: item.variant_name || null,
      })
    }

    // 6. Insert all orders with SERVER-VERIFIED prices
    const orderIds: string[] = []

    for (const item of validatedItems) {
      const basePayload: any = {
        store_id: body.store_id,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.total_price,
        specification: item.specification,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_instagram: body.customer_instagram || null,
        delivery_address: deliveryAddress,
        status: 'PENDING'
      }

      // Try inserting with extended columns first
      let { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          ...basePayload,
          payment_receipt_url: body.payment_receipt_url || null,
          customer_note: body.customer_note || null,
          payment_method: body.payment_method || 'bank_transfer',
        })
        .select('id')
        .single()

      // If failed due to missing columns in schema, retry with base payload
      if (orderError && (orderError.message?.includes('customer_note') || orderError.message?.includes('column'))) {
        console.warn('Extended columns missing in orders schema, retrying with base payload:', orderError.message)
        const retryResult = await supabase
          .from('orders')
          .insert(basePayload)
          .select('id')
          .single()
        orderData = retryResult.data
        orderError = retryResult.error
      }

      if (orderError) {
        console.error('Order insert error:', orderError)
        return NextResponse.json(
          { error: `Failed to create order for "${item.product_name}": ${orderError.message}` },
          { status: 500 }
        )
      }

      if (orderData) orderIds.push(orderData.id)

      // 7. Decrement stock
      if (productMap.get(item.product_id)!.stock_quantity !== null) {
        await supabase
          .from('products')
          .update({ 
            stock_quantity: Math.max(0, productMap.get(item.product_id)!.stock_quantity - item.quantity) 
          })
          .eq('id', item.product_id)
      }
    }

    // 8. Add customer to CRM (best effort, ignore duplicate errors)
    await supabase.from('customers').insert({
      store_id: body.store_id,
      name: customerName,
      phone: customerPhone,
      instagram: body.customer_instagram || null,
      address: deliveryAddress
    })

    // 9. Return verified order data
    return NextResponse.json({
      success: true,
      order_ids: orderIds,
      verified_items: validatedItems.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        verified_price: item.verified_price,
        total: item.total_price,
        specification: item.specification,
      })),
      verified_total: validatedItems.reduce((sum, item) => sum + item.total_price, 0),
    })

  } catch (err: any) {
    console.error('Checkout API error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
