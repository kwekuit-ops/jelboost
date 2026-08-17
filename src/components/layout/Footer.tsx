"use client";

import Link from "next/link";
import Image from "next/image";
import { Zap, Twitter, Facebook, Instagram, Youtube, Send } from "lucide-react";

const FOOTER_LINKS = {
  Services: [
    { label: "TikTok Services",    href: "/services?platform=tiktok" },
    { label: "YouTube Services",   href: "/services?platform=youtube" },
    { label: "Instagram Services", href: "/services?platform=instagram" },
    { label: "Facebook Services",  href: "/services?platform=facebook" },
    { label: "X (Twitter) Services",href: "/services?platform=twitter" },
    { label: "Telegram Services",  href: "/services?platform=telegram" },
  ],
  Company: [
    { label: "About Us",    href: "/about" },
    { label: "Blog",        href: "/blog" },
    { label: "Pricing",     href: "/pricing" },
    { label: "Careers",     href: "/careers" },
    { label: "Affiliate",   href: "/dashboard/referral" },
  ],
  Support: [
    { label: "FAQ",             href: "/faq" },
    { label: "Contact Us",      href: "/contact" },
    { label: "Support Tickets", href: "/dashboard/tickets" },
    { label: "Order Tracking",  href: "/dashboard/orders" },
    { label: "API Docs",        href: "/api-docs" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Refund Policy",    href: "/refund-policy" },
    { label: "Cookie Policy",    href: "/cookies" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter,   href: "https://twitter.com/jelboost",   label: "Twitter" },
  { icon: Facebook,  href: "https://facebook.com/jelboost",  label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/jelboost", label: "Instagram" },
  { icon: Youtube,   href: "https://youtube.com/@jelboost",  label: "YouTube" },
  { icon: Send,      href: "https://t.me/jelboost",          label: "Telegram" },
];

const PAYMENT_ICONS = ["Paystack", "Flutterwave", "Stripe", "PayPal", "USDT", "MTN MoMo"];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image src="/logo.png" alt="Jelboost GH Logo" width={160} height={48} className="h-10 w-auto md:h-12" />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Ghana&apos;s #1 social media growth platform. Buy high-quality followers, likes, and views for all major platforms. Fast, safe, and affordable.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wider">{category}</h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-medium">Accepted Payments</p>
          <div className="flex flex-wrap items-center gap-3">
            {PAYMENT_ICONS.map((method) => (
              <span
                key={method}
                className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-300 font-medium border border-gray-700"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            &copy; {year} Jelboost GH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
            <Link href="/refund-policy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
