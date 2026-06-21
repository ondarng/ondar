import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { InquiryListClient } from './inquiry-list-client'

export default async function InquiryPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  const { data: store, error } = await supabase
    .from('stores')
    .select('id, store_name, whatsapp_number, accent_color')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !store) notFound()

  return (
    <InquiryListClient
      slug={slug}
      storeId={store.id}
      storeName={store.store_name}
      waPhone={store.whatsapp_number}
      accentColor={store.accent_color}
    />
  )
}
