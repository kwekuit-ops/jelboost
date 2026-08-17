"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Wallet, Plus, ArrowDownLeft, ArrowUpRight, TrendingUp,
  Copy, CreditCard, Smartphone, Globe, RefreshCw, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Payment Methods ────────────────────────────────────────────── */
const PAYMENT_METHODS = [
  {
    id: "moolre",
    name: "Mobile Money (Moolre)",
    description: "MTN MoMo, Telecel Cash, AirtelTigo Money & Bank Transfer",
    icon: "🇬🇭",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "crypto",
    name: "Crypto (USDT TRC20)",
    description: "Tether on the Tron network",
    icon: "₮",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
];

/* ─── Types ──────────────────────────────────────────────────────── */
interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  description: string | null;
  createdAt: string;
}

interface WalletBalance {
  balance: number;
  totalSpent: number;
  totalDeposited: number;
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "method" | "crypto">("amount");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txFilter, setTxFilter] = useState<"all" | "deposits" | "payments">("all");

  const [walletData, setWalletData] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const searchParams = useSearchParams();
  const router = useRouter();

  /* ── Handle redirect back from payment gateway ── */
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast.success("Payment received! Your wallet will be credited once confirmed.", { duration: 6000 });
      // Remove the query param without adding history entry
      router.replace("/dashboard/wallet");
    }
  }, [searchParams, router]);

  /* ── Fetch wallet balance ── */
  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet/balance");
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
      }
    } catch {}
  }, []);

  /* ── Fetch transactions ── */
  const fetchTransactions = useCallback(async (filter: string) => {
    try {
      const res = await fetch(`/api/wallet/transactions?filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions ?? []);
      }
    } catch {}
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    setDataLoading(true);
    Promise.all([fetchBalance(), fetchTransactions("all")]).finally(() =>
      setDataLoading(false)
    );
  }, [fetchBalance, fetchTransactions]);

  /* ── Re-fetch on filter change ── */
  useEffect(() => {
    fetchTransactions(txFilter);
  }, [txFilter, fetchTransactions]);

  /* ── Copy TRC20 address ── */
  const handleCopyAddress = () => {
    navigator.clipboard.writeText("TYourTRC20AddressHere");
    toast.success("Address copied!");
  };

  /* ── Open modal fresh ── */
  const openDeposit = () => {
    setStep("amount");
    setAmount("");
    setError(null);
    setDepositOpen(true);
  };

  /* ── Initiate deposit via /api/wallet/deposit ── */
  const handleDeposit = async (methodId: string) => {
    const value = parseFloat(amount);
    if (isNaN(value) || value < 1) {
      setError("Minimum deposit is $1.00");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          paymentMethod: methodId,
          currency: "GHS",
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Deposit initialization failed");

      if (data.paymentUrl) {
        toast.success(`Redirecting to payment…`);
        window.location.href = data.paymentUrl;
      } else if (data.method === "crypto") {
        setStep("crypto");
      } else {
        throw new Error("No payment URL returned from gateway");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your balance and transactions</p>
        </div>
        <Button gradient icon={<Plus size={16} />} onClick={openDeposit}>
          Add Funds
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 relative overflow-hidden rounded-2xl bg-brand-gradient p-6 shadow-brand-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <Wallet size={24} className="text-white/70 mb-3" />
          <p className="text-white/70 text-sm">Current Balance</p>
          {dataLoading ? (
            <div className="h-10 w-24 mt-1 bg-white/20 animate-pulse rounded-lg" />
          ) : (
            <p className="font-display text-4xl font-bold text-white mt-1">
              {formatCurrency(walletData?.balance ?? 0)}
            </p>
          )}
          <Button
            size="sm"
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={openDeposit}
          >
            + Add Funds
          </Button>
        </div>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <ArrowDownLeft size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Deposited</p>
            {dataLoading ? (
              <div className="h-7 w-20 mt-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(walletData?.totalDeposited ?? 0)}
              </p>
            )}
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <ArrowUpRight size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
            {dataLoading ? (
              <div className="h-7 w-20 mt-1 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
            ) : (
              <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(walletData?.totalSpent ?? 0)}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-border dark:border-surface-border-dark">
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <div className="flex gap-2">
            {(["all", "deposits", "payments"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTxFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                  txFilter === f
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600"
                }`}
              >
                {f === "all" ? "All" : f === "deposits" ? "Deposits" : "Payments"}
              </button>
            ))}
          </div>
        </div>

        {dataLoading ? (
          <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <TrendingUp size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No transactions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Add funds to get started</p>
            <Button size="sm" gradient onClick={openDeposit}>
              Add Funds
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === "DEPOSIT"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {tx.type === "DEPOSIT" ? (
                    <ArrowDownLeft size={16} className="text-emerald-600" />
                  ) : (
                    <ArrowUpRight size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {tx.description ?? tx.type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                </div>
                <Badge
                  variant={
                    tx.status === "COMPLETED"
                      ? "success"
                      : tx.status === "PENDING"
                      ? "warning"
                      : "danger"
                  }
                >
                  {tx.status}
                </Badge>
                <p
                  className={`text-sm font-bold ${
                    tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Deposit Modal ── */}
      <Modal isOpen={depositOpen} onClose={() => setDepositOpen(false)} title="Add Funds to Wallet" size="md">

        {/* Step 1 — Enter amount */}
        {step === "amount" && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                Enter Amount (GHS)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">GH₵</span>
                <input
                  id="deposit-amount-input"
                  type="number"
                  min="1"
                  placeholder="50.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[20, 50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="flex-1 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                  >
                    GH₵{v}
                  </button>
                ))}
              </div>
            </div>
            <Button
              fullWidth
              gradient
              size="lg"
              disabled={!amount || parseFloat(amount) < 1}
              onClick={() => setStep("method")}
            >
              Continue — GH₵{parseFloat(amount || "0").toFixed(2)}
            </Button>
          </div>
        )}

        {/* Step 2 — Choose payment method */}
        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Depositing{" "}
              <span className="font-bold text-gray-900 dark:text-white">GH₵{amount}</span> — Select payment method
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  disabled={loading}
                  onClick={() => handleDeposit(pm.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-surface-border dark:border-surface-border-dark hover:border-brand-400 dark:hover:border-brand-500 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl ${pm.bg}`}>
                    {loading ? (
                      <RefreshCw size={20} className={`animate-spin ${pm.color}`} />
                    ) : (
                      pm.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{pm.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pm.description}</p>
                  </div>
                  <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setStep("amount"); setError(null); }}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-center py-1 transition-colors"
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step 3 — Crypto address */}
        {step === "crypto" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <span className="text-3xl">₮</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">Send USDT (TRC20)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send exactly{" "}
                <span className="font-bold text-gray-900 dark:text-white">{amount} USDT</span> to the address below
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-surface-border dark:border-surface-border-dark">
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">TYourTRC20AddressHere</p>
            </div>
            <Button variant="outline" size="sm" icon={<Copy size={14} />} onClick={handleCopyAddress}>
              Copy Address
            </Button>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl">
              ⚠️ Only send USDT on the Tron (TRC20) network. After payment, open a support ticket for manual confirmation.
            </p>
            <button
              onClick={() => setStep("method")}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-center py-1 transition-colors"
            >
              ← Choose different method
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
