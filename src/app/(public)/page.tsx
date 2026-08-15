"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Users, CheckCircle2, Star, ShieldCheck, Zap, 
  TrendingUp, CreditCard, LayoutDashboard, Rocket
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FaTiktok, FaYoutube, FaFacebook, FaInstagram, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: FaInstagram, color: "text-[#E1306C]" },
  { id: "tiktok", name: "TikTok", icon: FaTiktok, color: "text-[#000000] dark:text-white" },
  { id: "youtube", name: "YouTube", icon: FaYoutube, color: "text-[#FF0000]" },
  { id: "twitter", name: "X (Twitter)", icon: FaXTwitter, color: "text-[#000000] dark:text-white" },
  { id: "facebook", name: "Facebook", icon: FaFacebook, color: "text-[#1877F2]" },
  { id: "telegram", name: "Telegram", icon: FaTelegram, color: "text-[#229ED9]" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Our automated system starts processing your orders within seconds of placement. No waiting around."
  },
  {
    icon: ShieldCheck,
    title: "100% Safe & Secure",
    description: "We use organic-looking delivery methods to keep your accounts completely safe from bans or flags."
  },
  {
    icon: CreditCard,
    title: "Local Payments",
    description: "Pay easily using MTN Mobile Money, Telecel, AT, or your credit/debit cards instantly via Moolre."
  }
];

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: "Create an Account",
    description: "Sign up for free in under 60 seconds to access your personal dashboard."
  },
  {
    icon: CreditCard,
    title: "Add Funds",
    description: "Top up your wallet securely using Mobile Money or Cards."
  },
  {
    icon: Rocket,
    title: "Place Order & Grow",
    description: "Select a service, enter your link, and watch your social presence skyrocket instantly."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050B14] text-white selection:bg-brand-500/30 font-sans overflow-hidden">
      
      {/* ══ HERO SECTION ════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col items-center justify-center text-center">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-ping"></span>
            <span className="text-sm font-medium text-gray-300">Ghana's #1 Premium SMM Provider</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            Grow Your Social Media <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-emerald-300">
              Instantly & Safely.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Boost your TikTok, Instagram, YouTube, and Twitter with high-quality followers, likes, and views. The fastest delivery in Africa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="xl" className="w-full sm:w-auto text-lg shadow-brand hover:scale-105 transition-transform" gradient>
                Start Growing Now <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/services">
              <Button size="xl" variant="outline" className="w-full sm:w-auto text-lg border-white/20 hover:bg-white/10 text-white">
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="mt-14 flex items-center justify-center gap-6 text-gray-500 text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 className="text-brand-500" size={16} /> Instant Start</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="text-brand-500" size={16} /> 24/7 Support</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="text-brand-500" size={16} /> MoMo Accepted</span>
          </div>
        </motion.div>
      </section>

      {/* ══ STATS BANNER ════════════════════════════════════════════════════ */}
      <section className="border-y border-white/5 bg-white/5 backdrop-blur-sm relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            <div>
              <p className="text-4xl font-bold text-white mb-2">50K+</p>
              <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Active Clients</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">1.2M+</p>
              <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Orders Completed</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-brand-400 mb-2">99%</p>
              <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">0.05$</p>
              <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Starting Price</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Why Choose SocialBoost GH?</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">We provide the highest quality services on the market, built on a robust, automated infrastructure.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {FEATURES.map((feat, i) => (
            <motion.div key={i} variants={itemVariants} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feat.icon className="text-brand-400" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feat.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ PLATFORMS ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-[#081220] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Dominate Every Platform</h2>
              <p className="text-gray-400 text-lg">Whether you're an influencer, musician, or business, we have tailored services for every major social network to help you go viral.</p>
            </div>
            <Link href="/services">
              <Button variant="outline" className="border-white/20 text-white group" size="lg">
                View All Services <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PLATFORMS.map((p, i) => (
              <Link key={p.id} href={`/services?platform=${p.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 flex flex-col items-center justify-center gap-4 transition-all group"
                >
                  <p.icon size={48} className={`opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all ${p.color}`} />
                  <span className="font-semibold text-gray-300 group-hover:text-white">{p.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 text-lg">Get started in three simple steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-brand-500/0 via-brand-500/50 to-brand-500/0 -z-10"></div>
          
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[#050B14] border-2 border-brand-500/50 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <step.icon className="text-brand-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Step {i + 1}: {step.title}</h3>
              <p className="text-gray-400 leading-relaxed max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ FINAL CTA ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-900/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-brand-500/30 blur-[150px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 border border-brand-500/20 rounded-3xl p-12 md:p-20 bg-[#050B14]/80 backdrop-blur-xl shadow-2xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Ready to go viral?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">Join 50,000+ creators and businesses who trust SocialBoost GH to handle their social growth.</p>
          
          <Link href="/auth/register">
            <Button size="xl" className="text-lg px-12 py-6 shadow-brand hover:scale-105 transition-transform" gradient>
              Create Free Account <ArrowRight className="ml-2" size={22} />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-gray-500">No credit card required to register.</p>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/10 bg-[#02050A] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-brand-500" size={28} />
              <span className="font-display font-bold text-2xl tracking-tight text-white">SocialBoost<span className="text-brand-500">GH</span></span>
            </Link>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              The premier Social Media Marketing panel in Ghana. We provide high-quality, instant, and affordable social media growth services.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/services" className="hover:text-brand-400 transition-colors">Services</Link></li>
              <li><Link href="/auth/login" className="hover:text-brand-400 transition-colors">Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-brand-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/terms" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SocialBoost GH. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
