"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import toast from "react-hot-toast";

const schema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  subject: z.string().min(4),
  message: z.string().min(20),
});
type ContactForm = z.infer<typeof schema>;

const INFO = [
  { icon: Mail,    label: "Email",          value: "support@jelboostgh.com" },
  { icon: Phone,   label: "WhatsApp",       value: "+233 XX XXX XXXX" },
  { icon: MapPin,  label: "Location",       value: "Accra, Ghana 🇬🇭" },
  { icon: Clock,   label: "Support Hours",  value: "24/7 — We're always available" },
];

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ContactForm) => {
    try {
      await fetch("/api/contact", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Message sent! We'll get back to you within 24 hours.");
      reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="pt-28 pb-20 bg-brand-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-5xl font-bold text-white mb-4">Get In Touch</h1>
            <p className="text-white/70 text-lg">Have a question or need help? We&apos;re here 24/7 to assist you.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-5 mb-10">
                {INFO.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/50 flex items-center justify-center shrink-0">
                      <Icon size={20} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
                      <p className="text-gray-900 dark:text-white font-medium text-sm">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Chat CTA */}
              <div className="bg-brand-gradient rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle size={24} />
                  <h3 className="font-display font-bold text-lg">Live Chat</h3>
                </div>
                <p className="text-white/80 text-sm mb-4">Get instant answers via our live chat. Click below to start chatting now!</p>
                <button className="bg-white text-brand-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Start Live Chat
                </button>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-white dark:bg-surface-card-dark rounded-3xl border border-surface-border dark:border-surface-border-dark p-8 shadow-card dark:shadow-card-dark">
                <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Your Name" placeholder="John Doe" error={errors.name?.message} required {...register("name")} />
                    <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} required {...register("email")} />
                  </div>
                  <Input label="Subject" placeholder="What&apos;s this about?" error={errors.subject?.message} required {...register("subject")} />
                  <Textarea label="Message" placeholder="Describe your issue or question in detail..." error={errors.message?.message} required {...register("message")} />
                  <Button type="submit" fullWidth gradient size="lg" loading={isSubmitting} icon={<Send size={16} />}>
                    Send Message
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
