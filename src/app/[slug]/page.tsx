import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, PackageX } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'
import StoreCartWrapper from '@/components/store-cart-wrapper'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { FloatingCartBadge } from '@/components/floating-cart-badge'
import { CartHeaderIcon } from '@/components/cart-header-icon'

const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.877-9.888 9.877m8.415-18.3c-2.251-2.25-5.244-3.487-8.427-3.487-6.559 0-11.9 5.341-11.9 11.9 0 2.09.544 4.132 1.577 5.942L0 24l6.302-1.654a11.852 11.852 0 005.591 1.41h.005c6.56 0 11.9-5.341 11.9-11.9 0-3.184-1.24-6.179-3.492-8.432" />
  </svg>
)

const InstagramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (RESERVED_SLUGS.includes(slug)) {
    notFound()
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  try {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (storeError) throw storeError;
    if (!store) notFound()

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
    
    if (prodError) throw prodError;

    const accent = store.accent_color || '#00A859'

    return (
      <StoreCartWrapper storeSlug={slug}>
        <div className="min-h-screen bg-slate-50 bg-dot-pattern flex flex-col pb-24">
          {/* Immersive Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
            <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {store.logo_url ? (
                    <img 
                      src={store.logo_url} 
                      alt={store.store_name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border-2 border-white" style={{ backgroundColor: accent, color: getContrastColor(accent) }}>
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-xl tracking-tight text-primary-900">
                    {store.store_name}
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accent }}></span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Accepting Orders</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {store.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${store.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-border shadow-sm transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#fce7f3' }}
                  >
                    <InstagramIcon className="w-5 h-5" style={{ color: '#E1306C' }} />
                  </a>
                )}
                <a 
                  href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-border shadow-sm transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <WhatsAppIcon className="w-5 h-5" style={{ color: '#25D366' }} />
                </a>
                <CartHeaderIcon slug={slug} accent={accent} />
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 space-y-8">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {/* Image Section */}
                    <Link href={`/${slug}/product/${product.id}`} className="relative block">
                      <div className="aspect-square bg-slate-50 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      {/* Subtle gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </Link>

                    {/* Info Section */}
                    <div className="flex flex-col flex-1 p-3 gap-3">
                      {/* Product name */}
                      <Link href={`/${slug}/product/${product.id}`} className="block">
                        <h3
                          className="font-bold text-[13px] leading-snug line-clamp-2 text-slate-800 group-hover:text-slate-600 transition-colors"
                          style={{ minHeight: '2.4rem' }}
                        >
                          {product.name}
                        </h3>
                      </Link>

                      {/* Price + CTA row */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="font-black text-base leading-none" style={{ color: accent }}>
                            ₦{product.price.toLocaleString()}
                          </span>
                        </div>
                        <AddToCartButton
                          product={{
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image_url: product.image_url,
                            quantity: 1,
                            stock_quantity: product.stock_quantity,
                          }}
                          accent={accent}
                        />
                      </div>
                    </div>

                    {/* Thin brand-color bottom bar */}
                    <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm border border-border">
                  <PackageX className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-bold text-primary-900 text-lg">Empty Catalog</p>
                  <p className="text-sm text-secondary px-8">This vendor hasn&apos;t added any products to their store yet.</p>
                </div>
              </div>
            )}
          </main>

          <footer className="py-12 flex flex-col items-center gap-4">
            <div className="h-px w-12 bg-slate-200"></div>
            <a href="https://ondar.ng" className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <img src="/icon.png" alt="Ondar" className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary-900">
                Powered by Ondar
              </span>
            </a>
          </footer>

          {/* Floating Cart Badge */}
          <FloatingCartBadge slug={slug} accent={accent} />
        </div>
      </StoreCartWrapper>
    )
  } catch (error) {
    console.error('Store Page Error:', error)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-primary-900">Something went wrong</h1>
        <p className="text-secondary mt-2">We couldn&apos;t load this store. Please make sure the database is set up correctly.</p>
        <Link href="/" className="mt-6 font-bold" style={{ color: '#00A859' }}>Back to Home</Link>
      </div>
    )
  }
}
