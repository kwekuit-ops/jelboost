"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign, ShoppingBag, Clock, CheckCircle2,
  TrendingUp, ArrowUpRight, Zap, Bell, Wallet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Placeholder data — replace with real API calls
const STATS = [
  { label: "Account Balance",   value: "$0.00",  icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Total Orders",      value: "0",       icon: ShoppingBag, color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "Active Orders",     value: "0",       icon: Clock,       color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20" },
  { label: "Completed Orders",  value: "0",       icon: CheckCircle2, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-900/20" },
];

const RECENT_ORDERS: any[] = [];
const NOTIFICATIONS: any[] = [];

const QUICK_ACTIONS = [
  { label: "New Order",      href: "/dashboard/new-order",     icon: Zap,       color: "bg-brand-600" },
  { label: "Add Funds",      href: "/dashboard/wallet",        icon: Wallet,    color: "bg-emerald-600" },
  { label: "Track Orders",   href: "/dashboard/orders",        icon: ShoppingBag, color: "bg-blue-600" },
  { label: "Notifications",  href: "/dashboard/notifications", icon: Bell,      color: "bg-amber-500" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/dashboard/new-order">
          <Button gradient icon={<Zap size={16} />}>Place Order</Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="md" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <TrendingUp size={12} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+0%</span>
              <span className="text-xs text-gray-400">vs last month</span>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon, color }) => (
            <Link key={label} href={href}>
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`${color} rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer shadow-lg`}
              >
                <Icon size={22} className="text-white" />
                <span className="text-white text-xs font-semibold text-center">{label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Orders */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-border dark:border-surface-border-dark">
              <CardTitle>Recent Orders</CardTitle>
              <Link href="/dashboard/orders" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </Link>
            </div>
            {RECENT_ORDERS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-gray-400" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">No orders yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Place your first order to get started</p>
                <Link href="/dashboard/new-order">
                  <Button size="sm" gradient>Place First Order</Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {RECENT_ORDERS.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.service}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Notifications + Wallet */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          {/* Wallet */}
          <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 shadow-brand">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <p className="text-white/70 text-xs font-medium mb-1">Available Balance</p>
            <p className="font-display text-3xl font-bold text-white mb-4">$0.00</p>
            <Link href="/dashboard/wallet">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Wallet size={15} /> Add Funds
              </button>
            </Link>
          </div>

          {/* Notifications */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-surface-border dark:border-surface-border-dark">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Badge variant="primary" size="sm">{NOTIFICATIONS.length}</Badge>
            </div>
            {NOTIFICATIONS.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            ) : null}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
