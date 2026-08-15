import type { Metadata } from "next";
export const metadata: Metadata = { title: "Terms of Service", description: "Read Jelboost GH Terms of Service." };

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-3">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
            <p>By accessing or using Jelboost GH (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you disagree with any part, you may not use our service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Services Provided</h2>
            <p>Jelboost GH provides social media engagement services including followers, likes, views, and other engagement metrics for various platforms. We do not guarantee specific results as platform algorithms may change.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Account Responsibility</h2>
            <p>You are responsible for maintaining the security of your account credentials. We will never ask for your social media passwords. You must ensure your account is public when placing orders.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Payments & Refunds</h2>
            <p>All payments are processed securely. We offer a 30-day refill guarantee for eligible services. Refunds are processed on a case-by-case basis. Wallet balance is non-refundable once credited.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Prohibited Uses</h2>
            <p>You may not use our service for illegal activities, to distribute harmful content, or to violate the terms of service of third-party platforms. We reserve the right to suspend accounts engaged in prohibited activities.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Limitation of Liability</h2>
            <p>Jelboost GH shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the amount paid for the specific order in question.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Contact</h2>
            <p>For questions about these terms, contact us at: <a href="mailto:legal@jelboostgh.com" className="text-brand-500 hover:text-brand-600">legal@jelboostgh.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
