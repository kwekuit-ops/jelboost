"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Zap, Clock, Star, ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, QualityBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

// ─── Static service data (replace with API data in production) ─────────────

const SERVICES = [
  // TikTok
  { id: "tt-followers", platform: "tiktok",    name: "TikTok Followers",      pricePerThousand: 2.50, min: 100, max: 1000000, delivery: "1-6 hours",   quality: "High Quality" },
  { id: "tt-likes",     platform: "tiktok",    name: "TikTok Likes",          pricePerThousand: 0.80, min: 50,  max: 500000,  delivery: "0-1 hour",    quality: "Instant" },
  { id: "tt-views",     platform: "tiktok",    name: "TikTok Views",          pricePerThousand: 0.30, min: 500, max: 5000000, delivery: "0-30 min",    quality: "Instant" },
  { id: "tt-shares",    platform: "tiktok",    name: "TikTok Shares",         pricePerThousand: 3.00, min: 100, max: 100000,  delivery: "1-12 hours",  quality: "High Quality" },
  { id: "tt-comments",  platform: "tiktok",    name: "TikTok Comments",       pricePerThousand: 8.00, min: 10,  max: 10000,   delivery: "1-24 hours",  quality: "Premium" },
  // YouTube
  { id: "yt-subs",      platform: "youtube",   name: "YouTube Subscribers",   pricePerThousand: 12.0, min: 100, max: 100000,  delivery: "24-72 hours", quality: "High Quality" },
  { id: "yt-views",     platform: "youtube",   name: "YouTube Views",         pricePerThousand: 1.50, min: 500, max: 5000000, delivery: "0-2 hours",   quality: "Instant" },
  { id: "yt-likes",     platform: "youtube",   name: "YouTube Likes",         pricePerThousand: 2.00, min: 50,  max: 200000,  delivery: "0-6 hours",   quality: "High Quality" },
  // Facebook
  { id: "fb-followers", platform: "facebook",  name: "Facebook Followers",    pricePerThousand: 3.50, min: 100, max: 500000,  delivery: "2-12 hours",  quality: "High Quality" },
  { id: "fb-likes",     platform: "facebook",  name: "Facebook Post Likes",   pricePerThousand: 2.00, min: 50,  max: 200000,  delivery: "0-6 hours",   quality: "High Quality" },
  { id: "fb-pagelikes", platform: "facebook",  name: "Facebook Page Likes",   pricePerThousand: 5.00, min: 100, max: 100000,  delivery: "6-24 hours",  quality: "Premium" },
  { id: "fb-vidviews",  platform: "facebook",  name: "Facebook Video Views",  pricePerThousand: 0.50, min: 500, max: 5000000, delivery: "0-1 hour",    quality: "Instant" },
  // Instagram
  { id: "ig-followers", platform: "instagram", name: "Instagram Followers",   pricePerThousand: 4.00, min: 100, max: 500000,  delivery: "1-12 hours",  quality: "High Quality" },
  { id: "ig-likes",     platform: "instagram", name: "Instagram Likes",       pricePerThousand: 0.70, min: 50,  max: 200000,  delivery: "0-1 hour",    quality: "Instant" },
  { id: "ig-views",     platform: "instagram", name: "Instagram Views",       pricePerThousand: 0.40, min: 500, max: 5000000, delivery: "0-30 min",    quality: "Instant" },
  { id: "ig-comments",  platform: "instagram", name: "Instagram Comments",    pricePerThousand: 9.00, min: 10,  max: 5000,    delivery: "1-24 hours",  quality: "Premium" },
  // X (Twitter)
  { id: "tw-followers", platform: "twitter",   name: "X (Twitter) Followers", pricePerThousand: 5.00, min: 100, max: 100000,  delivery: "1-24 hours",  quality: "High Quality" },
  { id: "tw-likes",     platform: "twitter",   name: "X Likes",               pricePerThousand: 1.20, min: 50,  max: 200000,  delivery: "0-6 hours",   quality: "High Quality" },
  { id: "tw-retweets",  platform: "twitter",   name: "X Retweets",            pricePerThousand: 2.50, min: 50,  max: 50000,   delivery: "1-12 hours",  quality: "High Quality" },
  // Telegram
  { id: "tg-members",   platform: "telegram",  name: "Telegram Members",      pricePerThousand: 6.00, min: 100, max: 500000,  delivery: "1-24 hours",  quality: "High Quality" },
  { id: "tg-views",     platform: "telegram",  name: "Telegram Post Views",   pricePerThousand: 0.20, min: 500, max: 5000000, delivery: "0-30 min",    quality: "Instant" },
];

