"use client";

import { useEffect, useState, useCallback } from "react";
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

const QUICK_ACTIONS = [
  { label: "New Order",     href: "/dashboard/new-order",     icon: Zap,         color: "bg-brand-600" },
  { label: "Add Funds",     href: "/dashboard/wallet",        icon: Wallet,      color: "bg-emerald-600" },
  { label: "Track Orders",  href: "/dashboard/orders",        icon: ShoppingBag, color: "bg-blue-600" },
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell,        color: "bg-amber-500" },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface DashboardData {
  balance: number;
  totalSpent: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  recentOrders: Array<{
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    service: { name: string };
  }>;
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
  unreadCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [balanceRes, ordersRes, notifsRes] = await Promise.all([
        fetch("/api/wallet/balance"),
        fetch("/api/orders?limit=5"),
        fetch("/api/notifications"),
      ]);

      const [balanceData, ordersData, notifsData] = await Promise.all([
        balanceRes.ok ? balanceRes.json() : Promise.resolve({} as any),
        ordersRes.ok ? ordersRes.json() : Promise.resolve({ orders: [], total: 0 } as any),
        notifsRes.ok ? notifsRes.json() : Promise.resolve({ notifications: [], unreadCount: 0 } as any),
      ]);

      const allOrders: any[] = ordersData.orders ?? [];

      setData({
        balance:             balanceData.balance      ?? 0,
        totalSpent:          balanceData.totalSpent   ?? 0,
        totalOrders:         ordersData.total         ?? 0,
        activeOrders:        allOrders.filter((o: any) => ["PENDING", "PROCESSING"].includes(o.status)).length,
        completedOrders:     allOrders.filter((o: any) => o.status === "COMPLETED").length,
        recentOrders:        allOrders.slice(0, 5),
        recentNotifications: (notifsData.notifications ?? []).slice(0, 4),
        unreadCount:         notifsData.unreadCount ?? 0,
      });
    } catch (err) {
      console.error("[DASHBOARD]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const stats = [
    { label: "Account Balance",  value: loading ? "—" : formatCurrency(data?.balance  ?? 0), icon: DollarSign,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Total Orders",     value: loading ? "—" : String(data?.totalOrders      ?? 0), icon: ShoppingBag, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Active Orders",    value: loading ? "—" : String(data?.activeOrders     ?? 0), icon: Clock,       color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Completed Orders", value: loading ? "—" : String(data?.completedOrders  ?? 0), icon: CheckCircle2, color: "text-brand-500",  bg: "bg-brand-50 dark:bg-brand-900/20" },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="md" className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
                {loading ? (
                  <div className="h-7 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mt-1" />
                ) : (
                  <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
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

            {loading ? (
              <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
                    <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : (data?.recentOrders ?? []).length === 0 ? (
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
                {data!.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{order.service?.name}</p>
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

        {/* Sidebar: Wallet + Notifications */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-5">
          {/* Wallet card */}
          <div className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 shadow-brand">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <p className="text-white/70 text-xs font-medium mb-1">Available Balance</p>
            {loading ? (
              <div className="h-9 w-28 bg-white/20 animate-pulse rounded-lg mb-4" />
            ) : (
              <p className="font-display text-3xl font-bold text-white mb-4">{formatCurrency(data?.balance ?? 0)}</p>
            )}
            <Link href="/dashboard/wallet">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                <Wallet size={15} /> Add Funds
              </button>
            </Link>
          </div>

          {/* Notifications preview */}
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-surface-border dark:border-surface-border-dark">
              <CardTitle className="text-base">Notifications</CardTitle>
              {(data?.unreadCount ?? 0) > 0 && (
                <Badge variant="primary" size="sm">{data!.unreadCount}</Badge>
              )}
            </div>
            {loading ? (
              <div className="space-y-1 p-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5 pt-1">
                      <div className="h-2.5 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                      <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (data?.recentNotifications ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell size={24} className="text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
                {data!.recentNotifications.map((n) => (
                  <div key={n.id} className={`flex gap-3 p-4 ${!n.isRead ? "bg-brand-50/40 dark:bg-brand-950/10" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{n.title}</p>
                        {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
                <div className="p-3">
                  <Link href="/dashboard/notifications" className="text-xs text-brand-500 hover:text-brand-600 font-medium flex items-center justify-center gap-1">
                    View all notifications <ArrowUpRight size={11} />
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
