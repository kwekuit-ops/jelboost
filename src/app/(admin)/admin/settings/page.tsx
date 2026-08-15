"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Save, Globe, Bell, CreditCard, Mail, Zap, Shield } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const generalSchema = z.object({
  siteName:           z.string().min(1),
  siteUrl:            z.string().url(),
  siteEmail:          z.string().email(),
  supportEmail:       z.string().email(),
  maintenanceMode:    z.boolean().default(false),
  registrationEnabled: z.boolean().default(true),
  defaultCurrency:    z.string().default("USD"),
  referralCommission: z.coerce.number().min(0).max(100),
  welcomeBonus:       z.coerce.number().min(0),
  minimumDeposit:     z.coerce.number().min(0),
});
type GeneralForm = z.infer<typeof generalSchema>;

const TABS = [
  { id: "general",    label: "General",     icon: Globe },
  { id: "payment",    label: "Payment",     icon: CreditCard },
  { id: "email",      label: "Email",       icon: Mail },
  { id: "security",   label: "Security",    icon: Shield },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState("general");
  const [maintenance, setMaintenance] = useState(false);
  const [registration, setRegistration] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      siteName:            "Jelboost GH",
      siteUrl:             "https://jelboostgh.com",
      siteEmail:           "info@jelboostgh.com",
      supportEmail:        "support@jelboostgh.com",
      defaultCurrency:     "USD",
      referralCommission:  5,
      welcomeBonus:        0,
      minimumDeposit:      5,
    },
  });

  const onSave = async (data: GeneralForm) => {
    try {
      await fetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save settings"); }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-xl font-bold text-white">Site Settings</h1>
        <p className="text-gray-400 text-sm">Configure your Jelboost GH platform</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 rounded-xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === id
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <form onSubmit={handleSubmit(onSave)} className="space-y-5">
            <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-white text-sm">Site Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Site Name" {...register("siteName")} error={errors.siteName?.message} />
                <Input label="Site URL" type="url" {...register("siteUrl")} error={errors.siteUrl?.message} />
                <Input label="Main Email" type="email" {...register("siteEmail")} />
                <Input label="Support Email" type="email" {...register("supportEmail")} />
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <p className="text-sm font-medium text-white">Maintenance Mode</p>
                  <p className="text-xs text-gray-400">Show maintenance page to visitors</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenance(!maintenance)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${maintenance ? "bg-amber-500" : "bg-gray-600"}`}
                  role="switch"
                  aria-checked={maintenance}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${maintenance ? "translate-x-5" : ""}`} />
                </button>
              </div>

              <div className="flex items-center justify-between py-2 border-t border-gray-700">
                <div>
                  <p className="text-sm font-medium text-white">New Registrations</p>
                  <p className="text-xs text-gray-400">Allow new users to register</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRegistration(!registration)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${registration ? "bg-brand-500" : "bg-gray-600"}`}
                  role="switch"
                  aria-checked={registration}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${registration ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 space-y-5">
              <h3 className="font-semibold text-white text-sm">Business Settings</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="Referral Commission (%)" type="number" step="0.1" {...register("referralCommission")} />
                <Input label="Welcome Bonus ($)" type="number" step="0.01" {...register("welcomeBonus")} />
                <Input label="Minimum Deposit ($)" type="number" step="0.01" {...register("minimumDeposit")} />
              </div>
            </div>

            <Button type="submit" gradient icon={<Save size={16} />} loading={isSubmitting}>
              Save Changes
            </Button>
          </form>
        </motion.div>
      )}

      {tab === "payment" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-white text-sm">Payment Gateway Configuration</h3>
          <p className="text-xs text-gray-400">Set your API keys in the .env file. Changes here are for display only.</p>
          {[
            { name: "Paystack",    key: "PAYSTACK_SECRET_KEY",   env: "PAYSTACK_PUBLIC_KEY" },
            { name: "Flutterwave", key: "FLUTTERWAVE_SECRET_KEY", env: "FLW_PUBLIC_KEY" },
            { name: "Stripe",      key: "STRIPE_SECRET_KEY",      env: "STRIPE_PUBLIC_KEY" },
          ].map(({ name, key, env }) => (
            <div key={name} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
              <div>
                <p className="text-sm font-medium text-white">{name}</p>
                <p className="text-xs text-gray-500 font-mono">{key}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-600 rounded-full" />
                <span className="text-xs text-gray-500">Not configured</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {["email","security"].includes(tab) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-10 text-center">
          <Zap size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Coming Soon</p>
          <p className="text-xs text-gray-500 mt-1">This settings section will be available in the next update</p>
        </motion.div>
      )}
    </div>
  );
}
