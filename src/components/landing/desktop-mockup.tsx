'use client'

import React, { useEffect, useState } from 'react'
import { ShoppingBag, TrendingUp, Package, Clock, Check } from 'lucide-react'

interface DesktopMockupProps {
  image?: string
  title?: string
  glow?: boolean
  shadow?: boolean
  className?: string
  children?: React.ReactNode
}

export function DesktopMockup({ image, title, glow = true, shadow = true, className = '', children }: DesktopMockupProps) {
  const [mounted, setMounted] = useState(false)
  const [sales, setSales] = useState(1221500)
  const [orders, setOrders] = useState(41)
  const [newOrder, setNewOrder] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simulate receiving the order placed in the PhoneMockup
    const timer = setTimeout(() => {
      setNewOrder(true)
      setSales(1250000) // Added 28,500 for the Leather Tote
      setOrders(42)
      
      // Reset animation
      setTimeout(() => {
        setNewOrder(false)
        setSales(1221500)
        setOrders(41)
      }, 5000)
    }, 2000)
    
    const interval = setInterval(() => {
      setNewOrder(true)
      setSales(1250000)
      setOrders(42)
      setTimeout(() => {
        setNewOrder(false)
        setSales(1221500)
        setOrders(41)
      }, 5000)
    }, 8000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-[800px] md:max-w-[1000px] ${className}`}>
      {glow && (
        <div className="absolute -inset-10 bg-gradient-to-tr from-[#00A859]/10 to-[#E7FFDB]/10 blur-[80px] rounded-[60px] -z-10" />
      )}
      
      <div className={`relative bg-white rounded-[16px] md:rounded-[20px] overflow-hidden border border-neutral-200 ${shadow ? 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]' : ''}`}>
        
        <div className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto bg-white border border-neutral-200 rounded-md text-[10px] md:text-xs text-neutral-400 font-medium px-24 py-1 flex items-center justify-center">
            ondar.ng/dashboard
          </div>
        </div>
        
        <div className="relative w-full h-[450px] md:h-auto md:aspect-[16/10] bg-slate-50 overflow-hidden overflow-y-auto">
          {image ? (
            <img src={image} alt={title || "Ondar on Desktop"} className="w-full h-full object-cover" />
          ) : children ? (
            children
          ) : (
            <div className={`w-full h-full flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              
              {/* Desktop Dashboard Header */}
              <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
                    <span className="text-white text-lg font-bold">O</span>
                  </div>
                  <span className="font-display font-bold text-lg text-primary-900 leading-none">Ondar</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200" />
              </header>

              <div className="flex-1 overflow-y-auto px-6 py-8">
                <div className="w-full max-w-2xl mx-auto space-y-6">

                  {/* Store Header Box */}
                  <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm flex items-center gap-6">
                    <div className="w-20 h-20 bg-[#00A859] rounded-full flex items-center justify-center text-white font-extrabold text-3xl shrink-0">
                      A
                    </div>
                    <div className="flex-1 space-y-1">
                      <h2 className="text-2xl font-bold text-neutral-900">Aura Boutique</h2>
                      <p className="text-sm text-neutral-500 font-medium">ondar.shop/aura</p>
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                          <Check className="w-3 h-3" /> Store Live
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-lg font-extrabold text-neutral-900 pt-2">Today's Overview</h2>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2 relative overflow-hidden transition-colors duration-300">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Total Sales</p>
                        <p className={`text-2xl font-display font-extrabold transition-all duration-500 ${newOrder ? 'text-[#00A859] scale-105' : 'text-neutral-900'}`}>
                          ₦{sales.toLocaleString()}
                        </p>
                      </div>
                      {newOrder && <div className="absolute inset-0 bg-green-500/10 animate-fade-out pointer-events-none" />}
                    </div>
                    
                    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm space-y-2 relative overflow-hidden transition-colors duration-300">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">Orders</p>
                        <p className={`text-2xl font-display font-extrabold transition-all duration-500 ${newOrder ? 'text-blue-600 scale-105' : 'text-neutral-900'}`}>
                          {orders}
                        </p>
                      </div>
                      {newOrder && <div className="absolute inset-0 bg-blue-500/10 animate-fade-out pointer-events-none" />}
                    </div>
                  </div>

                  {/* Management Links & Recent Activity */}
                  <div className="space-y-4 pt-4 relative">
                    {/* Simulated Order Incoming Toast */}
                    <div className={`absolute -top-16 left-0 right-0 bg-[#00A859] text-white p-3 rounded-xl shadow-lg flex items-center justify-between transition-all duration-500 z-20 ${newOrder ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">New Order Received!</p>
                          <p className="text-xs opacity-90">Leather Tote • ₦28,500</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-white/20 rounded-md">Just Now</span>
                    </div>

                    <h3 className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Management</h3>
                    
                    <div className={`flex items-center justify-between bg-white p-4 rounded-xl border transition-all duration-500 ${newOrder ? 'border-[#00A859] shadow-md scale-[1.01]' : 'border-neutral-200 shadow-sm'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${newOrder ? 'bg-[#00A859] text-white' : 'bg-accent/5 text-accent'}`}>
                          <Clock className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-base">Manage Orders</p>
                          <p className={`text-sm ${newOrder ? 'text-[#00A859] font-bold' : 'text-neutral-500'}`}>
                            {newOrder ? '1 new inquiry requires action!' : 'Check WhatsApp inquiries'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-base">Inventory</p>
                          <p className="text-sm text-neutral-500">24 products listed</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}
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
