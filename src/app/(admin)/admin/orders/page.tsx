"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, CheckCircle2, XCircle, Clock, Filter } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const ORDERS: any[] = [];
const STATUSES = ["ALL","PENDING","PROCESSING","COMPLETED","CANCELLED","PARTIAL","REFUNDED"];

export default function AdminOrdersPage() {
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("ALL");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ORDERS.filter((o) => {
    const matchStatus = status === "ALL" || o.status === status;
    const matchSearch = o.id?.includes(search) || o.user?.email?.includes(search) || o.service?.name?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Orders Management</h1>
          <p className="text-gray-400 text-sm">View and manage all customer orders</p>
        </div>
        <div className="flex gap-2">
          {selected.length > 0 && (
            <>
              <Button size="sm" className="border-green-500 text-green-400 bg-transparent hover:bg-green-500/10" icon={<CheckCircle2 size={14} />}>
                Complete {selected.length}
              </Button>
              <Button size="sm" className="border-red-500 text-red-400 bg-transparent hover:bg-red-500/10" icon={<XCircle size={14} />}>
                Cancel {selected.length}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text" placeholder="Search orders, users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 w-56"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${status === s ? "bg-brand-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-3 py-3 text-left w-8">
                  <input type="checkbox" className="rounded" onChange={(e) => setSelected(e.target.checked ? filtered.map((o) => o.id) : [])} />
                </th>
                {["Order ID","User","Service","Link","Qty","Price","Status","Date","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(order.id)}
                        onChange={(e) => setSelected(e.target.checked ? [...selected, order.id] : selected.filter((x) => x !== order.id))}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-400">#{order.id?.slice(-8)}</td>
                    <td className="px-4 py-3 text-gray-300">{order.user?.email}</td>
                    <td className="px-4 py-3 text-gray-200 max-w-[120px] truncate">{order.service?.name}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[100px] truncate">{order.link}</td>
                    <td className="px-4 py-3 text-gray-300">{order.quantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{formatCurrency(order.totalPrice)}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-400"><Eye size={12} /></button>
                        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400"><CheckCircle2 size={12} /></button>
                        <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"><XCircle size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
