"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Search, Filter, RefreshCw, Eye, ExternalLink } from "lucide-react";

const STATUSES = ["All", "Pending", "Processing", "Completed", "Cancelled", "Partial", "Refunded"];

// Placeholder — replace with real API
const ORDERS: any[] = [];

export default function OrdersPage() {
  const [status, setStatus] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = ORDERS.filter((o) => {
    const matchStatus = status === "All" || o.status === status.toUpperCase();
    const matchSearch = o.service.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage your orders</p>
        </div>
        <Button variant="outline" size="sm" icon={<RefreshCw size={14} />}>Refresh</Button>
      </div>

      {/* Filters */}
      <Card padding="md" className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                status === s
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg border border-surface-border dark:border-surface-border-dark bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-48"
          />
        </div>
      </Card>

      {/* Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-surface-border dark:border-surface-border-dark">
              <tr>
                {["Order ID", "Service", "Link", "Qty", "Price", "Status", "Date", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border dark:divide-surface-border-dark">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <p className="font-medium text-gray-700 dark:text-gray-300">No orders found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">Your orders will appear here once you place one</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{order.id.slice(-8)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white max-w-[150px] truncate">{order.service}</td>
                    <td className="px-4 py-3">
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:text-brand-600 flex items-center gap-1 max-w-[120px] truncate">
                        <ExternalLink size={12} /> {order.link}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{order.quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />}>View</Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
