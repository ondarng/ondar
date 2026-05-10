import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageSquare, Package, Share2, ShieldCheck, Zap, XCircle, Store, Smartphone, Palette, FileText, ShoppingBag } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#00A859]/10">
      
      {/* 1. HERO SECTION */}
      <header className="px-6 py-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <img src="/ondar logo.png" alt="Ondar" className="h-7 md:h-9" />
        <Link href="/login" className="text-sm font-bold hover:text-[#00A859] transition-colors px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          Login
        </Link>
      </header>

      <section className="px-6 pt-8 md:pt-16 pb-20 md:pb-32 max-w-6xl mx-auto w-full text-center md:text-left md:flex md:items-center md:gap-20">
        <div className="md:flex-1 space-y-8 mb-16 md:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight leading-[1.05] text-slate-900">
            Sell your products <br className="hidden md:block" />
            <span className="text-[#00A859]">without losing orders</span> in chats
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Turn your WhatsApp and Instagram selling into a simple store. Share one link, get clear orders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-5 px-10 rounded-2xl shadow-xl shadow-[#00A859]/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-xl"
            >
              🟢 Create Your Store Free
              <ArrowRight className="w-6 h-6 opacity-70" />
            </Link>
          </div>
          <p className="text-[10px] md:text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
            No coding • No stress • Just sell
          </p>
        </div>
        
        <div className="md:flex-1 relative w-full max-w-md mx-auto md:max-w-none">
          <div className="absolute inset-0 bg-[#00A859]/5 rounded-[3rem] -rotate-3 scale-105 blur-3xl" />
          <div className="relative bg-[#F8FAFC] p-3 md:p-4 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[350px] md:h-[520px] flex flex-col">
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
      <section className="bg-slate-50 py-12 md:py-16 px-6 border-y border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg md:text-2xl font-bold text-slate-900 leading-snug">
            Your simple online store for social media selling.
          </p>
        </div>
      </section>

      {/* 3. PAIN SECTION */}
      <section className="py-16 md:py-24 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-16 border border-slate-100 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 leading-tight">
              You’re losing money in chat chaos
            </h2>
            <div className="space-y-5">
              {[
                "Customers ask the same questions every day",
                "Orders get buried in WhatsApp messages",
                "You forget who paid and who didn’t",
                "Your products don’t look organized",
                "It feels stressful to sell"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-slate-600 font-bold">
                  <XCircle className="w-6 h-6 shrink-0 text-red-500/50" />
                  <span className="text-sm md:text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden md:flex justify-end">
             <div className="bg-white p-8 rounded-[2rem] space-y-5 border border-slate-100 shadow-xl max-w-xs w-full rotate-3">
                <div className="flex gap-2">
                   <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                   <div className="space-y-2 flex-1">
                      <div className="h-2 w-1/2 bg-slate-100 rounded-full"></div>
                      <div className="h-2 w-3/4 bg-slate-50 rounded-full"></div>
                   </div>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[10px] font-bold text-red-800">
                   "Is this still available?" (Sent 3 hours ago)
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-[10px] font-bold text-red-800">
                   "Sent payment! Check DM" (Buried)
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 4. SOLUTION SECTION */}
      <section className="py-16 md:py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="space-y-16">
          <h2 className="text-3xl md:text-6xl font-display font-black text-center text-slate-900">
            Ondar fixes this instantly
          </h2>
          <div className="bg-[#00A859] text-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 shadow-2xl shadow-[#00A859]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32"></div>
            <h3 className="text-lg md:text-xl font-black mb-12 opacity-80 uppercase tracking-[0.2em] text-center md:text-left">Create a clean store where:</h3>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              {[
                { title: "your products are visible", icon: <Package /> },
                { title: "customers order properly", icon: <ShoppingBag /> },
                { title: "everything is organized in one place", icon: <CheckCircle2 /> }
              ].map((item, i) => (
                <div key={i} className="space-y-5 bg-white/10 p-8 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">{item.icon}</div>
                  <p className="text-xl md:text-2xl font-black leading-tight tracking-tight">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="py-20 md:py-32 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-10 md:p-24 text-white text-center relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#00A859] blur-[150px] opacity-20 -mr-64 -mb-64"></div>
          <div className="relative z-10 space-y-10">
            <div className="inline-block px-5 py-2 bg-[#FFBF00] text-[#1A1A1A] text-[10px] md:text-xs font-black rounded-full uppercase tracking-[0.2em]">The Pricing</div>
            <h2 className="text-4xl md:text-7xl font-display font-black tracking-tight">One simple price</h2>
            <div className="py-4">
              <p className="text-7xl md:text-9xl font-display font-black text-[#00A859] tracking-tighter">₦1,500</p>
              <p className="text-slate-400 font-black mt-6 uppercase tracking-[0.3em] text-xs md:text-sm">per month after your 7-day trial</p>
            </div>
            <div className="max-w-md mx-auto space-y-4 pt-10">
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
      <section className="py-20 md:py-32 px-6 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-5xl font-display font-black mb-20 text-slate-900">Start selling in minutes</h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-16 relative">
          {[
            { step: "1", title: "Create your store", icon: <Store className="w-7 h-7 md:w-9 md:h-9" /> },
            { step: "2", title: "Add your products", icon: <Package className="w-7 h-7 md:w-9 md:h-9" /> },
            { step: "3", title: "Share your link on WhatsApp or Instagram", icon: <Share2 className="w-7 h-7 md:w-9 md:h-9" /> }
          ].map((item, i) => (
            <div key={i} className="space-y-6 md:space-y-8 bg-slate-50 p-10 md:p-12 rounded-[2.5rem] border border-slate-100 transition-transform hover:scale-105 duration-500">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white text-[#00A859] rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-slate-200 border border-slate-50">
                {item.icon}
              </div>
              <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-snug">{item.title}</p>
            </div>
          ))}
        </div>
        <p className="mt-16 md:mt-24 text-3xl md:text-5xl font-display font-black text-[#00A859] italic">Done.</p>
      </section>

      {/* 6. FEATURES */}
      <section className="py-20 md:py-32 px-6 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-3xl md:text-5xl font-display font-black text-center mb-16 md:mb-24">
            Everything you need <br className="md:hidden" /> to sell better
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              "Simple store link (ondar.ng/yourname)",
              "Product listings with images",
              "Order tracking",
              "WhatsApp-friendly checkout",
              "Manual payment confirmation",
              "Clean receipts you can share instantly",
              "Add your logo and brand color"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm text-left">
                <CheckCircle2 className="w-5 h-5 text-[#00A859] shrink-0" />
                <span className="font-bold text-sm md:text-base text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. RECEIPT SECTION */}
      <section className="py-24 md:py-40 px-6 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div className="space-y-8 text-center md:text-left">
            <h2 className="text-3xl md:text-6xl font-display font-black text-slate-900 tracking-tight">
              Send receipts your customers trust
            </h2>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
              After every order, generate a clean receipt you can send on WhatsApp.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
              {["product details", "price", "order ID", "payment status"].map((tag, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
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
      <section className="py-24 px-6 bg-slate-50 border-y border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 flex justify-center">
             <div className="relative">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-slate-200 flex items-center justify-center p-8">
                   <div className="w-full h-full bg-[#FFBF00] rounded-full flex items-center justify-center text-[#1A1A1A] shadow-2xl animate-pulse">
                      <Palette className="w-16 h-16" />
                   </div>
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                   <CheckCircle2 className="w-6 h-6 text-[#00A859]" />
                </div>
             </div>
          </div>
          <div className="space-y-6 order-1 md:order-2 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-display font-black leading-tight text-slate-900">
              Make your store look professional
            </h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-medium">
              Add your logo and choose a color so your store feels like your own business, not a random page.
            </p>
          </div>
        </div>
      </section>

      {/* 9. WHO IT’S FOR */}
      <section className="py-24 px-6 max-w-6xl mx-auto w-full text-center">
        <h2 className="text-3xl md:text-5xl font-display font-black mb-16 text-slate-900 leading-tight">
          Built for people selling <br className="md:hidden" /> on social media
        </h2>
        <div className="flex flex-wrap justify-center gap-3 md:gap-6">
          {[
            "WhatsApp vendors",
            "Instagram sellers",
            "Fashion businesses",
            "Beauty sellers",
            "Student entrepreneurs"
          ].map((item, i) => (
            <div key={i} className="px-6 md:px-8 py-3 md:py-4 bg-white border border-slate-100 rounded-2xl font-bold shadow-sm hover:border-[#00A859] hover:text-[#00A859] transition-all duration-300 text-sm md:text-base">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FINAL CTA SECTION */}
      <section className="py-32 md:py-48 px-6 text-center bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-4xl md:text-7xl font-display font-black text-slate-900 tracking-tight leading-[1.05]">
            Start selling <br className="hidden md:block" /> properly today
          </h2>
          <p className="text-lg md:text-2xl text-slate-500 leading-relaxed font-medium max-w-2xl mx-auto">
            Stop losing orders in chats. Start using a simple store that organizes your business.
          </p>
          <div className="flex flex-col items-center gap-8 pt-8">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-6 px-12 rounded-2xl shadow-2xl shadow-[#00A859]/30 active:scale-95 transition-all text-xl md:text-2xl flex items-center gap-4"
            >
              🟢 Create Your Store Free
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[10px]">Join smart Nigerian vendors</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-100 px-6 py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center md:text-left">
            <img src="/ondar logo.png" alt="Ondar" className="h-8 mx-auto md:mx-0" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Made with ❤️ for Nigerian Vendors
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-end gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            <a href="mailto:support@ondar.ng" className="hover:text-[#00A859] transition-colors">Support</a>
            <a href="#" className="hover:text-[#00A859] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#00A859] transition-colors">Instagram</a>
          </div>
        </div>
        <div className="mt-20 text-center text-[10px] uppercase tracking-[0.4em] text-slate-300 font-black">
          © 2026 Ondar Tech • Lagos, Nigeria
        </div>
      </footer>

    </div>
  )
}
