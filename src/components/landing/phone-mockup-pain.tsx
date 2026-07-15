'use client'

import React, { useEffect, useState } from 'react'

interface PhoneMockupPainProps {
  glow?: boolean
  shadow?: boolean
  className?: string
}

export function PhoneMockupPain({ glow = true, shadow = true, className = '' }: PhoneMockupPainProps) {
  const [mounted, setMounted] = useState(false)
  const [newMessages, setNewMessages] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    const interval = setInterval(() => {
      setNewMessages(prev => (prev < 4 ? prev + 1 : 0))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative mx-auto w-full max-w-[280px] md:max-w-[320px] ${className}`}>
      {glow && (
        <div className="absolute -inset-4 bg-gradient-to-tr from-red-500/20 to-orange-500/20 blur-2xl rounded-[60px] -z-10" />
      )}
      
      <div className={`relative bg-[#0A0D14] rounded-[44px] border-[6px] md:border-[8px] border-neutral-900 overflow-hidden ${shadow ? 'shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]' : ''}`}>
        
        <div className="absolute top-0 inset-x-0 h-6 bg-neutral-900 z-30 rounded-b-[16px] w-[40%] mx-auto flex items-center justify-center">
          <div className="w-12 h-1.5 bg-black rounded-full opacity-50" />
        </div>
        
        <div className="relative w-full aspect-[9/19.5] bg-white overflow-hidden flex flex-col">
          <div className={`w-full h-full flex flex-col transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* WhatsApp Header */}
            <header className="bg-[#075E54] text-white pt-8 md:pt-10 shadow-sm z-10 flex flex-col">
              <div className="px-2.5 md:px-4 pb-3 md:pb-4 flex items-center justify-between">
                <h1 className="font-medium text-base md:text-[20px]">WhatsApp</h1>
                <div className="flex gap-2.5 md:gap-5">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </div>
              </div>
              <div className="flex text-[10px] md:text-[13px] font-bold text-white/70">
                <div className="px-2 md:px-3 pb-2 md:pb-3 flex justify-center items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                </div>
                <div className="flex-1 text-center pb-2 md:pb-3 border-b-[2.5px] md:border-b-[3px] border-white text-white">CHATS</div>
                <div className="flex-1 text-center pb-2 md:pb-3">STATUS</div>
                <div className="flex-1 text-center pb-2 md:pb-3">CALLS</div>
              </div>
            </header>

            {/* Chat List */}
            <div className="flex-1 overflow-hidden bg-white">
              
              {/* Chat 1 */}
              <div className={`flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-2 md:py-3 border-b border-neutral-100 transition-all duration-300 ${newMessages >= 1 ? 'bg-neutral-50' : ''}`}>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-300 shrink-0 flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 md:w-8 md:h-8 text-white mt-1 md:mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold text-xs md:text-[16px] truncate ${newMessages >= 1 ? 'text-black' : 'text-neutral-800'}`}>Customer 0803...</h3>
                    <span className={`text-[9px] md:text-xs shrink-0 ml-1 ${newMessages >= 1 ? 'text-[#25D366] font-bold' : 'text-neutral-500'}`}>12:02</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] md:text-[14px] text-neutral-500 truncate leading-snug">How much is the red bag?</p>
                    {newMessages >= 1 && <span className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] bg-[#25D366] text-white rounded-full text-[8px] md:text-[10px] flex items-center justify-center font-bold shrink-0 ml-1">1</span>}
                  </div>
                </div>
              </div>

              {/* Chat 2 */}
              <div className={`flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-2 md:py-3 border-b border-neutral-100 transition-all duration-300 ${newMessages >= 2 ? 'bg-neutral-50' : ''}`}>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="text-xs md:text-xl text-blue-700 font-medium">S</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold text-xs md:text-[16px] truncate ${newMessages >= 2 ? 'text-black' : 'text-neutral-800'}`}>Sarah IG</h3>
                    <span className={`text-[9px] md:text-xs shrink-0 ml-1 ${newMessages >= 2 ? 'text-[#25D366] font-bold' : 'text-neutral-500'}`}>12:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] md:text-[14px] text-neutral-500 truncate leading-snug">I've paid, confirm.</p>
                    {newMessages >= 2 && <span className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] bg-[#25D366] text-white rounded-full text-[8px] md:text-[10px] flex items-center justify-center font-bold shrink-0 ml-1">2</span>}
                  </div>
                </div>
              </div>

              {/* Chat 3 */}
              <div className={`flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-2 md:py-3 border-b border-neutral-100 transition-all duration-300 ${newMessages >= 3 ? 'bg-neutral-50' : ''}`}>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-slate-300 shrink-0 flex items-center justify-center overflow-hidden">
                  <svg className="w-5 h-5 md:w-8 md:h-8 text-white mt-1 md:mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold text-xs md:text-[16px] truncate ${newMessages >= 3 ? 'text-black' : 'text-neutral-800'}`}>Unknown</h3>
                    <span className={`text-[9px] md:text-xs shrink-0 ml-1 ${newMessages >= 3 ? 'text-[#25D366] font-bold' : 'text-neutral-500'}`}>11:58</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] md:text-[14px] text-neutral-500 truncate leading-snug">Do you have size 42?</p>
                    {newMessages >= 3 && <span className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] bg-[#25D366] text-white rounded-full text-[8px] md:text-[10px] flex items-center justify-center font-bold shrink-0 ml-1">1</span>}
                  </div>
                </div>
              </div>

              {/* Chat 4 */}
              <div className={`flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-2 md:py-3 border-b border-neutral-100 transition-all duration-300 ${newMessages >= 4 ? 'bg-neutral-50' : ''}`}>
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="text-xs md:text-xl text-purple-700 font-medium">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold text-xs md:text-[16px] truncate ${newMessages >= 4 ? 'text-black' : 'text-neutral-800'}`}>Adebayo</h3>
                    <span className={`text-[9px] md:text-xs shrink-0 ml-1 ${newMessages >= 4 ? 'text-[#25D366] font-bold' : 'text-neutral-500'}`}>11:45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] md:text-[14px] text-neutral-500 truncate leading-snug">Send account details</p>
                    {newMessages >= 4 && <span className="w-3.5 h-3.5 md:w-[18px] md:h-[18px] bg-[#25D366] text-white rounded-full text-[8px] md:text-[10px] flex items-center justify-center font-bold shrink-0 ml-1">3</span>}
                  </div>
                </div>
              </div>

              {/* Chat 5 (Read) */}
              <div className="flex items-center gap-2 md:gap-3 px-2.5 md:px-4 py-2 md:py-3 border-b border-neutral-100">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-rose-200 shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="text-xs md:text-xl text-rose-700 font-medium">C</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-xs md:text-[16px] truncate text-neutral-800">Chioma</h3>
                    <span className="text-[9px] md:text-xs shrink-0 ml-1 text-neutral-500">Yesterday</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-[#34B7F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7m-9 10l4-4" /></svg>
                    <p className="text-[11px] md:text-[14px] text-neutral-500 truncate leading-snug">Thanks! Received it.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Chaotic Overlay to emphasize pain */}
            <div className={`absolute inset-0 bg-red-500/5 pointer-events-none transition-opacity duration-1000 ${newMessages > 2 ? 'opacity-100' : 'opacity-0'}`} />

          </div>
        </div>
      </div>
    </div>
  )
}
