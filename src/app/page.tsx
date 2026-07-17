'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PhoneMockup } from '@/components/landing/phone-mockup'
import { PhoneMockupPain } from '@/components/landing/phone-mockup-pain'
import { PhoneMockupDashboard } from '@/components/landing/phone-mockup-dashboard'
import { DesktopMockup } from '@/components/landing/desktop-mockup'
import { TabletMockup } from '@/components/landing/tablet-mockup'

const HEADLINES = [
  "Your WhatsApp business deserves a real storefront.",
  "Stop copy-pasting bank details in DMs.",
  "Sell professionally. Keep using WhatsApp.",
  "One checkout link. Zero chat chaos."
]

export default function Home() {
  const [headlineIndex, setHeadlineIndex] = useState(0)

  useEffect(() => {
    // Reveal interaction for general elements
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');
          observer.unobserve(entry.target); // Only reveal once
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
      observer.observe(el);
    });

    // Headline rotation
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length)
    }, 4000)

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Ondar",
    "url": "https://ondar.shop",
    "logo": "https://ondar.shop/logo.png",
    "description": "The simplest storefront for Nigerian social media vendors. Stop copy-pasting bank details and sell professionally via WhatsApp.",
    "sameAs": [
      "https://twitter.com/ondar_shop",
      "https://instagram.com/ondar.shop"
    ]
  };

  return (
    <div className="bg-white text-neutral-900 selection:bg-[#00A859]/20 selection:text-[#00342b] min-h-screen font-body overflow-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {/* 1. Minimal Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="flex justify-between items-center w-full px-6 md:px-8 max-w-[1200px] mx-auto h-20">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ondar" className="h-6" />
          </Link>
          <div className="hidden md:flex gap-8 items-center">
            <a className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors" href="#workflow">How it Works</a>
            <a className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors" href="#everyday">Everyday Use</a>
            <a className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors" href="#pricing">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="hidden sm:block text-sm font-medium text-neutral-600 hover:text-neutral-900">Login</a>
            <a href="/signup" className="bg-[#00342b] text-white px-5 py-2.5 rounded-full text-sm font-semibold active:scale-95 transition-transform hover:bg-[#002212]">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* 2. Hero Section */}
        <section className="pt-24 pb-32 md:pt-32 px-6 md:px-8 relative">
          <div className="max-w-[1000px] mx-auto text-center flex flex-col items-center">
            <div className="h-[150px] xs:h-[120px] sm:h-[110px] md:h-[140px] lg:h-[180px] flex items-center justify-center w-full relative mb-4">
              {HEADLINES.map((headline, idx) => (
                <h1 
                  key={idx}
                  className={`absolute w-full text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-neutral-900 leading-[1.1] tracking-tight transition-all duration-1000 ${idx === headlineIndex ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-4 -z-10'}`}
                >
                  {headline}
                </h1>
              ))}
            </div>
            
            <p className="text-lg md:text-xl text-neutral-500 mb-10 max-w-[600px] leading-relaxed reveal delay-100">
              Give your WhatsApp business a professional storefront in 5 minutes. No coding, no complicated setup. Just smooth selling.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto reveal delay-200">
              <a href="/signup" className="bg-[#00342b] text-white px-8 py-4 rounded-full font-semibold text-lg active:scale-95 transition-transform flex items-center justify-center">
                Create Your Store
              </a>
              <a href="#workflow" className="text-neutral-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-neutral-50 active:scale-95 transition-all flex items-center justify-center border border-neutral-200">
                See How It Works
              </a>
            </div>
          </div>
        </section>

        {/* 3. The Sticky Stacked Cards (Workflow) */}
        <section id="workflow" className="relative pb-40 pt-16 px-4 md:px-8 bg-neutral-100">
          <div className="max-w-[1200px] mx-auto">
            
            <div className="text-center mb-16 md:mb-24 reveal">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
                Stop drowning in DMs.
              </h2>
              <p className="text-neutral-500 text-lg md:text-xl max-w-2xl mx-auto">
                See how Ondar transforms the way you sell, giving you back hours of your day.
              </p>
            </div>

            <div className="flex flex-col gap-6 md:gap-0 relative">

              {/* Stacked Card 1: The Reality */}
              <div className="sticky top-16 md:top-20 lg:top-28 z-10 w-full h-[85vh] min-h-[500px] max-h-[800px] lg:h-auto lg:min-h-0 bg-[#111111] rounded-[24px] md:rounded-[48px] border border-neutral-800 shadow-2xl overflow-hidden reveal transition-all duration-500">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center text-left shrink-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-8">
                      <span className="inline-block bg-red-500/10 text-red-400 px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest uppercase border border-red-500/20">The Reality</span>
                      <span className="inline-block bg-neutral-900 text-neutral-400 px-3 py-1 md:px-4 md:py-2 rounded-full font-medium text-[10px] md:text-xs border border-neutral-700 flex items-center gap-1.5">
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Wasting 3 hrs/day
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-3 md:mb-6 leading-tight">
                      Selling on WhatsApp is chaotic.
                    </h3>
                    <p className="text-[15px] md:text-lg text-neutral-400 mb-6 md:mb-10 leading-relaxed">
                      You post 20 blurry photos on your status. Customers reply "How much?" You spend hours replying manually while losing track of who actually paid and what's out of stock.
                    </p>
                    <a href="/signup" className="inline-flex items-center gap-2 bg-white text-black px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-neutral-200 transition-all w-fit">
                      Try Ondar Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                  {/* Mockup Side */}
                  <div className="w-full lg:w-1/2 bg-[#1a1a1a] flex-1 flex justify-center items-start pt-4 lg:pt-16 px-4 lg:px-16 relative">
                    <div className="w-full max-w-[200px] md:max-w-[300px] lg:max-w-[320px] drop-shadow-2xl translate-y-0 lg:translate-y-12 group-hover:translate-y-8 transition-transform duration-700">
                      <PhoneMockupPain />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Card 2: The Solution (Storefront) */}
              <div className="sticky top-20 md:top-24 lg:top-36 z-20 w-full h-[85vh] min-h-[500px] max-h-[800px] lg:h-auto lg:min-h-0 bg-[#F0FDF4] rounded-[24px] md:rounded-[48px] border border-green-200 shadow-2xl overflow-hidden reveal transition-all duration-500">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center text-left shrink-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-8">
                      <span className="inline-block bg-[#00A859]/10 text-[#00A859] px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest uppercase border border-[#00A859]/20">The Solution</span>
                      <span className="inline-block bg-white text-neutral-500 px-3 py-1 md:px-4 md:py-2 rounded-full font-medium text-[10px] md:text-xs border border-green-200 flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Instant checkouts
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-3 md:mb-6 leading-tight">
                      Give them a premium checkout.
                    </h3>
                    <p className="text-[15px] md:text-lg text-neutral-600 mb-6 md:mb-10 leading-relaxed">
                      Your customers browse a sleek storefront, see live prices, and place perfectly formatted orders straight to your WhatsApp. You look like a top-tier brand, and they check out in seconds without the endless "How much?" back-and-forth.
                    </p>
                    <a href="/signup" className="inline-flex items-center gap-2 bg-[#00A859] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-[#00924D] transition-all w-fit shadow-lg shadow-[#00A859]/20">
                      Try Ondar Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                  {/* Mockup Side */}
                  <div className="w-full lg:w-1/2 bg-[#e6fcf0] flex-1 flex justify-center items-start pt-4 lg:pt-16 px-4 lg:px-16 relative overflow-hidden">
                    <div className="w-full max-w-[200px] md:max-w-[300px] lg:max-w-[320px] drop-shadow-[0_35px_35px_rgba(0,168,89,0.2)] translate-y-0 lg:translate-y-12 group-hover:translate-y-8 transition-transform duration-700 relative">
                      <PhoneMockup title="Premium Storefront" glow={true} />
                      {/* Floating Visual */}
                      <div className="absolute -right-2 md:-right-12 top-20 bg-white p-2 md:p-3 rounded-xl shadow-xl border border-green-100 flex items-center gap-2 md:gap-3 animate-bounce z-20 scale-90 md:scale-100 origin-right" style={{ animationDuration: '3s' }}>
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-[10px] md:text-sm">🛍️</div>
                        <div>
                          <p className="text-[9px] md:text-xs font-bold text-neutral-900 leading-tight">New Order</p>
                          <p className="text-[8px] md:text-[10px] text-green-600 font-bold leading-tight">₦28,500</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Card 3: Inventory & Sync */}
              <div className="sticky top-24 md:top-28 lg:top-44 z-30 w-full h-[85vh] min-h-[500px] max-h-[800px] lg:h-auto lg:min-h-0 bg-[#EFF4FF] rounded-[24px] md:rounded-[48px] border border-blue-200 shadow-2xl overflow-hidden reveal transition-all duration-500">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center text-left shrink-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-8">
                      <span className="inline-block bg-blue-500/10 text-blue-600 px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest uppercase border border-blue-500/20">Live Sync</span>
                      <span className="inline-block bg-white text-neutral-500 px-3 py-1 md:px-4 md:py-2 rounded-full font-medium text-[10px] md:text-xs border border-blue-200 flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Real-time inventory
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-3 md:mb-6 leading-tight">
                      Never sell out of stock items.
                    </h3>
                    <p className="text-[15px] md:text-lg text-neutral-600 mb-6 md:mb-10 leading-relaxed">
                      Your inventory syncs instantly. The moment a customer buys your last pair, it shows as "Sold Out". Save hours tracking stock on paper.
                    </p>
                    <a href="/signup" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-blue-700 transition-all w-fit shadow-lg shadow-blue-500/20">
                      Try Ondar Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                  {/* Mockup Side - Minimalist Inventory UI */}
                  <div className="w-full lg:w-1/2 bg-[#e0ecff] flex-1 flex justify-center items-start pt-4 lg:pt-16 px-4 lg:px-16 relative overflow-hidden">
                    <div className="w-full max-w-[280px] md:max-w-[400px] lg:max-w-[450px] drop-shadow-[0_20px_40px_rgba(37,99,235,0.15)] scale-[0.85] sm:scale-100 origin-top translate-y-0 lg:translate-y-12 transition-transform duration-700">
                      <TabletMockup title="Inventory Sync" shadow={false} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Card 4: Receipts & Dashboard */}
              <div className="sticky top-28 md:top-32 lg:top-48 z-40 w-full h-[85vh] min-h-[500px] max-h-[800px] lg:h-auto lg:min-h-0 bg-[#00342b] rounded-[24px] md:rounded-[48px] border border-[#00473a] shadow-2xl overflow-hidden reveal transition-all duration-500">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center text-left shrink-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-8">
                      <span className="inline-block bg-[#00A859]/20 text-[#4ADE80] px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest uppercase border border-[#4ADE80]/30">The Magic</span>
                      <span className="inline-block bg-[#00221c] text-neutral-300 px-3 py-1 md:px-4 md:py-2 rounded-full font-medium text-[10px] md:text-xs border border-[#00473a] flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Auto-Receipts
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-3 md:mb-6 leading-tight">
                      Build trust with professional receipts.
                    </h3>
                    <p className="text-[15px] md:text-lg text-[#9ca3af] mb-6 md:mb-10 leading-relaxed">
                      Stop arguing over "I paid you yesterday". Every order is logged, and Ondar instantly generates a beautiful PDF receipt you can share with your customers. Look like a premium business, and build massive trust.
                    </p>
                    <a href="/signup" className="inline-flex items-center gap-2 bg-[#00A859] text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-[#00924D] transition-all w-fit shadow-lg shadow-[#00A859]/20">
                      Get Started Free <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                  {/* Mockup Side */}
                  <div className="w-full lg:w-1/2 bg-[#00221c] flex-1 flex justify-center items-start pt-4 lg:pt-16 px-4 lg:px-16 relative overflow-hidden">
                    <div className="w-full max-w-[200px] md:max-w-[300px] lg:max-w-[320px] drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] translate-y-0 lg:translate-y-12 group-hover:translate-y-8 transition-transform duration-700 relative">
                      <PhoneMockupDashboard />
                      {/* Floating Receipt Visual */}
                      <div className="absolute -left-2 md:-left-12 top-32 bg-white p-2 md:p-3 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-neutral-100 flex items-center gap-2 md:gap-3 animate-bounce z-20 scale-90 md:scale-100 origin-left" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        </div>
                        <div>
                          <p className="text-[9px] md:text-xs font-bold text-neutral-900 leading-tight">Receipt_#1042.pdf</p>
                          <p className="text-[8px] md:text-[10px] text-neutral-500 leading-tight">Generated automatically</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Stacked Card 6: Customer Memory */}
              <div className="sticky top-36 md:top-40 lg:top-64 z-50 w-full h-[85vh] min-h-[500px] max-h-[800px] lg:h-auto lg:min-h-0 bg-[#FAF9FF] rounded-[24px] md:rounded-[48px] border border-purple-200 shadow-2xl overflow-hidden reveal transition-all duration-500">
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Text Side */}
                  <div className="w-full lg:w-1/2 p-6 md:p-12 lg:p-16 flex flex-col justify-center text-left shrink-0">
                    <div className="flex flex-wrap items-center gap-2 mb-4 md:mb-8">
                      <span className="inline-block bg-purple-500/10 text-purple-700 px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-[10px] md:text-xs tracking-widest uppercase border border-purple-500/20">Retention CRM</span>
                      <span className="inline-block bg-white text-neutral-500 px-3 py-1 md:px-4 md:py-2 rounded-full font-medium text-[10px] md:text-xs border border-purple-200 flex items-center gap-1.5 shadow-sm">
                        <svg className="w-3 h-3 md:w-4 md:h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        Customer Memory
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-3 md:mb-6 leading-tight">
                      Build relationships, not just sales.
                    </h3>
                    <p className="text-[15px] md:text-lg text-neutral-600 mb-6 md:mb-10 leading-relaxed">
                      Remembering every customer's preference, sizes, delivery addresses, and payment logs is impossible. Ondar automatically builds a clean customer card history, letting you offer a premium, VIP treatment every time they message.
                    </p>
                    <a href="/signup" className="inline-flex items-center gap-2 bg-purple-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-purple-800 transition-all w-fit shadow-lg shadow-purple-500/20">
                      Upgrade to Ondar <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                  {/* Mockup Side */}
                  <div className="w-full lg:w-1/2 bg-[#F5F3FF] flex-1 flex justify-center items-start pt-4 lg:pt-16 px-4 lg:px-16 relative overflow-hidden">
                    <div className="w-full max-w-[240px] md:max-w-[340px] lg:max-w-[360px] bg-white rounded-3xl p-4 md:p-6 shadow-xl border border-purple-100/50 translate-y-0 lg:translate-y-12 transition-transform duration-700 flex flex-col gap-3">
                      <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                        <span className="font-bold text-xs md:text-sm text-neutral-950">Customer Profiles</span>
                        <span className="text-[8px] md:text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Memory</span>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="w-9 h-9 bg-purple-200 rounded-full flex items-center justify-center font-bold text-purple-700 text-xs shrink-0">TA</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <p className="font-bold text-[11px] text-neutral-900 truncate">Tunde Alabi</p>
                            <span className="text-[8px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full shrink-0">VIP</span>
                          </div>
                          <p className="text-[9px] text-neutral-500">12 orders • Fav: Black Loafers (Sz 44)</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="w-9 h-9 bg-green-200 rounded-full flex items-center justify-center font-bold text-green-700 text-xs shrink-0">SN</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[11px] text-neutral-900 truncate">Somto Nwachukwu</p>
                          <p className="text-[9px] text-neutral-500">4 orders • Notes: Prefers evening dropoff</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2 bg-neutral-50 rounded-xl border border-neutral-100">
                        <div className="w-9 h-9 bg-pink-200 rounded-full flex items-center justify-center font-bold text-pink-700 text-xs shrink-0">CO</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[11px] text-neutral-900 truncate">Chioma Okoro</p>
                          <p className="text-[9px] text-neutral-500">Last order: ₦45,000 Silk Gown</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3.5. Everyday Life Demo Section */}
        <section className="py-24 md:py-32 px-6 md:px-8 bg-neutral-950 text-white relative overflow-hidden">

          <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
            {/* Text Side */}
            <div className="w-full lg:w-1/2 space-y-6 md:space-y-8 text-left reveal">
              <span className="inline-block bg-[#00A859]/20 text-[#4ADE80] px-4 py-2 rounded-full font-bold text-xs tracking-widest uppercase border border-[#4ADE80]/30">
                Passive Commerce
              </span>
              <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight text-white">
                Run your empire, right from your bed.
              </h2>
              <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                You don't need to stay glued to WhatsApp chats, confirming payments and checking stock 24/7. Ondar works silently in the background. While you rest, orders flow directly into your dashboard, inventory counts deduct in real-time, and custom checkout links verify details automatically.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-green-950 text-green-400 rounded-xl flex items-center justify-center font-bold text-sm">⚡</div>
                  <h4 className="font-bold text-white text-sm">Automated Syncing</h4>
                  <p className="text-xs text-neutral-400">Stock updates instantly on checkouts, preventing oversells.</p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-amber-950 text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm">📝</div>
                  <h4 className="font-bold text-white text-sm">Direct Checkouts</h4>
                  <p className="text-xs text-neutral-400">Customers pay and log addresses directly, saving chat friction.</p>
                </div>
              </div>
            </div>

            {/* Visual Side */}
            <div className="w-full lg:w-1/2 flex justify-center items-center relative reveal delay-200">
              <div className="relative w-full max-w-[450px] aspect-[4/3] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl">
                <img 
                  src="/vendor_bed.png" 
                  alt="Online merchant running store from bed" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating CSS badges for interactivity */}
                <div className="absolute left-2 sm:-left-4 top-4 sm:top-8 bg-white p-2 sm:p-3 rounded-2xl shadow-xl border border-neutral-100 flex items-center gap-2 sm:gap-3 animate-bounce scale-75 sm:scale-90 md:scale-100 origin-left" style={{ animationDuration: '3.5s' }}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs sm:text-sm">🎉</div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-neutral-900 leading-tight">Order Confirmed</p>
                    <p className="text-[8px] sm:text-[9px] text-green-600 font-bold leading-tight">₦28,500 Payout logged</p>
                  </div>
                </div>

                <div className="absolute right-2 sm:-right-4 top-20 sm:top-24 bg-neutral-900/80 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-neutral-800 flex items-center gap-2 sm:gap-3 animate-pulse scale-75 sm:scale-90 md:scale-100 origin-right">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs sm:text-sm">🔄</div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white leading-tight">Live Inventory Sync</p>
                    <p className="text-[8px] sm:text-[9px] text-neutral-300 leading-tight">Nike Air Max: Restocked</p>
                  </div>
                </div>

                <div className="absolute left-2 sm:left-6 bottom-4 sm:bottom-8 bg-neutral-900/90 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-neutral-800 flex items-center gap-2 sm:gap-3 animate-bounce scale-75 sm:scale-90 md:scale-100 origin-left" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center text-xs sm:text-sm">👤</div>
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white leading-tight">Sarah IG (VIP Customer)</p>
                    <p className="text-[8px] sm:text-[9px] text-purple-400 font-bold leading-tight">Address logged in CRM</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 4. "Where Ondar Fits Into Everyday Life" Grid */}
        <section id="everyday" className="py-32 px-6 md:px-8 bg-white relative">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-neutral-900 mb-12 text-center reveal">
              Where Ondar Fits Into Everyday Life
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Grid Item 1 */}
              <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:shadow-lg hover:border-neutral-200 transition-all duration-300 reveal delay-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-8 w-full flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00A859]"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">New Order • 2m ago</span>
                      <span className="text-sm font-bold text-neutral-900">Nike Air Max 90</span>
                    </div>
                    <span className="text-sm font-black text-[#00A859]">₦85,000</span>
                  </div>
                </div>
                <h4 className="font-bold text-neutral-900 text-lg mb-3">Instagram Fashion Brand</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">Stop asking for DMs to order. Put your Ondar link in your IG bio.</p>
              </div>

              {/* Grid Item 2 */}
              <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:shadow-lg hover:border-neutral-200 transition-all duration-300 reveal delay-100">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-8 w-full flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00A859]"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">New Order • 15m ago</span>
                      <span className="text-sm font-bold text-neutral-900">Braiding Hair (Col 30)</span>
                    </div>
                    <span className="text-sm font-black text-[#00A859]">₦12,500</span>
                  </div>
                </div>
                <h4 className="font-bold text-neutral-900 text-lg mb-3">Hair & Beauty Vendors</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">Let clients choose colors, lengths, and styles directly from your store.</p>
              </div>

              {/* Grid Item 3 */}
              <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:shadow-lg hover:border-neutral-200 transition-all duration-300 reveal delay-200">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-8 w-full flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00A859]"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">New Order • 1h ago</span>
                      <span className="text-sm font-bold text-neutral-900">Jollof & Turkey x2</span>
                    </div>
                    <span className="text-sm font-black text-[#00A859]">₦8,000</span>
                  </div>
                </div>
                <h4 className="font-bold text-neutral-900 text-lg mb-3">Food Businesses</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">Take food orders seamlessly without mixing up addresses or payments.</p>
              </div>

              {/* Grid Item 4 */}
              <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 hover:shadow-lg hover:border-neutral-200 transition-all duration-300 reveal delay-300">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 mb-8 w-full flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#00A859]"></div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">New Order • 2h ago</span>
                      <span className="text-sm font-bold text-neutral-900">MacBook Pro Case</span>
                    </div>
                    <span className="text-sm font-black text-[#00A859]">₦15,000</span>
                  </div>
                </div>
                <h4 className="font-bold text-neutral-900 text-lg mb-3">Gadget & Tech Sellers</h4>
                <p className="text-sm text-neutral-500 leading-relaxed">Display high-quality images and clear specs without flooding your WhatsApp status.</p>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Pricing Section */}
        <section className="py-32 px-6 md:px-8 bg-neutral-100" id="pricing">
          <div className="max-w-[1200px] mx-auto text-center reveal">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-neutral-900 mb-4">
              Simple, transparent pricing.
            </h2>
            <p className="text-neutral-500 text-lg md:text-xl mb-16 max-w-xl mx-auto">
              We only make money when you make money. Start building your empire today.
            </p>

            <div className="max-w-[420px] mx-auto border border-neutral-200 rounded-[40px] p-6 sm:p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-shadow duration-500 bg-white">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Pro Plan</h3>
              <div className="flex items-end justify-center gap-1 mb-10">
                <span className="text-6xl font-black text-neutral-900 tracking-tight">₦750</span>
                <span className="text-neutral-500 font-medium mb-1">/mo</span>
              </div>
              
              <ul className="space-y-5 mb-12 text-left">
                <li className="flex items-center gap-4 text-neutral-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  Unlimited products
                </li>
                <li className="flex items-center gap-4 text-neutral-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  Unlimited orders & receipts
                </li>
                <li className="flex items-center gap-4 text-neutral-700 font-medium">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#00A859]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  Dashboard & Live Inventory
                </li>
              </ul>

              <a href="/signup" className="block w-full bg-neutral-900 text-white py-4 md:py-5 rounded-full font-bold text-base md:text-lg hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
                Start 14-Day Free Trial
              </a>
              <p className="text-[10px] md:text-xs font-medium text-neutral-400 mt-4 md:mt-6 uppercase tracking-widest">No credit card required.</p>
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="py-40 md:py-56 px-6 md:px-8 bg-neutral-900 text-center reveal relative">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#00A859]/10 to-transparent" />
          
          <div className="max-w-[800px] mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8 leading-tight">
              Ready to give your business the storefront it deserves?
            </h2>
            <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
              Join thousands of Nigerian businesses selling smarter, faster, and more professionally with Ondar.
            </p>
            <a href="/signup" className="inline-flex bg-[#00A859] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-[#00924D] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#00A859]/30">
              Create Your Free Store
            </a>
          </div>
        </section>
      </main>

      {/* 7. Minimal Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-16 px-6 md:px-8">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Ondar" className="h-6 grayscale opacity-50 invert" />
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold tracking-wide text-neutral-500 uppercase">
            <a href="#workflow" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms-of-service" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-6 text-neutral-500">
            <a href="https://instagram.com/ondar.ng" className="hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
            <a href="https://x.com/ondarng" className="hover:text-white transition-colors">
              <span className="sr-only">X (Twitter)</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
