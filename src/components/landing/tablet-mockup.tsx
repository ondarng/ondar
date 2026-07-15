'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Minus, Pencil, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react'

interface TabletMockupProps {
  image?: string
  title?: string
  glow?: boolean
  shadow?: boolean
  className?: string
  children?: React.ReactNode
}

export function TabletMockup({ image, title, glow = true, shadow = true, className = '', children }: TabletMockupProps) {
  const [mounted, setMounted] = useState(false)
  const [stock, setStock] = useState(12)
  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simulate stock dropping because of the Leather Tote order
    const runAnimation = () => {
      setStock(12)
      setTimeout(() => {
        setHighlight(true)
        setTimeout(() => {
          setStock(11) // Deducts 1 stock due to order
          setTimeout(() => setHighlight(false), 500)
        }, 500)
      }, 4000)
    }

    runAnimation()
    const interval = setInterval(runAnimation, 8000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-[600px] md:max-w-[800px] ${className}`}>
      {glow && (
        <div className="absolute -inset-8 bg-gradient-to-tr from-[#00A859]/15 to-[#E7FFDB]/15 blur-[60px] rounded-[60px] -z-10" />
      )}
      
      <div className={`relative bg-neutral-900 rounded-[24px] md:rounded-[32px] p-3 md:p-4 border border-neutral-800 ${shadow ? 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]' : ''}`}>
        
        <div className="relative w-full aspect-[4/3] bg-slate-50 rounded-[12px] md:rounded-[16px] overflow-hidden overflow-y-auto">
          {image ? (
            <img src={image} alt={title || "Ondar on Tablet"} className="w-full h-full object-cover" />
          ) : children ? (
            children
          ) : (
            <div className={`w-full max-w-2xl mx-auto flex flex-col min-h-full transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              
              <header className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
                    <ArrowLeft className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-primary-900 text-base md:text-lg">Inventory</span>
                </div>
                <div className="bg-primary-50 text-primary-700 p-2 rounded-lg hover:bg-primary-100 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
              </header>

              <main className="flex-1 p-4 md:p-6 space-y-4">
                
                {/* The Target Product - Animated Stock */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-rose-300/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-primary-900 text-sm md:text-base truncate">Leather Tote</h3>
                      {highlight && <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-bounce">Just Ordered</span>}
                    </div>
                    <p className="font-display font-extrabold text-primary-600 text-xs md:text-sm">₦28,500</p>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Minus className="w-4 h-4" />
                      </div>
                      <span className={`font-bold text-primary-900 text-sm w-6 text-center transition-all duration-300 ${highlight ? 'text-red-500 scale-125' : 'text-neutral-900'}`}>
                        {stock}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Pencil className="w-4 h-4" /></div>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></div>
                  </div>
                  
                  {/* Subtle red flash overlay on stock decrease */}
                  {highlight && <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />}
                </div>

                {/* Generic Product 1 */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-purple-300/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary-900 text-sm md:text-base truncate">Silk Evening Gown</h3>
                    <p className="font-display font-extrabold text-primary-600 text-xs md:text-sm">₦45,000</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Minus className="w-4 h-4" /></div>
                      <span className="font-bold text-primary-900 text-sm w-6 text-center">5</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Pencil className="w-4 h-4" /></div>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></div>
                  </div>
                </div>
                
                {/* Generic Product 2 */}
                <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-blue-300/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary-900 text-sm md:text-base truncate">Silk Scarf</h3>
                    <p className="font-display font-extrabold text-primary-600 text-xs md:text-sm">₦12,000</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Minus className="w-4 h-4" /></div>
                      <span className="font-bold text-primary-900 text-sm w-6 text-center">28</span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Pencil className="w-4 h-4" /></div>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></div>
                  </div>
                </div>

              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
