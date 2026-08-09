import Link from 'next/link'
import { Globe, Mail, MapPin, Phone, Shield } from 'lucide-react'

// Inline SVGs for social icons (lucide v1 removed these)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

interface StorefrontFooterProps {
  store: {
    store_name: string
    slug: string
    location?: string | null
    whatsapp_number?: string | null
    email?: string | null
    instagram_handle?: string | null
    twitter_handle?: string | null
    facebook_url?: string | null
    website_url?: string | null
    return_policy?: string | null
    accent_color?: string | null
  }
}

export function StorefrontFooter({ store }: StorefrontFooterProps) {
  const accent = store.accent_color || '#00A859'
  const waPhone = store.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''

  const hasSocials = store.instagram_handle || store.twitter_handle || store.facebook_url || store.website_url

  return (
    <footer className="bg-slate-950 text-slate-400 mt-6">
      <div className="max-w-2xl mx-auto px-4 pt-8 pb-6 space-y-6">

        {/* Store identity row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-black text-sm tracking-tight">{store.store_name}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Official Online Store</p>
          </div>
          {hasSocials && (
            <div className="flex items-center gap-3">
              {store.instagram_handle && (
                <a
                  href={`https://instagram.com/${store.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              )}
              {store.twitter_handle && (
                <a
                  href={`https://x.com/${store.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  aria-label="X / Twitter"
                >
                  <TwitterIcon />
                </a>
              )}
              {store.facebook_url && (
                <a
                  href={store.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
              )}
              {store.website_url && (
                <a
                  href={store.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                  aria-label="Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Contact details */}
        {(store.location || waPhone || store.email) && (
          <div className="border-t border-slate-800 pt-4 grid grid-cols-1 gap-2.5">
            {store.location && (
              <div className="flex items-center gap-2.5 text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span>{store.location}</span>
              </div>
            )}
            {waPhone && (
              <a
                href={`https://wa.me/${waPhone}`}
                className="flex items-center gap-2.5 text-xs hover:text-white transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span>{store.whatsapp_number}</span>
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}`}
                className="flex items-center gap-2.5 text-xs hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-600" />
                <span>{store.email}</span>
              </a>
            )}
          </div>
        )}

        {/* Return Policy */}
        {store.return_policy && (
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Return & Refund Policy</p>
                <p className="text-xs leading-relaxed text-slate-500">{store.return_policy}</p>
              </div>
            </div>
          </div>
        )}

        {/* Default return policy if none set */}
        {!store.return_policy && (
          <div className="border-t border-slate-800 pt-4">
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Return & Refund Policy</p>
                <p className="text-xs leading-relaxed text-slate-500">
                  Contact us within 24 hours of receiving your order if there is an issue. 
                  Returns are accepted for damaged or wrong items only.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Powered by Ondar */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <p className="text-[10px] text-slate-600">
            © {new Date().getFullYear()} {store.store_name}
          </p>
          <a
            href="https://ondar.shop"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 group"
          >
            <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors">Powered by</span>
            <span
              className="text-[10px] font-black group-hover:opacity-80 transition-opacity"
              style={{ color: accent }}
            >
              Ondar
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
