'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, Settings, LogOut } from 'lucide-react'

interface PhoneMockupDashboardProps {
  glow?: boolean
  shadow?: boolean
  className?: string
}

export function PhoneMockupDashboard({ glow = true, shadow = true, className = '' }: PhoneMockupDashboardProps) {
  const [mounted, setMounted] = useState(false)
  const [sales, setSales] = useState(1221500)
  const [orders, setOrders] = useState(41)
  const [newOrder, setNewOrder] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const runAnimation = () => {
      setTimeout(() => {
        setNewOrder(true)
        setSales(1250000)
        setOrders(42)
        
        setTimeout(() => {
          setNewOrder(false)
          setSales(1221500)
          setOrders(41)
        }, 4000)
      }, 1000)
    }

    runAnimation()
    const interval = setInterval(runAnimation, 6000)

    return () => clearInterval(interval)
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
        
        <div className="relative w-full aspect-[9/19.5] bg-slate-50 overflow-hidden overflow-y-auto">
          <div className={`w-full h-full pb-10 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* Mobile Dashboard Header */}
            <header className="bg-white px-4 py-3 sticky top-0 z-10 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-primary-600 rounded-md flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">O</span>
                </div>
                <span className="font-display font-bold text-sm text-primary-900 leading-none">Ondar</span>
              </div>
              <LogOut className="w-4 h-4 text-neutral-400" />
            </header>

            <div className="px-4 pt-5 space-y-4">
              
              {/* Store Header Card */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-[#00A859] rounded-full flex items-center justify-center text-white font-extrabold text-lg">
                  A
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-display font-bold text-primary-900">
                    Aura Boutique
                  </h2>
                  <p className="text-neutral-500 text-[10px] font-medium">
                    ondar.shop/aura
                  </p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[8px] font-bold uppercase tracking-wider border border-green-100 mt-1">
                    ✓ Store Live
                  </span>
                </div>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden transition-colors duration-300">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold">Total Sales</p>
                    <p className={`text-[15px] font-display font-extrabold transition-all duration-500 ${newOrder ? 'text-[#00A859] scale-105' : 'text-primary-900'}`}>
                      ₦{sales.toLocaleString()}
                    </p>
                  </div>
                  {newOrder && <div className="absolute inset-0 bg-green-500/10 animate-fade-out pointer-events-none" />}
                </div>

                <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden transition-colors duration-300">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-2">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-neutral-500 font-bold">Orders</p>
                    <p className={`text-[15px] font-display font-extrabold transition-all duration-500 ${newOrder ? 'text-blue-600 scale-105' : 'text-primary-900'}`}>
                      {orders}
                    </p>
                  </div>
                  {newOrder && <div className="absolute inset-0 bg-blue-500/10 animate-fade-out pointer-events-none" />}
                </div>
              </div>

              {/* Management Links */}
              <div className="space-y-3 pt-2">
                <h3 className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Management</h3>
                
                {/* Simulated incoming order pulse */}
                <div className={`relative bg-white p-3 rounded-2xl border ${newOrder ? 'border-[#00A859] shadow-md scale-[1.02]' : 'border-neutral-200 shadow-sm'} transition-all duration-500`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${newOrder ? 'bg-[#00A859] text-white' : 'bg-accent/5 text-accent'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-[12px] text-primary-900">Manage Orders</p>
                      <p className={`text-[10px] ${newOrder ? 'text-[#00A859] font-bold' : 'text-neutral-500'}`}>
                        {newOrder ? 'New order just arrived!' : 'Check WhatsApp inquiries'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-[12px] text-primary-900">Store Settings</p>
                    <p className="text-[10px] text-neutral-500">Branding & WhatsApp</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-out {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out {
          animation: fade-out 1s ease-out forwards;
        }
      `}} />
    </div>
  )
}