const PLATFORMS = [
  { id: "all",       name: "All Platforms", emoji: "🌐" },
  { id: "tiktok",   name: "TikTok",         emoji: "🎵" },
  { id: "youtube",  name: "YouTube",         emoji: "▶️" },
  { id: "facebook", name: "Facebook",        emoji: "👍" },
  { id: "instagram",name: "Instagram",       emoji: "📷" },
  { id: "twitter",  name: "X (Twitter)",     emoji: "🐦" },
  { id: "telegram", name: "Telegram",        emoji: "✈️" },
];

const PLATFORM_GRADIENTS: Record<string, string> = {
  tiktok:    "bg-gray-800",
  youtube:   "bg-red-600",
  facebook:  "bg-blue-700",
  instagram: "bg-pink-600",
  twitter:   "bg-sky-600",
  telegram:  "bg-cyan-700",
};

function formatQuantity(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

export default function ServicesClient() {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "name" | "delivery">("price");

  const filtered = useMemo(() => {
    return SERVICES
      .filter((s) => {
        const matchPlatform = selectedPlatform === "all" || s.platform === selectedPlatform;
        const matchSearch   = s.name.toLowerCase().includes(search.toLowerCase());
        return matchPlatform && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price") return a.pricePerThousand - b.pricePerThousand;
        if (sortBy === "name")  return a.name.localeCompare(b.name);
        return 0;
      });
  }, [selectedPlatform, search, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <section className="pt-28 pb-16 bg-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="primary" className="mb-4 bg-white/10 text-white border-white/20">
              <Zap size={12} />
              {SERVICES.length} Services Available
            </Badge>
            <h1 className="font-display text-5xl font-bold text-white mb-4">
              All Services
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Choose from our wide range of premium social media services. All delivered fast and safely.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-16 lg:top-20 z-30 bg-white/95 dark:bg-[#08111d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Platform tabs */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 lg:pb-0">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedPlatform === p.id
                      ? "bg-brand-600 text-white shadow-brand"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 ml-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 lg:w-56"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="price">Sort: Price</option>
                <option value="name">Sort: Name</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> services
          </p>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filtered.map((svc, i) => (
              <motion.div
                key={svc.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Card className="h-full flex flex-col gap-4 group">
                  {/* Platform chip */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-white ${PLATFORM_GRADIENTS[svc.platform]}`}>
                      {PLATFORMS.find((p) => p.id === svc.platform)?.emoji}
                      {PLATFORMS.find((p) => p.id === svc.platform)?.name}
                    </span>
                    <QualityBadge quality={svc.quality} />
                  </div>

                  {/* Service Name */}
                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-base leading-tight">
                    {svc.name}
                  </h3>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide font-medium text-gray-400 dark:text-gray-500">Price / 1K</p>
                      <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">{formatCurrency(svc.pricePerThousand)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide font-medium text-gray-400 dark:text-gray-500">Delivery</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock size={11} /> {svc.delivery}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide font-medium text-gray-400 dark:text-gray-500">Min</p>
                      <p className="font-medium">{formatQuantity(svc.min)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide font-medium text-gray-400 dark:text-gray-500">Max</p>
                      <p className="font-medium">{formatQuantity(svc.max)}</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link href={`/dashboard/new-order?service=${svc.id}`}>
                      <Button fullWidth size="sm" gradient icon={<ArrowRight size={14} />} iconPosition="right">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-600 dark:text-gray-400 font-medium">No services found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search or platform filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
