import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Ondar',
  description: 'Terms of Service for Ondar.ng',
};

export default function TermsOfService() {
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

      <main className="max-w-[800px] mx-auto px-6 md:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-[#00342b] mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-500 mb-12">Last Updated: June 29, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Ondar, you accept and agree to be bound by the terms and provision of this agreement. 
              In addition, when using Ondar's services, you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p>
              Ondar provides a platform for businesses to create digital storefronts and automate their order collection via WhatsApp. 
              We do not process the actual goods, nor are we responsible for the delivery of physical products sold through the storefronts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
            <p>
              As a merchant using Ondar, you agree to:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li>Provide accurate and complete information about your business and products.</li>
              <li>Fulfill all orders accepted through your Ondar storefront.</li>
              <li>Comply with all applicable laws in Nigeria regarding commerce and digital consumer protection.</li>
              <li>Not sell any prohibited, illegal, or heavily regulated items without proper authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment and Subscriptions</h2>
            <p>
              Certain features of Ondar may require payment. You agree to pay all applicable fees related to your use of the service. 
              Subscription fees are non-refundable unless required by law. We reserve the right to change our pricing upon giving reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p>
              Ondar shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
              loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-[#0A0D14] w-full py-10 px-6 text-center text-white mt-20">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">© 2026 Ondar. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
