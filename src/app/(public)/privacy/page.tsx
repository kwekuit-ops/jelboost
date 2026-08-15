import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", description: "How SocialBoost GH handles your data." };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-3">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-10">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        <div className="space-y-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly (name, email, payment info), usage data (orders, transactions), and technical data (IP address, browser type). We never collect your social media passwords.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to: process orders, send service notifications, improve our platform, prevent fraud, and comply with legal obligations. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <p>We use third-party payment processors (Paystack, Flutterwave, Stripe) and authentication (Google OAuth). These services have their own privacy policies which we encourage you to review.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, contact us at privacy@socialboostgh.com. We will respond within 30 days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management, and optional analytics cookies to improve our service. You can control cookies through your browser settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Contact</h2>
            <p>Privacy questions: <a href="mailto:privacy@socialboostgh.com" className="text-brand-500 hover:text-brand-600">privacy@socialboostgh.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
