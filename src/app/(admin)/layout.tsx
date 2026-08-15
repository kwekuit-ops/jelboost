"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, ShoppingBag, Zap, Tag, CreditCard,
  Ticket, Star, Settings, Globe, FileText, Bell, Database,
  BarChart3, Menu, X, ChevronRight, Shield,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_NAV = [
  { group: "Overview",   items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { group: "Management", items: [
    { href: "/admin/users",         label: "Users",          icon: Users },
    { href: "/admin/orders",        label: "Orders",         icon: ShoppingBag },
    { href: "/admin/services",      label: "Services",       icon: Zap },
    { href: "/admin/categories",    label: "Categories",     icon: Tag },
    { href: "/admin/coupons",       label: "Coupons",        icon: CreditCard },
  ]},
  { group: "Finance",    items: [
    { href: "/admin/payments",      label: "Payments",       icon: CreditCard },
    { href: "/admin/analytics",     label: "Analytics",      icon: BarChart3 },
  ]},
  { group: "Content",    items: [
    { href: "/admin/announcements", label: "Announcements",  icon: Bell },
    { href: "/admin/reviews",       label: "Reviews",        icon: Star },
    { href: "/admin/blog",          label: "Blog Posts",     icon: FileText },
    { href: "/admin/tickets",       label: "Support Tickets",icon: Ticket },
  ]},
  { group: "System",     items: [
    { href: "/admin/api-providers", label: "API Providers",  icon: Database },
    { href: "/admin/settings",      label: "Site Settings",  icon: Settings },
    { href: "/admin/seo",           label: "SEO Settings",   icon: Globe },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
          <Shield size={16} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-sm">Admin Panel</p>
          <p className="text-gray-500 text-[10px]">SocialBoost GH</p>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {ADMIN_NAV.map(({ group, items }) => (
          <div key={group}>
            <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">{group}</p>
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all mb-0.5",
                  isActive(href)
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )}
              >
                <Icon size={14} />
                {label}
                {isActive(href) && <ChevronRight size={10} className="ml-auto" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-56 bg-gray-900 border-r border-gray-800 z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 lg:ml-56">
        <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setOpen(true)} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800" aria-label="Menu">
            <Menu size={18} />
          </button>
          <h1 className="text-sm font-semibold text-white">
            {ADMIN_NAV.flatMap((g) => g.items).find((i) => isActive(i.href))?.label || "Admin"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 text-gray-100">{children}</main>
      </div>
    </div>
  );
}
