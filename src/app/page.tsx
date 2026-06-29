'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    // Set target to exactly 14 days from initial load to ensure it always looks good for the demo, 
    // or use a fixed date. We'll use a fixed future date (e.g. 14 days from now) to simulate the 2 week launch.
    const target = new Date().getTime() + (14 * 24 * 60 * 60 * 1000);
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true)
    // Simple scroll reveal interaction
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-10');
      observer.observe(el);
    });
  }, [])

  return (
    <div className="bg-[#f8faf8] text-gray-900 selection:bg-primary-100 selection:text-primary-900 overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f8faf8]/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center w-full px-6 md:px-8 max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Ondar" className="h-7" />
          </div>
          {/* Desktop Links */}
          <div className="hidden md:flex gap-8 items-center">
            <a className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200" href="#features">Features</a>
            <a className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200" href="#how-it-works">How it Works</a>
            <a className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200" href="#pricing">Pricing</a>
            <a className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200" href="#faq">FAQ</a>
            <a href="/login" className="font-semibold text-gray-600 hover:text-primary-600 transition-colors duration-200">Login</a>
            <a href="/signup" className="bg-[#00342b] text-white px-8 py-3 rounded-full font-semibold active:scale-95 transition-transform duration-150 hover:bg-[#002212]">
              Get Started
            </a>
          </div>
          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <a href="/login" className="font-semibold text-gray-600 text-sm">Login</a>
            <a href="/signup" className="bg-[#00342b] text-white px-5 py-2 rounded-full font-semibold text-sm">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-[#f8faf8] pt-20 pb-16 md:pt-32 md:pb-32 px-6 md:px-8">
          <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center reveal">
            <div className="inline-flex items-center gap-2 bg-[#F4EBFF] px-4 py-2 rounded-full mb-8 border border-purple-100">
              <span className="text-purple-600 text-sm">🚀</span>
              <span className="text-xs font-bold text-purple-900 uppercase tracking-widest">WhatsApp Commerce for Africa</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-display font-extrabold text-[#00342b] mb-6 max-w-[900px] leading-[1.1] tracking-tight">
              Sell Smarter on WhatsApp.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-[640px] leading-relaxed">
              Transform your WhatsApp chats into a professional automated storefront. Manage orders, track inventory, and get paid instantly without leaving the chat.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
              <a href="/signup" className="bg-[#00342b] text-white px-10 py-5 rounded-full font-bold text-lg active:scale-95 transition-transform duration-150 shadow-xl shadow-[#00342b]/20 flex items-center justify-center">
                Try Ondar Now
              </a>
              <a href="#how-it-works" className="border-2 border-[#00342b] text-[#00342b] px-10 py-5 rounded-full font-bold text-lg hover:bg-gray-50 active:scale-95 transition-all duration-150 flex items-center justify-center">
                Watch Demo
              </a>
            </div>

            {/* Massive Mockup */}
            <div className="relative mx-auto mt-12 md:mt-16 w-full max-w-[280px] md:max-w-[340px] bg-black rounded-[40px] md:rounded-[56px] shadow-[0_30px_60px_-15px_rgba(0,52,43,0.3)] border-[8px] md:border-[12px] border-gray-900 overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute top-0 inset-x-0 h-5 md:h-6 bg-gray-900 z-20 rounded-b-[16px] md:rounded-b-[20px] w-[45%] mx-auto"></div>
              <video 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-auto object-cover rounded-[32px] md:rounded-[44px]"
              >
                <source src="/herovid.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </section>

        {/* Outcome Section 1: Professional Look */}
        <section className="bg-[#F4EBFF] py-20 md:py-32 px-6 md:px-8 reveal" id="features">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              
              {/* Floating Chat Bubbles */}
              <div className="absolute z-20 -top-8 -left-2 md:-top-6 md:-left-2 max-w-[240px] md:max-w-[280px] reveal" style={{ transitionDelay: '200ms' }}>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-xl shadow-gray-300/50 border border-gray-100 text-left">
                  <p className="text-[12px] md:text-[13px] text-gray-800 font-medium leading-relaxed">
                    "Do you have other colors? Let me see all the handbags you sell so I can make my choice 🙏🏾"
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">10:42 AM</span>
                </div>
              </div>
              
              <div className="absolute z-20 -bottom-6 -right-2 md:-bottom-8 md:-right-8 max-w-[240px] md:max-w-[280px] reveal" style={{ transitionDelay: '600ms' }}>
                <div className="bg-[#E7FFDB] p-4 rounded-2xl rounded-tr-none shadow-xl shadow-emerald-900/10 border border-[#D1F2C4] text-left">
                  <p className="text-[12px] md:text-[13px] text-gray-900 font-medium leading-relaxed">
                    Yes! You can see everything we have in stock and order here 👇🏾<br/>
                    <a href="#" className="text-blue-600 underline decoration-blue-300 underline-offset-2 mt-1 inline-block">ondar.ng/luxewear</a>
                  </p>
                  <div className="flex justify-end gap-1 items-center mt-1">
                    <span className="text-[10px] text-gray-500">10:43 AM</span>
                    <svg className="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none"><path d="M11.6 15L7.5 10.9L8.9 9.5L11.6 12.2L19.6 4.2L21 5.6L11.6 15Z" fill="currentColor"/><path d="M4.6 15L0.5 10.9L1.9 9.5L4.6 12.2L12.6 4.2L14 5.6L4.6 15Z" fill="currentColor"/></svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-[40px] shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,52,43,0.08)] transition-shadow duration-300 relative z-10">
                <img className="w-full h-auto rounded-[32px]" src="/plook.png" alt="Ondar beautiful storefront catalog" />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[#00342b] mb-6 leading-tight">
                Your 24/7 Digital Salesperson
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Give your customers a beautiful storefront where they can browse your catalog, discover what you sell, and place orders even while you are away.
              </p>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <svg className="w-7 h-7 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span className="text-lg font-medium text-gray-900">High-speed catalog loading</span>
                </li>
                <li className="flex items-start gap-4">
                  <svg className="w-7 h-7 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span className="text-lg font-medium text-gray-900">Custom brand colors & logos</span>
                </li>
                <li className="flex items-start gap-4">
                  <svg className="w-7 h-7 text-primary-600 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  <span className="text-lg font-medium text-gray-900">Optimized for mobile shoppers</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Outcome Section 2: Zero Lost Orders */}
        <section className="bg-white py-20 md:py-32 px-6 md:px-8 reveal">
          <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[#00342b] mb-6 leading-tight">
                Zero Lost Orders
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Stop hunting through chat history to find order details. Ondar organizes every sale, address, and payment status in one central dashboard.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8faf8] p-6 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] border border-gray-200/60">
                  <span className="text-3xl font-bold text-[#00342b] block mb-1">100%</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Capture Rate</p>
                </div>
                <div className="bg-[#f8faf8] p-6 rounded-3xl shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] border border-gray-200/60">
                  <span className="text-3xl font-bold text-[#00342b] block mb-1">24/7</span>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Auto-Reply</p>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-[#00342b] p-10 md:p-12 rounded-[40px] text-white">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <h3 className="text-2xl font-bold">Inventory Sync</h3>
                </div>
                <p className="text-lg mb-8 opacity-90 leading-relaxed">
                  Real-time stock tracking prevents you from selling items you no longer have in stock.
                </p>
                <img className="w-full h-auto rounded-2xl shadow-xl" src="/ipic.png" alt="Ondar Inventory Management Dashboard" />
              </div>
            </div>
          </div>
        </section>

        {/* Outcome Section 3: Instant WhatsApp Handoff */}
        <section className="bg-[#F4EBFF] py-20 md:py-32 px-6 md:px-8 reveal" id="how-it-works">
          <div className="max-w-[1280px] mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[#00342b] mb-6 leading-tight">
              Instant WhatsApp Handoff
            </h2>
            <p className="text-lg text-gray-700 mb-16 max-w-[700px] mx-auto leading-relaxed">
              Customers browse your catalog on the web and checkout directly to your WhatsApp. No confusing multi-step processes — just seamless communication and conversion.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-10 rounded-[32px] shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,52,43,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#00342b] mb-3">Customer Shops</h4>
                <p className="text-gray-600">They visit your Ondar link and select items for their cart.</p>
              </div>
              
              <div className="bg-white p-10 rounded-[32px] shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,52,43,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#00342b] mb-3">Direct to Chat</h4>
                <p className="text-gray-600">The order is sent as a pre-filled WhatsApp message to your phone.</p>
              </div>

              <div className="bg-white p-10 rounded-[32px] shadow-[0_10px_30px_-5px_rgba(0,52,43,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(0,52,43,0.08)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-[#F4EBFF] rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#00342b] mb-3">Instant Payment</h4>
                <p className="text-gray-600">Confirm order and accept payment directly through secure links.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-[#f8faf8] py-20 md:py-32 px-6 md:px-8 reveal" id="pricing">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row gap-16 items-center justify-center">
            
            {/* Context / Countdown */}
            <div className="max-w-[500px] text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full mb-6 border border-red-200">
                <span className="text-red-600 text-sm animate-pulse">🔥</span>
                <span className="text-xs font-bold text-red-900 uppercase tracking-widest">Pre-Launch Offer</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-extrabold text-[#00342b] mb-6 leading-tight">
                Lock in 50% Off Before We Launch
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                We're officially launching in 2 weeks. Get early access today and secure our exclusive pre-launch pricing forever.
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 min-w-[75px] text-center">
                  <span className="block text-3xl font-black text-[#00342b]">{mounted ? timeLeft.days : 14}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Days</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 min-w-[75px] text-center">
                  <span className="block text-3xl font-black text-[#00342b]">{mounted ? timeLeft.hours : '00'}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hours</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 min-w-[75px] text-center">
                  <span className="block text-3xl font-black text-[#00342b]">{mounted ? timeLeft.minutes : '00'}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mins</span>
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 min-w-[75px] text-center">
                  <span className="block text-3xl font-black text-[#00342b]">{mounted ? timeLeft.seconds : '00'}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Secs</span>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="w-full max-w-[420px]">
              <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_20px_40px_-10px_rgba(0,52,43,0.1)] border-2 border-[#00A859] relative transform hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00A859] text-white px-6 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg shadow-[#00A859]/30">
                  14-Day Free Trial
                </div>
                
                <div className="text-center mt-4 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <span className="text-gray-400 line-through text-2xl font-medium">₦1,500</span>
                    <span className="text-6xl font-extrabold text-[#00342b]">₦750</span>
                  </div>
                  <p className="text-gray-500 font-medium">per month</p>
                </div>

                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E7FFDB] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#00A859]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Automated Web-Store</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E7FFDB] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#00A859]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Unlimited Orders</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E7FFDB] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#00A859]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Real-time Inventory Sync</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#E7FFDB] flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-[#00A859]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    </div>
                    <span className="text-gray-700 font-medium text-lg">Secure Payment Links</span>
                  </li>
                </ul>

                <a href="/signup" className="block w-full bg-[#00342b] text-white text-center px-8 py-5 rounded-full font-bold text-xl hover:bg-[#002212] active:scale-95 transition-all duration-200 shadow-xl shadow-[#00342b]/20">
                  Claim 50% Off Now
                </a>
                <p className="text-center text-sm text-gray-500 mt-4 font-medium">No credit card required for trial.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-[#00342b] py-20 md:py-32 px-6 md:px-8 relative overflow-hidden reveal">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>
          <div className="max-w-[1280px] mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-8 leading-tight">
              Ready to scale your business?
            </h2>
            <p className="text-emerald-100 text-xl mb-12 max-w-[600px] mx-auto">
              Join over 5,000 Nigerian vendors using Ondar to automate their WhatsApp sales.
            </p>
            <a href="/signup" className="inline-flex bg-white text-[#00342b] px-16 py-5 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl items-center justify-center">
              Get Started for Free
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0A0D14] w-full text-white">
        <div className="w-full py-20 px-6 md:px-8 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="md:w-1/3">
            <span className="text-3xl font-display font-black text-white mb-6 block tracking-tight">Ondar</span>
            <p className="text-gray-400 font-body-md mb-8 max-w-xs leading-relaxed">
              Professional WhatsApp Commerce for high-growth African businesses.
            </p>
            
            {/* Social Links exactly as requested */}
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/ondar.ng" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0A0D14] transition-all">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://x.com/ondarng" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0A0D14] transition-all">
                <span className="sr-only">X (Twitter)</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a href="https://youtube.com/@ondarng" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-[#0A0D14] transition-all">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#features">Features</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#pricing">Pricing</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#how-it-works">How it Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#">About Us</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Contact</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a className="text-gray-400 hover:text-white transition-colors" href="/privacy-policy">Privacy Policy</a></li>
                <li><a className="text-gray-400 hover:text-white transition-colors" href="/terms-of-service">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-8 px-6 text-center">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">© 2026 Ondar. Professional WhatsApp Commerce. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
