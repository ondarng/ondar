import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquare, Package, Share2, ShieldCheck, Zap, XCircle, Store, Smartphone, Palette, FileText, ShoppingBag } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#00A859]/10">
      
      {/* 1. HERO SECTION */}
      <header className="px-6 py-4 md:py-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <img src="/logo.png" alt="Ondar" className="h-7 md:h-9" />
        <Link href="/login" className="text-sm font-bold hover:text-[#00A859] transition-colors px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          Login
        </Link>
      </header>

      <section className="px-6 pt-6 md:pt-16 pb-14 md:pb-32 max-w-6xl mx-auto w-full text-center md:text-left md:flex md:items-center md:gap-20">
        <div className="md:flex-1 space-y-5 md:space-y-8 mb-12 md:mb-0">
          <h1 className="text-[2rem] sm:text-5xl md:text-7xl font-display font-black tracking-tight leading-[1.1] text-slate-900">
            Stop losing sales <br className="hidden md:block" />
            <span className="text-[#00A859]">in your DMs</span>
          </h1>
          <p className="text-base md:text-2xl text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Turn chaotic WhatsApp and Instagram chats into organized orders. One link. Zero stress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-4 md:py-5 px-8 md:px-10 rounded-2xl shadow-xl shadow-[#00A859]/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3 text-lg md:text-xl"
            >
              Create Your Store Free
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
            </Link>
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
            Free for 7 days • No card needed • 2 minutes to set up
          </p>
        </div>
        
        <div className="md:flex-1 relative w-full max-w-md mx-auto md:max-w-none">
          <div className="absolute inset-0 bg-[#00A859]/5 rounded-[3rem] -rotate-3 scale-105 blur-3xl" />
          <div className="relative bg-[#F8FAFC] p-3 md:p-4 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[300px] md:h-[520px] flex flex-col">
             {/* Mini Dashboard UI */}
             <div className="bg-white rounded-[1.8rem] md:rounded-[2.2rem] h-full shadow-inner border border-slate-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-[#00A859] rounded-md"></div>
                      <div className="h-1.5 w-12 md:w-16 bg-slate-100 rounded-full"></div>
                   </div>
                   <div className="w-5 h-5 bg-slate-50 rounded-full border border-slate-100"></div>
                </div>
                <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                   <div className="grid grid-cols-2 gap-3 md:gap-5">
                      <div className="p-4 rounded-2xl bg-[#00A859]/5 border border-[#00A859]/10 space-y-2">
                         <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Zap className="w-4 h-4 text-[#00A859]" />
                         </div>
                         <div className="h-1.5 w-10 bg-[#00A859]/20 rounded-full"></div>
                         <div className="h-3 w-16 bg-slate-900 rounded-full"></div>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 opacity-50">
                         <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <ShoppingBag className="w-4 h-4 text-slate-400" />
                         </div>
                         <div className="h-1.5 w-10 bg-slate-200 rounded-full"></div>
                         <div className="h-3 w-16 bg-slate-900 rounded-full"></div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="h-2 w-20 bg-slate-100 rounded-full"></div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                           <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-50 rounded-lg shrink-0"></div>
                           <div className="flex-1 space-y-2">
                              <div className="h-1.5 md:h-2 w-24 bg-slate-100 rounded-full"></div>
                              <div className="h-1.5 md:h-2 w-16 bg-slate-50 rounded-full"></div>
                           </div>
                           <div className="h-5 w-10 md:h-6 md:w-12 bg-[#00A859]/10 rounded-full"></div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute top-1/2 left-0 -translate-x-4 md:-translate-x-8 bg-white p-3 md:p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3 animate-bounce z-20">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#00A859] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#00A859]/30">
                   <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                   <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">New Order</p>
                   <p className="text-sm md:text-base font-black text-slate-900 leading-none mt-1">₦24,500</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 2. POSITIONING LINE */}
      <section className="bg-slate-50 py-8 md:py-16 px-6 border-y border-slate-100">
        <div className="max-w-3xl mx-auto text-center space-y-2">
          <p className="text-base md:text-2xl font-bold text-slate-900 leading-snug">
            Less chat chaos. More structured sales.
          </p>
          <p className="text-xs md:text-sm text-slate-400 font-medium">
            Ondar replaces the messy DMs you sell through with a clean store your customers can actually use.
          </p>
        </div>
      </section>

      {/* 3. BEFORE vs AFTER */}
      <section className="py-12 md:py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-4 md:gap-8">
          <div className="bg-red-50/50 rounded-[2rem] p-6 md:p-10 border border-red-100/50 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100/60 rounded-full">
              <XCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">Before Ondar</span>
            </div>
            <h3 className="text-xl md:text-3xl font-display font-black text-slate-900">Selling feels stressful</h3>
            <div className="space-y-3">
              {["Repeating prices in every DM", "Orders buried in WhatsApp chats", "Forgetting who paid and who didn\u2019t", "Sending product screenshots one by one", "No idea how much you\u2019ve actually made"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-600">
                  <XCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                  <span className="text-sm font-bold leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#00A859]/5 rounded-[2rem] p-6 md:p-10 border border-[#00A859]/10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00A859]/10 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />
              <span className="text-[10px] font-black text-[#00A859] uppercase tracking-widest">With Ondar</span>
            </div>
            <h3 className="text-xl md:text-3xl font-display font-black text-slate-900">Selling feels smooth</h3>
            <div className="space-y-3">
              {["Customers see your products and prices instantly", "Orders come in structured, not scattered", "Payment tracking built in", "Professional receipts you can share", "Your revenue is always clear"].map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00A859] mt-0.5" />
                  <span className="text-sm font-bold leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section className="py-12 md:py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="space-y-10 md:space-y-16">
          <h2 className="text-2xl md:text-6xl font-display font-black text-center text-slate-900">
            One link replaces the chaos
          </h2>
          <div className="bg-[#00A859] text-white rounded-[2rem] md:rounded-[4rem] p-6 md:p-20 shadow-2xl shadow-[#00A859]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <h3 className="text-sm md:text-xl font-black mb-8 md:mb-12 opacity-80 uppercase tracking-[0.15em] md:tracking-[0.2em] text-center md:text-left">Your Ondar store gives you:</h3>
            <div className="grid md:grid-cols-3 gap-4 md:gap-10">
              {[
                { title: "visible products with prices", icon: <Package /> },
                { title: "structured orders, not scattered DMs", icon: <ShoppingBag /> },
                { title: "everything organized in one place", icon: <CheckCircle2 /> }
              ].map((item, i) => (
                <div key={i} className="space-y-4 md:space-y-5 bg-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">{item.icon}</div>
                  <p className="text-lg md:text-2xl font-black leading-tight tracking-tight">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-14 md:py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-slate-900 rounded-[2rem] md:rounded-[4rem] p-8 md:p-24 text-white text-center relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00A859] blur-[150px] opacity-20 -mr-64 -mb-64"></div>
          <div className="relative z-10 space-y-8 md:space-y-10">
            <div className="inline-block px-5 py-2 bg-[#FFBF00] text-[#1A1A1A] text-[10px] md:text-xs font-black rounded-full uppercase tracking-[0.2em]">The Pricing</div>
            <h2 className="text-3xl md:text-7xl font-display font-black tracking-tight">One simple price</h2>
            <div className="py-2 md:py-4">
              <p className="text-6xl md:text-9xl font-display font-black text-[#00A859] tracking-tighter">₦1,500</p>
              <p className="text-slate-400 font-black mt-4 md:mt-6 uppercase tracking-[0.3em] text-[10px] md:text-sm">per month after your 7-day trial</p>
            </div>
            <div className="max-w-md mx-auto space-y-3 md:space-y-4 pt-6 md:pt-10">
              {["Full access to all features", "Unlimited products", "No hidden fees"].map((item, i) => (
                <div key={i} className="flex items-center gap-4 justify-center text-slate-400 font-bold italic">
                  <CheckCircle2 className="w-5 h-5 text-[#00A859]/50" />
                  <span className="text-sm md:text-lg">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="py-14 md:py-32 px-6 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-2xl md:text-5xl font-display font-black mb-10 md:mb-20 text-slate-900">Start selling in minutes</h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-16 relative">
          {[
            { step: "1", title: "Create your store", icon: <Store className="w-6 h-6 md:w-9 md:h-9" /> },
            { step: "2", title: "Add your products", icon: <Package className="w-6 h-6 md:w-9 md:h-9" /> },
            { step: "3", title: "Share your link", icon: <Share2 className="w-6 h-6 md:w-9 md:h-9" /> }
          ].map((item, i) => (
            <div key={i} className="space-y-3 md:space-y-8 bg-slate-50 p-4 md:p-12 rounded-2xl md:rounded-[2.5rem] border border-slate-100">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-white text-[#00A859] rounded-xl md:rounded-3xl flex items-center justify-center mx-auto shadow-lg md:shadow-xl shadow-slate-200 border border-slate-50">
                {item.icon}
              </div>
              <p className="text-xs md:text-xl font-black text-slate-900 tracking-tight leading-snug">{item.title}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 md:mt-24 text-2xl md:text-5xl font-display font-black text-[#00A859] italic">Done.</p>
      </section>

      {/* 6. FEATURES */}
      <section className="py-14 md:py-32 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-2xl md:text-5xl font-display font-black text-center mb-10 md:mb-24">
            Everything you need <br className="md:hidden" /> to sell better
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {[
              "Simple store link (ondar.ng/yourname)",
              "Product listings with images",
              "Order tracking",
              "WhatsApp-friendly checkout",
              "Manual payment confirmation",
              "Clean receipts you can share instantly",
              "Add your logo and brand color"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4 bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm text-left">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-[#00A859] shrink-0" />
                <span className="font-bold text-xs md:text-base text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RECEIPT SECTION */}
      <section className="py-16 md:py-40 px-6 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-10 md:gap-24 items-center">
          <div className="space-y-5 md:space-y-8 text-center md:text-left">
            <h2 className="text-2xl md:text-6xl font-display font-black text-slate-900 tracking-tight">
              Send receipts your customers trust
            </h2>
            <p className="text-base md:text-xl text-slate-500 leading-relaxed font-medium">
              After every order, generate a clean receipt you can send on WhatsApp. No more awkward screenshots.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2 md:pt-4">
              {["product details", "price", "order ID", "payment status"].map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute inset-0 bg-[#00A859]/10 blur-3xl rounded-full translate-x-12 translate-y-12"></div>
             <div className="relative bg-white p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border border-slate-100 rotate-2 max-w-xs mx-auto">
                <div className="space-y-6">
                   <div className="flex justify-between items-center border-b pb-6 text-left">
                     <div className="h-4 w-20 bg-[#00A859]/20 rounded-full"></div>
                     <span className="text-[10px] text-slate-300 font-black tracking-widest">#ORD-8291</span>
                   </div>
                   <div className="space-y-3">
                      <div className="h-3 w-3/4 bg-slate-100 rounded-full"></div>
                      <div className="h-3 w-1/2 bg-slate-50 rounded-full"></div>
                   </div>
                   <div className="pt-8 border-t flex justify-between items-center">
                     <span className="font-bold text-slate-400 text-sm">Total</span>
                     <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">₦12,500</span>
                   </div>
                   <div className="text-center pt-4 opacity-20">
                      <p className="text-[8px] font-black uppercase tracking-[0.3em]">Ondar Verified</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 8. BRANDING SECTION */}
      <section className="py-14 md:py-24 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="order-2 md:order-1 flex justify-center">
             <div className="relative">
                <div className="w-36 h-36 md:w-64 md:h-64 rounded-full border-4 border-slate-200 flex items-center justify-center p-6 md:p-8">
                   <div className="w-full h-full bg-[#FFBF00] rounded-full flex items-center justify-center text-[#1A1A1A] shadow-2xl animate-pulse">
                      <Palette className="w-12 h-12 md:w-16 md:h-16" />
                   </div>
                </div>
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                   <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#00A859]" />
                </div>
             </div>
          </div>
          <div className="space-y-4 md:space-y-6 order-1 md:order-2 text-center md:text-left">
            <h2 className="text-2xl md:text-5xl font-display font-black leading-tight text-slate-900">
              Your brand, your store
            </h2>
            <p className="text-slate-500 text-base md:text-xl leading-relaxed font-medium">
              Add your logo and pick a color. Your store looks like your business, not a random link.
            </p>
          </div>
        </div>
      </section>

      {/* 9. WHO IT'S FOR */}
      <section className="py-14 md:py-24 px-6 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-2xl md:text-5xl font-display font-black mb-8 md:mb-16 text-slate-900 leading-tight">
          Built for vendors <br className="md:hidden" /> who sell on social media
        </h2>
        <div className="flex flex-wrap justify-center gap-2 md:gap-6">
          {[
            "WhatsApp vendors",
            "Instagram sellers",
            "Fashion businesses",
            "Beauty sellers",
            "Student entrepreneurs"
          ].map((item, i) => (
            <div key={i} className="px-4 md:px-8 py-2.5 md:py-4 bg-white border border-slate-100 rounded-xl md:rounded-2xl font-bold shadow-sm hover:border-[#00A859] hover:text-[#00A859] transition-all duration-300 text-xs md:text-base">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section className="py-20 md:py-48 px-6 text-center bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
          <h2 className="text-[1.75rem] md:text-7xl font-display font-black text-slate-900 tracking-tight leading-[1.1]">
            Stop repeating prices <br className="hidden md:block" /> in your DMs
          </h2>
          <p className="text-base md:text-2xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Create a store. Share the link. Let your customers order properly.
          </p>
          <div className="flex flex-col items-center gap-6 md:gap-8 pt-4 md:pt-8">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-5 md:py-6 px-10 md:px-12 rounded-2xl shadow-2xl shadow-[#00A859]/30 active:scale-[0.97] transition-all text-lg md:text-2xl flex items-center gap-3 md:gap-4"
            >
              Create Your Store Free
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Join smart Nigerian vendors</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-100 px-6 py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 text-center md:text-left">
            <img src="/logo.png" alt="Ondar" className="h-7 md:h-8 mx-auto md:mx-0" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Made with ❤️ for Nigerian Vendors
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-end gap-6 text-slate-400">
            <a href="mailto:support@ondar.ng" className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#00A859] transition-colors">Support</a>
            <a 
              href="https://x.com/ondarng" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#00A859] transition-colors"
              aria-label="X (formerly Twitter)"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404z" />
              </svg>
            </a>
            <a 
              href="https://www.instagram.com/ondar.ng/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-[#00A859] transition-colors"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="mt-12 md:mt-20 text-center text-[10px] uppercase tracking-[0.4em] text-slate-300 font-black">
          Ondar built by Asiegbu Caleb
        </div>
      </footer>

    </div>
  )
}
