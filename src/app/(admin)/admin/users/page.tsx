"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Shield, ShoppingBag, Eye, Ban } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

const USERS: any[] = [];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [banTarget, setBanTarget]       = useState<string | null>(null);

  const filtered = USERS.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm">Manage all registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Banned", "Admin"].map((f) => (
            <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors">
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                {["User","Email","Role","Balance","Total Orders","Status","Joined","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500 text-sm">
                    No users found
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-white text-xs">{user.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "ADMIN" ? "warning" : "default"} size="sm">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-white font-medium text-xs">{formatCurrency(user.balance)}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{user._count?.orders || 0}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isBanned ? "danger" : "success"} size="sm">
                        {user.isBanned ? "Banned" : "Active"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDateTime(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-blue-400 transition-colors" title="View">
                          <Eye size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-amber-400 transition-colors" title="Ban/Unban"
                          onClick={() => setBanTarget(user.id)}
                        >
                          <Ban size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors" title="Delete"
                          onClick={() => setDeleteTarget(user.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { toast.success("User deleted"); setDeleteTarget(null); }}
        title="Delete User"
        message="Are you sure you want to permanently delete this user and all their data? This cannot be undone."
        confirmLabel="Delete User"
        variant="danger"
      />

      <ConfirmModal
        isOpen={!!banTarget}
        onClose={() => setBanTarget(null)}
        onConfirm={() => { toast.success("User banned/unbanned"); setBanTarget(null); }}
        title="Ban / Unban User"
        message="Are you sure you want to change this user's ban status?"
        confirmLabel="Confirm"
        variant="primary"
      />
    </div>
  );
}
