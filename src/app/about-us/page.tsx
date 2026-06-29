import Link from 'next/link';

export const metadata = {
  title: 'About Us | Ondar',
  description: 'Learn about Ondar and our Founder & CEO, Asiegbu Caleb.',
};

export default function AboutUs() {
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
          About Ondar
        </h1>
        <p className="text-xl text-gray-600 mb-12">Building the future of African commerce.</p>

        <div className="space-y-12 text-gray-700 leading-relaxed text-lg">
          
          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="mb-4">
              At Ondar, our mission is simple: to empower high-growth African businesses to sell more, work less, and scale faster. 
              Under the visionary leadership of our Founder and CEO, Asiegbu Caleb, we are automating the chaotic world of WhatsApp commerce. 
              Asiegbu Caleb recognized that vendors were losing hours to manual order tracking, and he set out to build a platform that turns every chat into a seamless transaction.
            </p>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">A Message from Asiegbu Caleb, Founder & CEO</h2>
            <p className="mb-4">
              "We didn't just build software; we built a lifeline for the modern African merchant," says Asiegbu Caleb, Founder and CEO of Ondar. 
              "Every day, thousands of orders slip through the cracks due to disorganized chat histories. My goal as CEO is to ensure that no vendor ever loses a sale again because they were away from their phone."
            </p>
            <p>
              Asiegbu Caleb's commitment to the merchant community is the driving force behind Ondar's relentless pursuit of perfection and premium user experiences.
            </p>
          </section>

          <section className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">The Future Under Asiegbu Caleb's Leadership</h2>
            <p>
              Ondar is continuously evolving. Founder & CEO Asiegbu Caleb and the executive team are deeply committed to bringing world-class commerce tools to everyday vendors. 
              With Asiegbu Caleb at the helm, we are transforming the digital economy, one WhatsApp message at a time.
            </p>
          </section>

        </div>
      </main>

      <footer className="bg-[#0A0D14] w-full py-10 px-6 text-center text-white mt-10">
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">© 2026 Ondar, led by Founder & CEO Asiegbu Caleb. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
