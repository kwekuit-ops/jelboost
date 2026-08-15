"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wallet, CreditCard, Bitcoin, AlertCircle, RefreshCw } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "moolre", name: "Mobile Money (Moolre)", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", description: "MTN, Telecel, AT & Bank Transfer" },
  { id: "stripe",   name: "Stripe",   icon: CreditCard, color: "text-indigo-500",  bg: "bg-indigo-500/10",  border: "border-indigo-500/20",  description: "International Cards, Apple Pay, Google Pay", disabled: true },
  { id: "crypto",   name: "Crypto",   icon: Bitcoin,    color: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   description: "BTC, ETH, USDT, LTC", disabled: true },
];

export default function AddFundsPage() {
  const [amount, setAmount] = useState<string>("50");
  const [selectedMethod, setSelectedMethod] = useState<string>("moolre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value < 5) {
      setError("Minimum deposit is $5.00");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/payments/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, method: selectedMethod })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Deposit initialization failed");
      
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center">
          <Wallet className="text-brand-500" size={24} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Add Funds</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Deposit money into your wallet to place orders instantly.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        <Card className="md:col-span-3 p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Deposit Amount (GHS)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-lg">GH₵</span>
              <input
                type="number"
                min="5"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                placeholder="50.00"
              />
            </div>
            
            <div className="flex gap-2 mt-3">
              {[50, 100, 200, 500, 1000].map(val => (
                <button
                  key={val}
                  onClick={() => setAmount(val.toString())}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  GH₵{val}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Select Payment Method</label>
            <div className="grid gap-3">
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <div
                    key={method.id}
                    onClick={() => !method.disabled && setSelectedMethod(method.id)}
                    className={`
                      relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4
                      ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700'}
                      ${method.disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    `}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${method.bg} ${method.border}`}>
                      <Icon size={24} className={method.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-bold ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'}`}>
                          {method.name}
                        </p>
                        {method.disabled && <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">Coming Soon</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{method.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={18} shrink-0 />
              <p>{error}</p>
            </div>
          )}

          <Button 
            gradient 
            className="w-full py-4 text-lg" 
            onClick={handleDeposit} 
            disabled={loading || !amount}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin" size={20} /> Processing...
              </span>
            ) : (
              `Pay $${parseFloat(amount || "0").toFixed(2)} securely`
            )}
          </Button>
        </Card>

        {/* Info Sidebar */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5 bg-gradient-to-br from-brand-500 to-brand-700 border-none text-white shadow-brand">
            <h3 className="font-bold text-lg mb-2">Secure Payments</h3>
            <p className="text-brand-100 text-sm leading-relaxed mb-4">
              All transactions are securely processed via 256-bit encryption. Your payment details are never stored on our servers.
            </p>
            <div className="flex gap-2">
              <div className="w-10 h-6 bg-white/20 rounded backdrop-blur flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="w-10 h-6 bg-white/20 rounded backdrop-blur flex items-center justify-center text-xs font-bold">MC</div>
              <div className="w-10 h-6 bg-white/20 rounded backdrop-blur flex items-center justify-center text-xs font-bold">PAY</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
