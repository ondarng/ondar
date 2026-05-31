'use client'

import Link from 'next/link'
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Package,
  Share2,
  ShoppingBag,
  LayoutDashboard,
  Clock,
  HelpCircle,
  ImageIcon,
  CheckCircle2,
  Users,
  ListChecks,
  Link2,
  BarChart3,
  Star,
  MessageCircle,
  ChevronDown,
} from 'lucide-react'

/* ── tiny reusable pieces ─────────────────────── */

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/60 px-4 py-1.5 text-xs font-extrabold tracking-wide text-emerald-700 uppercase select-none">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      {children}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-600 mb-3">{children}</p>
  )
}

/* ── phone mockup built in code ───────────────── */

function PhoneMockup({ variant }: { variant: 'storefront' | 'dashboard' }) {
  if (variant === 'storefront') {
    return (
      <div className="w-full h-full bg-black rounded-[1.8rem] overflow-hidden relative">
        <img src="/real-storefront.jpeg" alt="Storefront" className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black rounded-[1.8rem] overflow-hidden relative">
      <img src="/real-dashboard.jpeg" alt="Dashboard" className="w-full h-full object-cover" />
    </div>
  )
}

/* ═══════════════════════════════════════════════ */
/*                    PAGE                         */
/* ═══════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden antialiased">

      {/* ─── NAV ──────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          <img src="/logo.png" alt="Ondar" className="h-7" />
          <Link
            href="/signup"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-full transition-colors shadow-sm shadow-emerald-600/20"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      {/* ─── HERO ─────────────────────────────── */}
      <section className="relative px-5 pt-16 md:pt-28 pb-16 md:pb-20">
        {/* subtle bg pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* left: copy */}
          <div className="text-center lg:text-left space-y-6 max-w-xl mx-auto lg:mx-0">
            <Badge>🚀 Early Access — Free During Beta</Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.08]">
              Stop losing orders in{' '}
              <span className="text-emerald-600">WhatsApp&nbsp;chats.</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto lg:mx-0">
              Ondar helps online vendors organize products, customers, and orders while continuing conversations on WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center lg:justify-start">
              <Link
                href="/signup"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-lg"
              >
                Join Early Access
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-lg group"
              >
                <span className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-gray-800 text-gray-800 ml-0.5" />
                </span>
                Watch Demo
              </button>
            </div>
          </div>

          {/* right: phone mockups */}
          <div className="relative h-[480px] sm:h-[520px] flex items-center justify-center">
            {/* Dashboard — back */}
            <div className="absolute w-56 sm:w-64 h-[400px] sm:h-[440px] rounded-[2rem] overflow-hidden border-[6px] border-gray-900 shadow-2xl -rotate-6 -translate-x-10 translate-y-4 z-10 hover:rotate-0 hover:-translate-y-1 transition-all duration-700">
              <PhoneMockup variant="dashboard" />
            </div>
            {/* Storefront — front */}
            <div className="absolute w-56 sm:w-64 h-[400px] sm:h-[440px] rounded-[2rem] overflow-hidden border-[6px] border-gray-900 shadow-2xl translate-x-10 -translate-y-2 z-20 hover:rotate-2 hover:-translate-y-3 transition-all duration-700">
              <PhoneMockup variant="storefront" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── DEMO ─────────────────────────────── */}
      <section id="demo" className="py-20 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <SectionLabel>See It In Action</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">See how Ondar works.</h2>

          <div className="relative aspect-video bg-gray-900 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              controls
              className="w-full h-full object-cover"
            >
              <source src="/demovid.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <p className="text-gray-500 text-lg">
            Customers continue on WhatsApp. <strong className="text-gray-900">Ondar keeps everything organized.</strong>
          </p>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Start selling in 2&nbsp;minutes</h2>
          </div>

          <div className="space-y-0">
            {[
              { icon: Package, title: 'Add your products', desc: 'Upload photos, prices, and descriptions in seconds. No tech skills needed.' },
              { icon: Share2, title: 'Share your link', desc: 'Put your unique storefront link in your Instagram bio and WhatsApp status.' },
              { icon: ShoppingBag, title: 'Customers place orders', desc: 'They browse your items and checkout. You get the order directly on WhatsApp.' },
              { icon: LayoutDashboard, title: 'Manage everything', desc: 'Track payments, delivery status, and customer details all in one dashboard.' },
            ].map((item, i, arr) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30 z-10">
                    <item.icon className="w-5 h-5" />
                  </div>
                  {i < arr.length - 1 && <div className="w-0.5 flex-1 bg-emerald-200 my-0.5" />}
                </div>
                <div className={`pt-2 ${i < arr.length - 1 ? 'pb-10' : 'pb-0'}`}>
                  <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THE PROBLEM ──────────────────────── */}
      <section className="py-20 md:py-28 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Tired of the WhatsApp chaos?</h2>
            <p className="text-gray-500 mt-3 text-lg">We talked to dozens of vendors. We know the struggle is real.</p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Clock, title: 'Lost Orders', desc: 'Messages get buried. You miss a sale 3 days later because the customer bought elsewhere.' },
              { icon: HelpCircle, title: 'Forgotten Customers', desc: '"What was that customer\'s address again?" Scrolling for hours just to find delivery details.' },
              { icon: ImageIcon, title: 'Screenshots Everywhere', desc: 'Your gallery is full of payment receipts and order screenshots. Impossible to find anything.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-red-50/70 border border-red-100">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{item.title}</h4>
                  <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 space-y-1">
            <p className="text-xl text-gray-400 font-bold">You don&apos;t need more conversations.</p>
            <p className="text-2xl font-display font-extrabold text-emerald-600">You need more structure.</p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Features</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Built for how you sell</h2>
            <p className="text-gray-500 mt-3 text-lg">Simple tools that work. No complex tech jargon.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Users, title: 'Customers never disappear', desc: 'Automatically save every customer contact and delivery detail the first time they order.' },
              { icon: ListChecks, title: 'Orders stay organized', desc: 'From pending to delivered. Track the status of every sale without checking your DM history.' },
              { icon: Link2, title: 'Share one storefront link', desc: 'Stop sending individual photos. Send one link where they can see everything you sell.' },
              { icon: BarChart3, title: 'Know your best customers', desc: 'See exactly what a customer bought before so you can offer them better deals.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 hover:bg-emerald-50/50 border border-gray-100 hover:border-emerald-200/50 rounded-2xl p-6 transition-colors group">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 group-hover:bg-emerald-200/70 flex items-center justify-center text-emerald-600 mb-4 transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────── */}
      <section className="py-20 md:py-28 px-5 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Real Stories</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Trusted by Instagram & WhatsApp sellers</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { quote: 'Before Ondar, I searched through chats for every order. Now I know exactly what each customer bought. It saved me so much stress during my last restock.', name: 'Eze B.', role: 'Thrift Wear Vendor' },
              { quote: "I used to lose track of repeat customers. Ondar keeps everything organized and professional. My students buy from me easier now — they just click the link in my IG bio.", name: 'John C.', role: 'Student Gadget Entrepreneur' },
            ].map((t, i) => (
              <div key={i} className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-gray-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-extrabold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BETA INFO ────────────────────────── */}
      <section className="py-20 md:py-28 px-5">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <SectionLabel>Beta Program</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">Free during beta.</h2>
          <p className="text-gray-500 text-lg max-w-lg mx-auto">We&apos;re offering Ondar free during our early testing period so we can build the right product with real vendor feedback.</p>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-left max-w-md mx-auto">
            <p className="text-xs font-extrabold text-emerald-600 uppercase tracking-[0.15em] text-center mb-6">Our goal is simple</p>
            {[
              'Onboard real vendors',
              'Observe how they use the product',
              'Improve based on feedback',
              'Build something people actually need',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-gray-800 font-semibold">{item}</span>
              </div>
            ))}
            <p className="text-center text-gray-400 text-xs font-bold border-t border-emerald-200/50 pt-5 mt-5">No long-term commitment required.</p>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────── */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2rem] p-10 md:p-14 text-center relative overflow-hidden shadow-2xl shadow-emerald-900/30">
            {/* ambient blobs */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
                Ready to stop managing your business through screenshots?
              </h2>
              <p className="text-emerald-100 text-lg max-w-md mx-auto">
                Professionalize your business today. Get your storefront link in 2 minutes.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-extrabold text-lg py-4 px-10 rounded-2xl shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all w-full sm:w-auto"
              >
                Get Your Free Storefront Link
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────── */}
      <footer className="bg-gray-950 px-5 py-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <img src="/logo.png" alt="Ondar" className="h-6 brightness-0 invert opacity-40" />
          <div className="flex gap-6 text-gray-500 text-sm font-bold">
            <a href="mailto:support@ondar.ng" className="hover:text-white transition-colors">Support</a>
            <a href="https://x.com/ondarng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href="https://www.instagram.com/ondar.ng/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
        <p className="text-center text-[11px] text-gray-700 font-extrabold uppercase tracking-[0.15em] mt-8">
          © {new Date().getFullYear()} Ondar · Built in Nigeria 🇳🇬
        </p>
      </footer>
    </div>
  )
}
