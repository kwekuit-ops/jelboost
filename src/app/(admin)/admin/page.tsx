"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Users, ShoppingBag, DollarSign, TrendingUp, ArrowUpRight, Activity, Clock, CheckCircle2, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

const STATS = [
  { label: "Total Users",     value: "0",      icon: Users,       change: "+0%",  positive: true,  color: "text-blue-400",    bg: "bg-blue-500/10" },
  { label: "Total Orders",    value: "0",      icon: ShoppingBag, change: "+0%",  positive: true,  color: "text-green-400",   bg: "bg-green-500/10" },
  { label: "Total Revenue",   value: "GH₵0",   icon: DollarSign,  change: "+0%",  positive: true,  color: "text-amber-400",   bg: "bg-amber-500/10" },
  { label: "Active Orders",   value: "0",      icon: Activity,    change: "0",    positive: true,  color: "text-purple-400",  bg: "bg-purple-500/10" },
];

const REVENUE_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
  revenue: 0,
  orders:  0,
}));

const RECENT_ORDERS: any[] = [];

const ORDER_STATUS_DIST = [
  { name: "Pending",    value: 0, color: "#f59e0b" },
  { name: "Processing", value: 0, color: "#3b82f6" },
  { name: "Completed",  value: 0, color: "#10b981" },
  { name: "Cancelled",  value: 0, color: "#ef4444" },
];

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

import { Modal } from "@/components/ui/Modal";

