import Link from 'next/link'
import { ArrowRight, CheckCircle2, MessageCircle, Package, ArrowDown, Smartphone, Receipt, Users, Clock, AlertCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#00A859]/10">
      
      {/* HEADER */}
      <header className="px-6 py-4 md:py-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <img src="/logo.png" alt="Ondar" className="h-7 md:h-9" />
        <Link href="/login" className="text-sm font-bold hover:text-[#00A859] transition-colors px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
          Login
        </Link>
      </header>

      {/* 1. HERO SECTION (EMOTIONAL CLARITY FAST) */}
      <section className="px-6 pt-8 md:pt-20 pb-16 md:pb-32 max-w-6xl mx-auto w-full text-center md:text-left md:flex md:items-center md:gap-16">
        <div className="md:flex-1 space-y-6 md:space-y-8 mb-16 md:mb-0 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00A859]/10 rounded-full border border-[#00A859]/20 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00A859] animate-pulse" />
            <span className="text-[10px] font-black text-[#00A859] uppercase tracking-widest">Early Access Phase</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tight leading-[1.1] text-slate-900">
            Stop losing orders <br className="hidden md:block" />
            <span className="text-[#00A859]">in chats.</span>
          </h1>
          <p className="text-base md:text-xl text-slate-500 max-w-lg mx-auto md:mx-0 leading-relaxed font-medium">
            Ondar helps WhatsApp and Instagram vendors organize products, orders, and customers without changing how they sell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-4 md:py-5 px-8 md:px-10 rounded-2xl shadow-xl shadow-[#00A859]/20 active:scale-[0.97] transition-all flex items-center justify-center gap-3 text-lg md:text-xl w-full sm:w-auto"
            >
              Join Early Access
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 opacity-70" />
            </Link>
          </div>
        </div>
        
        <div className="md:flex-1 relative w-full max-w-md mx-auto md:max-w-none h-[400px] md:h-[500px]">
          {/* Floating Chat Chaos Bubbles */}
          <div className="absolute top-0 right-4 md:right-10 bg-white p-3 rounded-2xl rounded-tr-none shadow-lg border border-slate-100 animate-float-slow z-10">
            <p className="text-sm font-bold text-slate-700">How much is this? 🤔</p>
          </div>
          <div className="absolute top-20 left-0 bg-white p-3 rounded-2xl rounded-tl-none shadow-lg border border-slate-100 animate-float z-10 animation-delay-1000">
            <p className="text-sm font-bold text-slate-700">Still available??</p>
          </div>
          <div className="absolute top-40 right-0 bg-white p-3 rounded-2xl rounded-tr-none shadow-lg border border-slate-100 animate-float-slow z-10 animation-delay-2000">
            <p className="text-sm font-bold text-slate-700">Send account number pls</p>
          </div>
          <div className="absolute bottom-32 left-4 md:left-10 bg-white p-3 rounded-2xl rounded-tl-none shadow-lg border border-slate-100 animate-float z-10 animation-delay-3000">
            <p className="text-sm font-bold text-red-500">I didn't get a receipt 😡</p>
          </div>

          {/* Clean Organized Centerpiece */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-[#F8FAFC] p-4 rounded-[2rem] shadow-2xl border border-slate-100 w-64 md:w-80">
               <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-[10px] font-black text-[#00A859] uppercase tracking-widest bg-[#00A859]/10 px-2 py-1 rounded">New Order</span>
                    <span className="text-xs font-bold text-slate-400">#8291</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Black Summer Dress</p>
                    <p className="text-xs text-slate-500">Size: M • Qty: 1</p>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-lg font-black text-slate-900">₦24,500</span>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-[#00A859]" />
                    </div>
                  </div>
               </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[#00A859]/5 rounded-[3rem] -rotate-6 scale-105 blur-3xl -z-10" />
        </div>
      </section>

      {/* 2. EARLY ACCESS SECTION (HUMAN TONE) */}
      <section className="bg-slate-50 py-10 md:py-16 px-6 border-y border-slate-100">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 leading-snug">
            We’re building Ondar with real online vendors.
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-sm font-medium text-slate-500">
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A859]" /> Currently free for 28 days
            </span>
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A859]" /> Improving weekly
            </span>
            <span className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00A859]" /> Vendor feedback shapes updates
            </span>
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM (CHAT CHAOS) */}
      <section className="py-16 md:py-24 px-6 max-w-4xl mx-auto w-full text-center space-y-10">
        <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 tracking-tight">
          Selling online shouldn’t feel chaotic.
        </h2>
        <div className="grid sm:grid-cols-3 gap-4 md:gap-6 text-left">
          {[
            { title: "Repeated Questions", desc: "Answering 'How much?' and 'Location?' 50 times a day.", icon: <MessageCircle className="w-5 h-5 text-red-400" /> },
            { title: "Forgotten Orders", desc: "Losing track of who paid and who was just making inquiries.", icon: <AlertCircle className="w-5 h-5 text-red-400" /> },
            { title: "Operational Stress", desc: "Scrolling through endless chats just to find a delivery address.", icon: <Clock className="w-5 h-5 text-red-400" /> }
          ].map((item, i) => (
            <div key={i} className="bg-red-50/50 border border-red-100 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-red-100">{item.icon}</div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. HOW ONDAR HELPS (SIMPLE WORDING) */}
      <section className="py-16 md:py-32 px-6 bg-[#00A859] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-3xl md:text-6xl font-display font-black text-center mb-12 md:mb-20">
            Organize your online selling <br className="hidden md:block"/> without chat stress.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { text: "Put products in one place", icon: <Package /> },
              { text: "Receive proper orders", icon: <CheckCircle2 /> },
              { text: "Continue on WhatsApp", icon: <MessageCircle /> },
              { text: "Send clean order slips", icon: <Receipt /> }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 p-6 md:p-8 rounded-[1.5rem] border border-white/10 backdrop-blur-sm flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg">{item.icon}</div>
                <p className="text-lg font-black leading-tight">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. THE FLOW SECTION (CORE DIFFERENTIATOR) */}
      <section className="py-16 md:py-32 px-6 max-w-5xl mx-auto w-full text-center">
        <div className="space-y-4 mb-12 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900">
            Organized social selling
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium">How the flow actually works.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 -translate-y-1/2" />
          
          {[
            { step: "1", title: "Customer sees product", icon: <Package className="w-6 h-6" /> },
            { step: "2", title: "Reserves order", icon: <CheckCircle2 className="w-6 h-6" /> },
            { step: "3", title: "Continues on WhatsApp", icon: <MessageCircle className="w-6 h-6" /> },
            { step: "4", title: "You receive organized order", icon: <Smartphone className="w-6 h-6" /> }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center relative w-full md:w-auto">
              {/* Mobile connecting line indicator */}
              {i !== 0 && <ArrowDown className="w-6 h-6 text-slate-200 md:hidden my-2" />}
              
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white border-2 border-slate-100 rounded-2xl shadow-lg flex items-center justify-center text-[#00A859] relative z-10 mb-4">
                {item.icon}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                  {item.step}
                </div>
              </div>
              <p className="text-sm md:text-base font-bold text-slate-900 max-w-[120px] leading-snug">{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 & 7. BUILT FOR SOCIAL SELLING + FEEDBACK SECTION */}
      <section className="py-16 md:py-24 px-6 bg-slate-50 border-y border-slate-100">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto md:mx-0">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900">Built for social selling</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              Not a complicated marketplace. Not a heavy ecommerce tool. Built strictly for Nigerian WhatsApp and Instagram vendors who just want to organize their chaos.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-[#FFBF00]/10 text-[#FFBF00] rounded-xl flex items-center justify-center mx-auto md:mx-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-display font-black text-slate-900">We actually listen</h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              We push fast updates based directly on what you tell us. The platform is actively built and refined using real vendor feedback inside the app.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA SECTION */}
      <section className="py-20 md:py-32 px-6 text-center bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-[1.1]">
            Ready to organize your orders?
          </h2>
          <div className="flex flex-col items-center gap-4 pt-4">
            <Link 
              href="/signup"
              className="bg-[#00A859] text-white font-bold py-5 px-10 rounded-2xl shadow-2xl shadow-[#00A859]/30 active:scale-[0.97] transition-all text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              Join Ondar Early Access
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-slate-400 font-bold text-sm">
              Free while we improve Ondar with real vendor feedback.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-100 px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-center md:text-left">
            <img src="/logo.png" alt="Ondar" className="h-6 mx-auto md:mx-0 opacity-50" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
              Organized Social Selling
            </p>
          </div>
          <div className="flex justify-center md:justify-end gap-6 text-slate-400">
            <a href="mailto:support@ondar.ng" className="text-xs font-bold hover:text-[#00A859] transition-colors">Support</a>
            <a href="https://x.com/ondarng" target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:text-[#00A859] transition-colors">Twitter</a>
            <a href="https://www.instagram.com/ondar.ng/" target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:text-[#00A859] transition-colors">Instagram</a>
          </div>
        </div>
        <div className="mt-12 text-center text-[10px] uppercase tracking-[0.2em] text-slate-300 font-black">
          © {new Date().getFullYear()} Ondar
        </div>
      </footer>
    </div>
  )
}
