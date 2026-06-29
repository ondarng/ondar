import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | Ondar',
  description: 'Get in touch with Ondar.',
};

export default function Contact() {
  return (
    <div className="bg-[#f8faf8] min-h-screen text-gray-900 selection:bg-primary-100 selection:text-primary-900">
      {/* Simple Header */}
      <nav className="w-full z-50 bg-white shadow-sm border-b border-gray-100 py-6 px-6 md:px-8">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between">
          <Link href="/">
            <img src="/logo.png" alt="Ondar" className="h-7" />
          </Link>
          <Link href="/" className="text-sm font-semibold text-gray-500 hover:text-[#00A859]">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-6 md:px-8 py-20 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E7FFDB] text-[#00A859] mb-8">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-[#00342b] mb-6">
          Get in Touch
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Have questions about scaling your business with Ondar? Founder & CEO Asiegbu Caleb and our dedicated team are here to help you succeed.
        </p>

        <div className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-gray-100 max-w-lg mx-auto">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Email Us Directly</h2>
          <a 
            href="mailto:ondar.ng@gmail.com" 
            className="text-2xl md:text-3xl font-bold text-[#00A859] hover:text-[#00342b] transition-colors break-all"
          >
            ondar.ng@gmail.com
          </a>
          
          <div className="mt-12 pt-12 border-t border-gray-100">
            <p className="text-gray-500 mb-4">
              "We read every email. Your success is our top priority."
            </p>
            <p className="font-bold text-gray-900">— Asiegbu Caleb, Founder & CEO</p>
          </div>
        </div>
      </main>

      <footer className="bg-[#0A0D14] w-full py-10 px-6 text-center text-white mt-10">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">© 2026 Ondar. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
