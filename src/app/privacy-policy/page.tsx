import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Ondar',
  description: 'Privacy Policy for Ondar.ng',
};

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-gray-500 mb-12">Last Updated: June 29, 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to Ondar. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and share your personal data when you use our 
              website and services, specifically tailored for WhatsApp commerce operations in Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. The Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2">
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and WhatsApp telephone numbers.</li>
              <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products and services you have purchased from us or sold through our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to provide our services to you, to manage your account, to process transactions securely, and to communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. WhatsApp Integration</h2>
            <p>
              Ondar facilitates the creation of pre-filled WhatsApp messages to streamline your sales process. 
              We do not intercept, read, or store the contents of your private WhatsApp conversations. 
              The data transmitted to WhatsApp is governed by WhatsApp's own Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at: <br/>
              <strong>Email:</strong> support@ondar.ng <br/>
              <strong>Address:</strong> Lagos, Nigeria.
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
