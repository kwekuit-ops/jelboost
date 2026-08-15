"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap, Menu, X, Sun, Moon, Bell, ChevronDown,
  User, LayoutDashboard, LogOut, Settings, Shield,
  Wallet, ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/",         label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing",  label: "Pricing" },
  { href: "/blog",     label: "Blog" },
  { href: "/faq",      label: "FAQ" },
  { href: "/contact",  label: "Contact" },
];

export function Navbar() {
  const pathname      = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [userMenu, setUserMenu]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-200",
        scrolled
          ? "bg-white/95 dark:bg-[#08111d]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-white/80 dark:bg-[#08111d]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Jelboost GH home">
            <Image src="/logo.png" alt="Jelboost Logo" width={160} height={48} className="h-10 w-auto md:h-12" priority />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm font-medium pb-0.5 transition-colors duration-200",
                  isActive(link.href)
                    ? "text-brand-500 dark:text-brand-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {session ? (
              <>
                {/* Notifications */}
                <Link
                  href="/dashboard/notifications"
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                      {session.user?.name || "User"}
                    </span>
                    <ChevronDown size={14} className={cn("text-slate-400 transition-transform", userMenu && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f1c2e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50"
                        onMouseLeave={() => setUserMenu(false)}
                      >
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{session.user?.name}</p>
                          <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
                        </div>
                        <div className="p-1.5 space-y-0.5">
                          {[
                            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
                            { href: "/dashboard/orders", icon: ShoppingBag, label: "My Orders" },
                            { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
                            { href: "/dashboard/profile", icon: Settings, label: "Settings" },
                            ...(["ADMIN","SUPER_ADMIN"].includes((session.user as any)?.role)
                              ? [{ href: "/admin", icon: Shield, label: "Admin Panel" }]
                              : []),
                          ].map(({ href, icon: Icon, label }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/50 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                              <Icon size={15} />
                              {label}
                            </Link>
                          ))}
                          <button
                            onClick={() => { setUserMenu(false); signOut({ callbackUrl: "/" }); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm" className="text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800">Log In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" gradient>Get Started</Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#08111d]/95 backdrop-blur-xl"
            >
              <div className="py-4 px-2 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                      isActive(link.href)
                        ? "text-brand-600 bg-brand-50 dark:bg-brand-950/50 dark:text-brand-400 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!session && (
                  <div className="pt-2 flex gap-2">
                    <Link href="/auth/login" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button variant="outline" fullWidth>Log In</Button>
                    </Link>
                    <Link href="/auth/register" className="flex-1" onClick={() => setMenuOpen(false)}>
                      <Button fullWidth gradient>Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
