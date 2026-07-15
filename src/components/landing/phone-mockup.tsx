'use client'

import React, { useEffect, useState } from 'react'
import { Search, Share2, ShoppingBag, ArrowRight } from 'lucide-react'

interface PhoneMockupProps {
  image?: string
  title?: string
  glow?: boolean
  shadow?: boolean
  className?: string
}

export function PhoneMockup({ image, title, glow = true, shadow = true, className = '' }: PhoneMockupProps) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // Animation loop for the customer journey
    const runAnimation = () => {
      setStep(0)
      setTimeout(() => setStep(1), 1500) // Cursor moves over product
      setTimeout(() => setStep(2), 2500) // Taps product, opens bottom sheet / WhatsApp redirect
      setTimeout(() => setStep(3), 4000) // Shows pre-filled WhatsApp message
      setTimeout(() => runAnimation(), 8000) // Reset after reading
    }
    
    const timer = setTimeout(runAnimation, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-[280px] md:max-w-[320px] ${className}`}>
      {glow && (
        <div className="absolute -inset-4 bg-gradient-to-tr from-[#00A859]/20 to-[#E7FFDB]/20 blur-2xl rounded-[60px] -z-10" />
      )}
      
      <div className={`relative bg-[#0A0D14] rounded-[44px] border-[6px] md:border-[8px] border-neutral-900 overflow-hidden ${shadow ? 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]' : ''}`}>
        
        <div className="absolute top-0 inset-x-0 h-6 bg-neutral-900 z-30 rounded-b-[16px] w-[40%] mx-auto flex items-center justify-center">
          <div className="w-12 h-1.5 bg-black rounded-full opacity-50" />
        </div>
        
        <div className="relative w-full aspect-[9/19.5] bg-[#F5F5F5] overflow-hidden">
          {image ? (
            <img src={image} alt={title || "Ondar Storefront"} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full relative transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Step 0 & 1: Storefront Browsing */}
              <div className={`absolute inset-0 bg-[#F5F5F5] transition-opacity duration-500 ${step < 3 ? 'opacity-100 z-10' : 'opacity-0 -z-10'}`}>
                <header className="bg-white px-4 pt-8 pb-3 sticky top-0 z-10 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00A859] flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-extrabold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-[14px] font-extrabold text-neutral-900 leading-tight truncate">Aura Boutique</h1>
                      <p className="text-[10px] text-neutral-500 leading-tight truncate">Premium Fashion</p>
                    </div>
                    <Share2 className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="relative mt-3 mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
                    <div className="w-full bg-white border border-neutral-200 rounded-full pl-8 py-1.5 text-[11px] text-neutral-400">Search Aura products…</div>
                  </div>
                </header>

                <div className="px-3 pt-3">
                  {/* Category Pills */}
                  <div className="flex gap-2 overflow-hidden mb-3">
                    <span className="px-3 py-1 bg-[#00A859] text-white rounded-full text-[9px] font-bold">All</span>
                    <span className="px-3 py-1 bg-white border border-neutral-200 text-neutral-600 rounded-full text-[9px] font-bold">Bags</span>
                    <span className="px-3 py-1 bg-white border border-neutral-200 text-neutral-600 rounded-full text-[9px] font-bold">Shoes</span>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h2 className="text-[12px] font-extrabold text-neutral-900">Available Inventory</h2>
                      <p className="text-[9px] text-neutral-400">2 items</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* The Target Product */}
                    <div className={`flex flex-col bg-white rounded-xl overflow-hidden shadow-sm transition-transform duration-300 ${step === 1 ? 'scale-[1.02] ring-2 ring-[#00A859]' : ''}`}>
                      <div className="w-full aspect-square bg-neutral-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <ShoppingBag className="w-8 h-8 text-neutral-300" />
                        </div>
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-[#00A859] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          <span className="text-[6px]">✓</span> Available
                        </span>
                      </div>
                      <div className="p-2">
                        <h3 className="text-[10px] font-bold text-neutral-800 leading-snug line-clamp-2">Leather Tote</h3>
                        <p className="text-[8px] text-neutral-400 truncate">Black • Medium</p>
                        <p className="text-[11px] font-extrabold text-neutral-900 mt-0.5">₦28,500</p>
                      </div>
                    </div>

                    {/* Generic Product */}
                    <div className="flex flex-col bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="w-full aspect-square bg-neutral-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <ShoppingBag className="w-8 h-8 text-neutral-300" />
                        </div>
                        <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                          ⚠ Limited
                        </span>
                      </div>
                      <div className="p-2">
                        <h3 className="text-[10px] font-bold text-neutral-800 leading-snug line-clamp-2">Silk Scarf</h3>
                        <p className="text-[8px] text-neutral-400 truncate">Floral • Standard</p>
                        <p className="text-[11px] font-extrabold text-neutral-900 mt-0.5">₦12,000</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Cursor */}
                <div 
                  className={`absolute z-50 transition-all duration-700 ease-in-out pointer-events-none w-6 h-6 bg-white/50 rounded-full border-2 border-black flex items-center justify-center shadow-lg
                    ${step === 0 ? 'top-[80%] left-[80%] opacity-0' : ''}
                    ${step === 1 ? 'top-[45%] left-[30%] opacity-100' : ''}
                    ${step >= 2 ? 'top-[45%] left-[30%] scale-75 bg-black/20 opacity-0' : ''}
                  `}
                >
                  <div className="w-1 h-1 bg-black rounded-full" />
                </div>
                
                {/* Checkout Bottom Sheet (Step 2) */}
                <div className={`absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 z-20 px-4 py-5 ${step === 2 ? 'translate-y-0' : 'translate-y-full'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-orange-100 rounded-lg" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900">Leather Tote</p>
                      <p className="text-xs font-extrabold text-[#00A859]">₦28,500</p>
                    </div>
                  </div>
                  <div className="bg-[#25D366] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Send Order via WhatsApp
                  </div>
                </div>
              </div>

              {/* Step 3: WhatsApp Screen */}
              <div className={`absolute inset-0 bg-[#E5DDD5] transition-transform duration-500 ${step === 3 ? 'translate-x-0 z-20' : 'translate-x-full z-20'}`}>
                <div className="bg-[#075E54] text-white px-4 pt-10 pb-3 flex items-center gap-3 shadow-md">
                  <ArrowRight className="w-5 h-5 rotate-180" />
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">A</div>
                  <h2 className="text-sm font-bold">Aura Boutique</h2>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="bg-[#DCF8C6] p-3 rounded-2xl rounded-tr-none max-w-[85%] self-end shadow-sm animate-pop-in">
                    <p className="text-[11px] text-neutral-800 leading-relaxed whitespace-pre-wrap">
                      Hello! I want to order:
                      <br/><br/>
                      <span className="font-bold">1x Leather Tote (₦28,500)</span>
                      <br/><br/>
                      Total: ₦28,500
                    </p>
                    <p className="text-[8px] text-neutral-500 text-right mt-1">12:00 PM ✓✓</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pop-in {
          0% { transform: scale(0.9) translateY(10px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-pop-in {
          animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}} />
    </div>
  )
}
