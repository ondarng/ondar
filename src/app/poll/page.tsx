'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  Building2,
  Check,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react'

export default function VendorPollPage() {
  const [topFeature, setTopFeature] = useState('')
  const [salesFrequency, setSalesFrequency] = useState('')
  const [willingnessToPay, setWillingnessToPay] = useState('')
  const [vendorName, setVendorName] = useState('')
  const [vendorContact, setVendorContact] = useState('')
  const [feedback, setFeedback] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const featureOptions = [
    {
      id: 'payments',
      title: '💳 Direct Online Payments (Paystack / Cards)',
      desc: 'Allow buyers to pay via Card, Transfer, or USSD directly on your storefront.',
    },
    {
      id: 'logistics',
      title: '🚚 Auto Dispatch Rider Booking',
      desc: 'Instant 1-tap dispatch rider request (GIG, Feat, Speedaf) directly from your dashboard.',
    },
    {
      id: 'bot',
      title: '🤖 Automated WhatsApp Order Bot',
      desc: 'Smart bot that answers customer stock questions & captures orders automatically 24/7.',
    },
    {
      id: 'domain',
      title: '🌐 Custom Domain Setup (yourbrand.com)',
      desc: 'Connect your own custom domain directly to your Ondar store.',
    },
    {
      id: 'variants',
      title: '🎨 Multi-Variant Matrix & Stock Tracking',
      desc: 'Set individual stock levels, sizes, and colors per variant with auto-alerts.',
    },
  ]

  const frequencyOptions = [
    'Daily (5+ orders every day)',
    'Weekly (10–30 orders per week)',
    'Occasionally (1–5 orders a month)',
    'Just getting started',
  ]

  const planOptions = [
    'Yes! ₦3,000 – ₦5,000 / month',
    'Yes! ₦5,000 – ₦10,000 / month',
    'Prefer a small fee per completed order',
    'Only free tier for now',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topFeature && !feedback) {
      alert('Please select your top feature or type your feedback.')
      return
    }

    setSubmitting(true)

    try {
      await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_name: vendorName,
          vendor_contact: vendorContact,
          top_feature: topFeature,
          sales_frequency: salesFrequency,
          willingness_to_pay: willingnessToPay,
          feedback,
        }),
      })

      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#00A859] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-black px-4 md:px-8 py-3.5 sticky top-0 z-30 shadow-2xs flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm">
            O
          </div>
          <span className="font-black text-base tracking-tight text-slate-900">Ondar</span>
        </Link>

        <Link
          href="/dashboard"
          className="px-3.5 py-1.5 bg-black text-white text-xs font-black rounded-xl border border-black hover:bg-neutral-900 transition-colors"
        >
          Merchant Dashboard
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Banner Card */}
        <div className="bg-white border border-black rounded-3xl p-6 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-black text-[#00A859] uppercase tracking-wider bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ondar Merchant Roadmap Poll</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            What Should We Build Next for Your Store?
          </h1>

          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
            We are building Ondar directly around what Nigerian merchants need to make more sales. Vote below on the feature that matters most to you!
          </p>
        </div>

        {/* Thank You Success Screen */}
        {submitted ? (
          <div className="bg-white border border-black rounded-3xl p-8 text-center space-y-5 shadow-2xs animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-[#00A859] rounded-2xl border border-emerald-300 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Thank You for Voting!</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Your vote and feedback have been recorded. Our engineering team uses this poll directly to prioritize our next weekly updates!
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A859] text-white font-extrabold text-xs rounded-xl border border-black shadow-2xs hover:opacity-90 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Poll Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question 1: Feature Vote */}
            <div className="bg-white border border-black rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#00A859] uppercase tracking-wider">Question 1</span>
                <h3 className="text-base font-black text-slate-900">
                  Which feature would help your business sell most right now?
                </h3>
              </div>

              <div className="space-y-2.5">
                {featureOptions.map((opt) => (
                  <label
                    key={opt.id}
                    onClick={() => setTopFeature(opt.title)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      topFeature === opt.title
                        ? 'bg-emerald-50/70 border-[#00A859] ring-1 ring-[#00A859]'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="topFeature"
                      checked={topFeature === opt.title}
                      onChange={() => setTopFeature(opt.title)}
                      className="mt-0.5 accent-[#00A859]"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-900">{opt.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 2: Sales Frequency */}
            <div className="bg-white border border-black rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#00A859] uppercase tracking-wider">Question 2</span>
                <h3 className="text-base font-black text-slate-900">
                  How often do you currently make sales online?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {frequencyOptions.map((freq, idx) => (
                  <label
                    key={idx}
                    onClick={() => setSalesFrequency(freq)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      salesFrequency === freq
                        ? 'bg-emerald-50/70 border-[#00A859] text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="salesFrequency"
                      checked={salesFrequency === freq}
                      onChange={() => setSalesFrequency(freq)}
                      className="accent-[#00A859]"
                    />
                    <span>{freq}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 3: Pro Plan Preference */}
            <div className="bg-white border border-black rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#00A859] uppercase tracking-wider">Question 3</span>
                <h3 className="text-base font-black text-slate-900">
                  Would you subscribe to a Merchant Pro Plan with automated delivery & payments?
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {planOptions.map((plan, idx) => (
                  <label
                    key={idx}
                    onClick={() => setWillingnessToPay(plan)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      willingnessToPay === plan
                        ? 'bg-emerald-50/70 border-[#00A859] text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="willingnessToPay"
                      checked={willingnessToPay === plan}
                      onChange={() => setWillingnessToPay(plan)}
                      className="accent-[#00A859]"
                    />
                    <span>{plan}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Merchant Details (Optional) & Open Feedback */}
            <div className="bg-white border border-black rounded-3xl p-6 shadow-2xs space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#00A859] uppercase tracking-wider">Question 4</span>
                <h3 className="text-base font-black text-slate-900">
                  Store Details & Custom Suggestions
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Store / Brand Name (Optional)"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
                <input
                  type="text"
                  placeholder="WhatsApp Phone or Email (Optional)"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
              </div>

              <textarea
                rows={3}
                placeholder="Anything else you'd love Ondar to do for your store?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-slate-900/10 font-medium resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00A859] text-white border border-black font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit My Vote & Feedback →</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-500 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-2xl mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} Ondar. Official Vendor Poll & Roadmap.</p>
          <p className="text-[10px] text-slate-600">Empowering Nigerian Social Commerce Merchants</p>
        </div>
      </footer>
    </div>
  )
}
