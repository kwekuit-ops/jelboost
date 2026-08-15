"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { Badge, QualityBadge } from "@/components/ui/Badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = z.object({
  name:             z.string().min(3),
  platform:         z.string().min(1),
  pricePerThousand: z.coerce.number().positive(),
  minQuantity:      z.coerce.number().int().positive(),
  maxQuantity:      z.coerce.number().int().positive(),
  estimatedDays:    z.string().optional(),
  qualityBadge:     z.string().optional(),
});
type ServiceForm = z.infer<typeof schema>;

const SERVICES: any[] = [];

const PLATFORM_OPTIONS = [
  { value: "tiktok",    label: "TikTok" },
  { value: "youtube",   label: "YouTube" },
  { value: "facebook",  label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter",   label: "X (Twitter)" },
  { value: "telegram",  label: "Telegram" },
];

const QUALITY_OPTIONS = [
  { value: "Instant",      label: "Instant" },
  { value: "High Quality", label: "High Quality" },
  { value: "Premium",      label: "Premium" },
  { value: "Standard",     label: "Standard" },
];

export default function AdminServicesPage() {
  const [search, setSearch]       = useState("");
  const [addOpen, setAddOpen]     = useState(false);
  const [editTarget, setEdit]     = useState<any | null>(null);
  const [deleteTarget, setDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ServiceForm) => {
    try {
      await fetch("/api/admin/services", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Service created!");
      setAddOpen(false);
      reset();
    } catch { toast.error("Failed to create service"); }
  };

  const filtered = SERVICES.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Services Management</h1>
          <p className="text-gray-400 text-sm">Add, edit, and manage your SMM services</p>
        </div>
        <Button gradient size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text" placeholder="Search services..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                {["Name","Platform","Price/1K","Min","Max","Quality","Status","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-gray-500">
                    No services yet — add your first service or sync from an API provider
                  </td>
                </tr>
              ) : (
                filtered.map((svc) => (
                  <tr key={svc.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-gray-200 font-medium max-w-[180px] truncate">{svc.name}</td>
                    <td className="px-4 py-3 text-gray-400 capitalize">{svc.platform}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold">{formatCurrency(svc.pricePerThousand)}</td>
                    <td className="px-4 py-3 text-gray-400">{svc.minQuantity?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400">{svc.maxQuantity?.toLocaleString()}</td>
                    <td className="px-4 py-3">{svc.qualityBadge && <QualityBadge quality={svc.qualityBadge} />}</td>
                    <td className="px-4 py-3">
                      <Badge variant={svc.isActive ? "success" : "default"} size="sm">{svc.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEdit(svc)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-400"><Edit size={12} /></button>
                        <button onClick={() => setDelete(svc.id)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Service" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input label="Service Name" placeholder="e.g., TikTok Followers — High Quality" error={errors.name?.message} required {...register("name")} />
          </div>
          <Select label="Platform" placeholder="Select platform" options={PLATFORM_OPTIONS} error={errors.platform?.message} required {...register("platform")} />
          <Input label="Price per 1,000" type="number" step="0.01" placeholder="e.g., 2.50" error={errors.pricePerThousand?.message} required {...register("pricePerThousand")} />
          <Input label="Min Quantity" type="number" placeholder="e.g., 100" error={errors.minQuantity?.message} required {...register("minQuantity")} />
          <Input label="Max Quantity" type="number" placeholder="e.g., 1000000" error={errors.maxQuantity?.message} required {...register("maxQuantity")} />
          <Input label="Estimated Delivery" placeholder="e.g., 1-6 hours" {...register("estimatedDays")} />
          <Select label="Quality Badge" placeholder="Select quality" options={QUALITY_OPTIONS} {...register("qualityBadge")} />
          <div className="sm:col-span-2">
            <Button type="submit" fullWidth gradient loading={isSubmitting}>Add Service</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => { toast.success("Service deleted"); setDelete(null); }}
        title="Delete Service"
        message="Deleting this service will prevent new orders. Existing orders won't be affected."
        variant="danger"
      />
    </div>
  );
}
