"use client";

import { motion } from "framer-motion";
import { Gift, Copy, Share2, Users, DollarSign, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

const REFERRAL_STATS = [
  { label: "Total Referrals", value: "0", icon: Users },
  { label: "Earned",          value: "$0.00", icon: DollarSign },
  { label: "Pending",         value: "$0.00", icon: Gift },
];

export default function ReferralPage() {
  const { data: session } = useSession();
  const referralCode = "SB" + (session?.user?.id?.slice(0, 6).toUpperCase() || "XXXXXX");
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://jelboostgh.com"}/auth/register?ref=${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Earn commissions by referring friends to Jelboost GH</p>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient p-8 text-white shadow-brand-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <Gift size={32} className="mb-3 text-white/80" />
          <h2 className="font-display text-2xl font-bold mb-2">Earn 5% Commission</h2>
          <p className="text-white/80 text-sm mb-6 max-w-sm">
            For every friend you refer, you earn 5% of their total spending — forever! No limits on how much you can earn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 font-mono text-sm break-all">
              {referralLink}
            </div>
            <Button
              className="bg-white text-brand-600 hover:bg-gray-50 shrink-0"
              icon={<Copy size={15} />}
              onClick={copyLink}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {REFERRAL_STATS.map(({ label, value, icon: Icon }) => (
          <Card key={label} padding="md">
            <div className="flex items-center justify-between mb-2">
              <Icon size={18} className="text-brand-500" />
            </div>
            <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Your Referral Code */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Your Referral Code</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-brand-50 dark:bg-brand-950/30 rounded-xl px-5 py-4 text-center">
            <p className="font-mono text-2xl font-bold text-brand-600 dark:text-brand-400 tracking-widest">{referralCode}</p>
          </div>
          <Button variant="outline" icon={<Copy size={15} />} onClick={() => { navigator.clipboard.writeText(referralCode); toast.success("Code copied!"); }}>
            Copy
          </Button>
        </div>
      </Card>

      {/* Share buttons */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Share Your Link</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "WhatsApp",  color: "bg-green-500 hover:bg-green-600", href: `https://wa.me/?text=Join+Jelboost+GH+using+my+referral+link:+${encodeURIComponent(referralLink)}` },
            { label: "Twitter/X", color: "bg-gray-900 hover:bg-gray-800",   href: `https://twitter.com/intent/tweet?text=Grow+your+social+media+with+%40jelboostgh!+Use+my+referral+link:&url=${encodeURIComponent(referralLink)}` },
            { label: "Facebook",  color: "bg-blue-600 hover:bg-blue-700",   href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
            { label: "Telegram",  color: "bg-sky-500 hover:bg-sky-600",     href: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` },
          ].map(({ label, color, href }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer">
              <button className={`${color} text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-2`}>
                <Share2 size={14} /> {label}
              </button>
            </a>
          ))}
        </div>
      </Card>

      {/* How it works */}
      <Card padding="md">
        <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">How it Works</h3>
        <div className="space-y-3">
          {[
            { step: "1", text: "Share your unique referral link or code with friends" },
            { step: "2", text: "Your friend signs up using your link and makes a deposit" },
            { step: "3", text: "You earn 5% of all their future purchases — automatically!" },
          ].map(({ step, text }) => (
            <div key={step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold shrink-0">
                {step}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{text}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