export default function AdminDashboard() {
  const [syncing, setSyncing]       = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncError, setSyncError]   = useState<string | null>(null);

  // New Selective Sync state
  const [isModalOpen, setIsModalOpen]           = useState(false);
  const [fetchingServices, setFetchingServices] = useState(false);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set());

  const openSyncModal = async () => {
    setIsModalOpen(true);
    if (availableServices.length > 0) return; // already fetched
    
    setFetchingServices(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/admin/provider-services");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch services");
      setAvailableServices(data.services || []);
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setFetchingServices(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedServiceIds.size === availableServices.length) {
      setSelectedServiceIds(new Set()); // deselect all
    } else {
      setSelectedServiceIds(new Set(availableServices.map((s) => String(s.service)))); // select all
    }
  };

  const toggleServiceSelection = (id: string) => {
    const next = new Set(selectedServiceIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedServiceIds(next);
  };

  const [syncProgress, setSyncProgress] = useState(0);

  const handleSyncSelected = async () => {
    if (selectedServiceIds.size === 0) return;
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    setSyncProgress(0);

    const idsArray = Array.from(selectedServiceIds);
    const chunkSize = 100;
    const totalChunks = Math.ceil(idsArray.length / chunkSize);
    
    let totalCreated = 0;
    let totalUpdated = 0;
    let finalBalance = null;

    try {
      for (let i = 0; i < totalChunks; i++) {
        const chunk = idsArray.slice(i * chunkSize, (i + 1) * chunkSize);
        
        const res = await fetch("/api/admin/sync-provider", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceIds: chunk }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || `Sync failed on chunk ${i + 1}`);
        
        totalCreated += data.created || 0;
        totalUpdated += data.updated || 0;
        if (data.providerBalance) finalBalance = data.providerBalance;

        // Update progress
        setSyncProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      setSyncResult({
        total: idsArray.length,
        created: totalCreated,
        updated: totalUpdated,
        providerBalance: finalBalance
      });
      
      // Close modal after short delay
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
      
    } catch (e: any) {
      setSyncError(e.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <motion.div variants={fade} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </motion.div>

      {/* BoostLegit Provider Panel */}
      <motion.div variants={fade} className="rounded-2xl bg-gray-800/60 border border-gray-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Wifi size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">BoostLegit Provider</p>
              <p className="text-xs text-gray-400">boostlegit.com/api/v2</p>
            </div>
          </div>
          <button
            onClick={openSyncModal}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold transition-all"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : "Sync Services"}
          </button>
        </div>

        {syncResult && (
          <div className="flex flex-wrap gap-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={14} /> Sync complete</span>
            <span className="text-gray-300">Total: <b className="text-white">{syncResult.total}</b></span>
            <span className="text-gray-300">Created: <b className="text-white">{syncResult.created}</b></span>
            <span className="text-gray-300">Updated: <b className="text-white">{syncResult.updated}</b></span>
            {syncResult.providerBalance && (
              <span className="text-gray-300">Provider Balance: <b className="text-amber-400">${syncResult.providerBalance.balance} (USD)</b></span>
            )}
          </div>
        )}

        {syncError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <WifiOff size={14} /> {syncError}
          </div>
        )}

        {!syncResult && !syncError && (
          <p className="text-xs text-gray-500">
            Click <b className="text-gray-400">Sync Services</b> to browse and select which services to import. Prices are auto-converted to GHS and marked up by 50%.
          </p>
        )}
      </motion.div>

      {/* Service Selection Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Select Services to Import" size="xl">
        <div className="flex flex-col h-[60vh]">
          {syncing ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
              <RefreshCw className="animate-spin mb-4 text-emerald-500" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Syncing Services...</h3>
              <p className="text-sm text-gray-400 mb-6">Please keep this window open.</p>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-emerald-400 font-bold">{syncProgress}%</span>
                </div>
                <div className="h-3 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-300 ease-out"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : fetchingServices ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <RefreshCw className="animate-spin mb-3 text-brand-500" size={24} />
              <p>Fetching services from BoostLegit...</p>
            </div>
          ) : syncError && availableServices.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-red-400">
              <AlertCircle size={24} className="mb-2" />
              <p>{syncError}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                <p className="text-sm text-gray-300">
                  <b className="text-white">{selectedServiceIds.size}</b> / {availableServices.length} selected
                </p>
                <div className="flex gap-2">
                  <button onClick={handleSelectAll} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                    {selectedServiceIds.size === availableServices.length ? "Deselect All" : "Select All"}
                  </button>
                  <button 
                    onClick={handleSyncSelected} 
                    disabled={selectedServiceIds.size === 0}
                    className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg text-white"
                  >
                    Import Selected
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-700/50 rounded-xl bg-gray-900/50">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-800 text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3 w-10"></th>
                      <th className="p-3 font-medium">ID</th>
                      <th className="p-3 font-medium">Category</th>
                      <th className="p-3 font-medium w-1/2">Service Name</th>
                      <th className="p-3 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {availableServices.map((svc) => (
                      <tr 
                        key={svc.service} 
                        className={`hover:bg-gray-800/50 cursor-pointer ${selectedServiceIds.has(String(svc.service)) ? "bg-emerald-500/5" : ""}`}
                        onClick={() => toggleServiceSelection(String(svc.service))}
                      >
                        <td className="p-3">
                          <input 
                            type="checkbox" 
                            checked={selectedServiceIds.has(String(svc.service))}
                            onChange={() => {}} // handled by row click
                            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-gray-900" 
                          />
                        </td>
                        <td className="p-3 text-gray-500 text-xs">{svc.service}</td>
                        <td className="p-3 text-gray-400 text-xs max-w-[120px] truncate">{svc.category}</td>
                        <td className="p-3 text-gray-200">{svc.name}</td>
                        <td className="p-3 text-green-400">${svc.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Stats */}
      <motion.div variants={fade} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, change, positive, color, bg }) => (
          <div key={label} className="rounded-2xl bg-gray-800/60 border border-gray-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${positive ? "text-green-400" : "text-red-400"}`}>
                <ArrowUpRight size={11} /> {change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue Area Chart */}
        <motion.div variants={fade} className="lg:col-span-2 bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-5 text-sm">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "12px", color: "#fff" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Orders Bar Chart */}
        <motion.div variants={fade} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="font-semibold text-white mb-5 text-sm">Orders by Status</h3>
          <div className="space-y-3">
            {ORDER_STATUS_DIST.map(({ name, value, color }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{name}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400">Total Orders</p>
            <p className="font-display text-xl font-bold text-white">0</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <motion.div variants={fade} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-700/50">
          <h3 className="font-semibold text-white text-sm">Recent Orders</h3>
          <a href="/admin/orders" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowUpRight size={11} />
          </a>
        </div>
        {RECENT_ORDERS.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-gray-500 text-sm">
            No orders yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-800 text-gray-400 text-xs">
              <tr>
                {["ID","User","Service","Amount","Status","Date"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
          </table>
        )}
      </motion.div>
    </motion.div>
  );
}
