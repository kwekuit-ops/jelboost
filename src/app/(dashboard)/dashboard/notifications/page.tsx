"use client";

import { motion } from "framer-motion";
import { Bell, CheckCheck, Package, CreditCard, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";

const NOTIFICATIONS: any[] = [];

const TYPE_ICONS: Record<string, any> = {
  order:   { icon: Package,     color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  payment: { icon: CreditCard,  color: "text-green-500",   bg: "bg-green-50 dark:bg-green-900/20" },
  system:  { icon: Info,        color: "text-brand-500",   bg: "bg-brand-50 dark:bg-brand-900/20" },
  promo:   { icon: AlertCircle, color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
};

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Stay updated on your orders and account activity</p>
        </div>
        {NOTIFICATIONS.length > 0 && (
          <Button variant="ghost" size="sm" icon={<CheckCheck size={15} />}>
            Mark all read
          </Button>
        )}
      </div>

      <Card padding="none" className="overflow-hidden">
        {NOTIFICATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">No notifications yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You&apos;ll see order updates, payment confirmations, and more here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border dark:divide-surface-border-dark">
            {NOTIFICATIONS.map((notif, i) => {
              const typeConfig = TYPE_ICONS[notif.type] || TYPE_ICONS.system;
              const Icon = typeConfig.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer ${!notif.isRead ? "bg-brand-50/50 dark:bg-brand-950/20" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={typeConfig.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{notif.title}</p>
                      {!notif.isRead && <div className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDateTime(notif.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
