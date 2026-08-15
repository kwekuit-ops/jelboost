"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Wallet,
  Bell, Users, Settings, LogOut, Zap, Menu, X,
  Ticket, Gift, ChevronRight, Shield, TrendingUp, LockKeyhole,
} from "lucide-react";

const NAV = [
  { href: "/dashboard",               label: "Overview",         icon: LayoutDashboard },
  { href: "/dashboard/new-order",     label: "New Order",        icon: PlusCircle,     highlight: true },
  { href: "/dashboard/orders",        label: "My Orders",        icon: ShoppingBag },
  { href: "/dashboard/wallet",        label: "Wallet",           icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications",    icon: Bell },
  { href: "/dashboard/tickets",       label: "Support Tickets",  icon: Ticket },
  { href: "/dashboard/referral",      label: "Referral",         icon: Gift },
  { href: "/dashboard/profile",       label: "Settings",         icon: Settings },
];

const ADMIN_NAV = [
  { href: "/admin",                 label: "Admin Panel",   icon: Shield },
  { href: "/admin/users",           label: "Users",         icon: Users },
  { href: "/admin/orders",          label: "Orders",        icon: ShoppingBag },
  { href: "/admin/services",        label: "Services",      icon: TrendingUp },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [hasFunded, setHasFunded] = useState<boolean | null>(null);
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes((session?.user as any)?.role);
  const isWalletPage = pathname === "/dashboard/wallet";
  const activationRequired = hasFunded === false && !isWalletPage;

  useEffect(() => {
    let active = true;
    fetch("/api/wallet/balance")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!active || !data) return;
        setBalance(data.balance ?? 0);
        setHasFunded(Boolean(data.hasFunded));
      })
      .catch(() => { if (active) setHasFunded(null); });
    return () => { active = false; };
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-surface-border dark:border-surface-border-dark">
        <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-base text-gray-900 dark:text-white">
          Jel<span className="gradient-text">boost</span>
        </span>
      </div>

      {/* Balance Card */}
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-brand-gradient shadow-brand">
        <p className="text-white/70 text-xs font-medium">Account Balance</p>
        <p className="text-white font-display text-2xl font-bold mt-0.5">
          {formatCurrency(balance)}
        </p>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-1 mt-2 text-white/80 text-xs hover:text-white transition-colors"
        >
          Add Funds <ChevronRight size={12} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Main Menu
        </p>
        {NAV.map(({ href, label, icon: Icon, highlight }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive(href)
                ? "bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400"
                : highlight
                ? "bg-brand-gradient text-white shadow-brand hover:opacity-90"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-4">
              Admin
            </p>
            {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive(href)
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-surface-border dark:border-surface-border-dark">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{session?.user?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session?.user?.email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 bg-white dark:bg-surface-dark border-r border-surface-border dark:border-surface-border-dark fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 w-[min(18rem,calc(100vw-2.5rem))] bg-white dark:bg-surface-dark border-r border-surface-border dark:border-surface-border-dark z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 xl:ml-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-white/85 dark:bg-surface-dark/85 backdrop-blur-xl border-b border-surface-border dark:border-surface-border-dark px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white hidden sm:block">
                Welcome back, {session?.user?.name?.split(" ")[0] || "User"} 👋
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={activationRequired ? "/dashboard/wallet" : "/dashboard/new-order"}>
              <button className="flex items-center gap-1.5 min-h-9 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors">
                {activationRequired ? <Wallet size={14} /> : <PlusCircle size={14} />}
                {activationRequired ? "Add Funds" : "New Order"}
              </button>
            </Link>
            <Link href="/dashboard/notifications">
              <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Notifications">
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </Link>
          </div>
        </header>

        {/* Page */}
        <main className="p-4 sm:p-6 lg:p-8 pb-8 sm:pb-10">
          <div className="max-w-7xl mx-auto w-full">
            {activationRequired ? (
              <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
                <div className="w-full max-w-xl text-center rounded-3xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-surface-card-dark p-7 sm:p-10 shadow-[0_20px_60px_rgba(14,165,233,0.12)]">
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
                    <LockKeyhole size={24} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Account activation</p>
                  <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Fund your wallet to unlock services</h1>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 dark:text-gray-400">Your account is ready. Make your first deposit to access orders, service tools, and the rest of your dashboard.</p>
                  <Link href="/dashboard/wallet" className="mt-7 inline-flex">
                    <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-gradient px-5 text-sm font-semibold text-white shadow-brand transition-opacity hover:opacity-90">
                      <Wallet size={17} /> Deposit funds
                    </button>
                  </Link>
                </div>
              </div>
            ) : children}
          </div>
        </main>
      </div>
    </div>
  );
}
