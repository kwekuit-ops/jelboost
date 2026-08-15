"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Bell, Globe, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

const profileSchema = z.object({
  name:  z.string().min(2),
  email: z.string().email(),
});
const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type ProfileForm  = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const TABS = ["Profile", "Password", "Notifications", "Preferences"];

export default function ProfilePage() {
  const { data: session } = useSession();
  const [tab, setTab] = useState("Profile");
  const [emailNotif, setEmailNotif]  = useState(true);
  const [smsNotif, setSmsNotif]      = useState(false);
  const [pushNotif, setPushNotif]    = useState(true);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: session?.user?.name || "", email: session?.user?.email || "" },
  });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await fetch("/api/user/profile", { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Profile updated!");
    } catch { toast.error("Failed to update profile"); }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await fetch("/api/user/password", { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Password changed successfully!");
      passwordForm.reset();
    } catch { toast.error("Failed to change password"); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage your profile and preferences</p>
      </div>

      {/* Avatar */}
      <Card padding="md" className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl font-bold shadow-brand">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-surface-border dark:border-surface-border-dark flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
            <Camera size={13} className="text-gray-500" />
          </button>
        </div>
        <div>
          <p className="font-display font-bold text-gray-900 dark:text-white text-lg">{session?.user?.name || "User"}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
          <p className="text-xs text-brand-500 font-medium mt-0.5">Free Account</p>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "Profile" && (
        <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5">
              <Input label="Full Name" leftIcon={<User size={16} />} error={profileForm.formState.errors.name?.message} {...profileForm.register("name")} />
              <Input label="Email Address" type="email" leftIcon={<Mail size={16} />} error={profileForm.formState.errors.email?.message} {...profileForm.register("email")} />
              <Button type="submit" gradient icon={<Save size={16} />} loading={profileForm.formState.isSubmitting}>
                Save Changes
              </Button>
            </form>
          </Card>
        </motion.div>
      )}

      {tab === "Password" && (
        <motion.div key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg">
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <Input label="Current Password" type="password" leftIcon={<Lock size={16} />} error={passwordForm.formState.errors.currentPassword?.message} required {...passwordForm.register("currentPassword")} />
              <Input label="New Password" type="password" leftIcon={<Lock size={16} />} error={passwordForm.formState.errors.newPassword?.message} hint="Minimum 8 characters" required {...passwordForm.register("newPassword")} />
              <Input label="Confirm New Password" type="password" leftIcon={<Lock size={16} />} error={passwordForm.formState.errors.confirmPassword?.message} required {...passwordForm.register("confirmPassword")} />
              <Button type="submit" gradient loading={passwordForm.formState.isSubmitting}>
                Change Password
              </Button>
            </form>
          </Card>
        </motion.div>
      )}

      {tab === "Notifications" && (
        <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="space-y-5">
            {[
              { label: "Email Notifications",  desc: "Order updates, deposits, news",          state: emailNotif, setState: setEmailNotif },
              { label: "SMS Notifications",    desc: "Critical alerts via SMS",                state: smsNotif,   setState: setSmsNotif },
              { label: "Push Notifications",   desc: "Browser push notifications",             state: pushNotif,  setState: setPushNotif },
            ].map(({ label, desc, state, setState }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-surface-border dark:border-surface-border-dark last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                </div>
                <button
                  onClick={() => setState(!state)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${state ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  aria-checked={state}
                  role="switch"
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${state ? "translate-x-5" : ""}`} />
                </button>
              </div>
            ))}
            <Button gradient icon={<Save size={16} />} onClick={() => toast.success("Notification preferences saved!")}>
              Save Preferences
            </Button>
          </Card>
        </motion.div>
      )}

      {tab === "Preferences" && (
        <motion.div key="prefs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="lg" className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Preferred Language</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="tw">Twi</option>
                <option value="ga">Ga</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Preferred Currency</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="USD">USD ($)</option>
                <option value="GHS">GHS (₵)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <Button gradient icon={<Save size={16} />} onClick={() => toast.success("Preferences saved!")}>
              Save Preferences
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
