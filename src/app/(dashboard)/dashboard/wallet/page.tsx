"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDateTime, PAYMENT_METHODS } from "@/lib/utils";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, TrendingUp, Copy } from "lucide-react";
import toast from "react-hot-toast";

const TRANSACTIONS: any[] = [];

export default function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [step, setStep] = useState<"amount" | "method" | "crypto">("amount");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("TYourTRC20AddressHere");
    toast.success("Address copied!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your balance and transactions</p>
        </div>
        <Button gradient icon={<Plus size={16} />} onClick={() => { setDepositOpen(true); setStep("amount"); }}>
          Add Funds
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1 relative overflow-hidden rounded-2xl bg-brand-gradient p-6 shadow-brand-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <Wallet size={24} className="text-white/70 mb-3" />
          <p className="text-white/70 text-sm">Current Balance</p>
          <p className="font-display text-4xl font-bold text-white mt-1">$0.00</p>
          <Button
            size="sm"
            className="mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => { setDepositOpen(true); setStep("amount"); }}
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
            <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
          </div>
        </Card>

        <Card padding="md" className="flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <ArrowUpRight size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
            <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
          </div>
        </Card>
      </div>

      {/* Transaction History */}
      <Card padding="none" className="overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-border dark:border-surface-border-dark">
          <h2 className="font-display font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <div className="flex gap-2">
            {["All", "Deposits", "Payments"].map((f) => (
              <button key={f} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-brand-100 dark:hover:bg-brand-900/30 hover:text-brand-600 transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>
        {TRANSACTIONS.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center px-6">
            <TrendingUp size={32} className="text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium text-gray-700 dark:text-gray-300">No transactions yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Add funds to get started</p>
            <Button size="sm" gradient onClick={() => { setDepositOpen(true); setStep("amount"); }}>
              Add Funds
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-6 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === "DEPOSIT" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                  {tx.type === "DEPOSIT" ? <ArrowDownLeft size={16} className="text-emerald-600" /> : <ArrowUpRight size={16} className="text-red-500" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                </div>
                <Badge variant={tx.status === "COMPLETED" ? "success" : tx.status === "PENDING" ? "warning" : "danger"}>
                  {tx.status}
                </Badge>
                <p className={`text-sm font-bold ${tx.type === "DEPOSIT" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Deposit Modal */}
      <Modal isOpen={depositOpen} onClose={() => setDepositOpen(false)} title="Add Funds to Wallet" size="md">
        {step === "amount" && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                Enter Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input
                  type="number"
                  min="1"
                  placeholder="10.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex gap-2 mt-3">
                {[5, 10, 20, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className="flex-1 py-2 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                  >
                    ${v}
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
              Continue — ${parseFloat(amount || "0").toFixed(2)}
            </Button>
          </div>
        )}

        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Depositing <span className="font-bold text-gray-900 dark:text-white">${amount}</span> — Select payment method</p>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setMethod(pm.id);
                    if (pm.id === "crypto") setStep("crypto");
                    else toast.success(`Redirecting to ${pm.name}...`);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-surface-border dark:border-surface-border-dark hover:border-brand-400 dark:hover:border-brand-500 transition-all group text-left"
                >
                  <span className="text-2xl">{pm.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{pm.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{pm.description}</p>
                  </div>
                  <span className="text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "crypto" && (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
              <span className="text-3xl">₮</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">Send USDT (TRC20)</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send exactly <span className="font-bold text-gray-900 dark:text-white">{amount} USDT</span> to the address below</p>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
