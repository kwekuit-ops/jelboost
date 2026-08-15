"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { formatDateTime } from "@/lib/utils";

const schema = z.object({
  subject: z.string().min(5),
  message: z.string().min(20),
  priority: z.enum(["LOW","MEDIUM","HIGH"]),
});
type TicketForm = z.infer<typeof schema>;

const TICKETS: any[] = [];

export default function TicketsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TicketForm>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM" },
  });

  const onSubmit = async (data: TicketForm) => {
    try {
      await fetch("/api/tickets", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Ticket created! We'll respond within 24 hours.");
      reset();
      setCreateOpen(false);
    } catch { toast.error("Failed to create ticket"); }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Get help from our support team</p>
        </div>
        <Button gradient icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Ticket
        </Button>
      </div>

      {/* Quick Support Options */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, label: "Live Chat", desc: "Chat with us now", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", action: () => toast("Live chat coming soon!") },
          { icon: Clock, label: "Avg Response", desc: "Under 2 hours", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", action: undefined },
          { icon: CheckCircle2, label: "Resolution Rate", desc: "99% resolved", color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-900/20", action: undefined },
        ].map(({ icon: Icon, label, desc, color, bg, action }) => (
          <button
            key={label}
            onClick={action}
            className={`flex items-center gap-4 p-4 rounded-2xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-left ${action ? "hover:border-brand-300 cursor-pointer" : "cursor-default"} transition-colors`}
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {TICKETS.length === 0 ? (
        <Card padding="none" className="overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <MessageCircle size={24} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">No tickets yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Create a ticket if you need help with your orders or account</p>
            <Button gradient icon={<Plus size={15} />} onClick={() => setCreateOpen(true)}>
              Open Support Ticket
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {TICKETS.map((ticket) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedTicket(ticket)}
              className="flex items-center gap-4 p-4 bg-white dark:bg-surface-card-dark rounded-2xl border border-surface-border dark:border-surface-border-dark cursor-pointer hover:border-brand-300 dark:hover:border-brand-600 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{ticket.subject}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(ticket.createdAt)}</p>
              </div>
              <Badge variant={ticket.priority === "HIGH" ? "danger" : ticket.priority === "MEDIUM" ? "warning" : "default"} size="sm">
                {ticket.priority}
              </Badge>
              <Badge variant={ticket.status === "OPEN" ? "info" : ticket.status === "RESOLVED" ? "success" : "default"} size="sm">
                {ticket.status}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Ticket Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Support Ticket" description="Describe your issue and we'll get back to you within 2 hours." size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Subject" placeholder="e.g., Order not delivered" error={errors.subject?.message} required {...register("subject")} />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Priority</label>
            <select className="w-full px-4 py-2.5 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" {...register("priority")}>
              <option value="LOW">Low — General inquiry</option>
              <option value="MEDIUM">Medium — Need assistance</option>
              <option value="HIGH">High — Urgent issue</option>
            </select>
          </div>
          <Textarea label="Message" placeholder="Describe your issue in detail. Include order IDs if relevant..." error={errors.message?.message} required {...register("message")} />
          <Button type="submit" fullWidth gradient icon={<Send size={15} />} loading={isSubmitting}>
            Submit Ticket
          </Button>
        </form>
      </Modal>
    </div>
  );
}
