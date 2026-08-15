"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Edit, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const schema = z.object({
  code:          z.string().min(3).toUpperCase(),
  description:   z.string().optional(),
  discountType:  z.enum(["percentage","fixed"]),
  discountValue: z.coerce.number().positive(),
  maxUses:       z.coerce.number().int().optional(),
  expiresAt:     z.string().optional(),
});
type CouponForm = z.infer<typeof schema>;

const COUPONS: any[] = [];

export default function AdminCouponsPage() {
  const [addOpen, setAddOpen]     = useState(false);
  const [deleteTarget, setDelete] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<CouponForm>({
    resolver: zodResolver(schema),
    defaultValues: { discountType: "percentage" },
  });

  const discountType = watch("discountType");

  const onSubmit = async (data: CouponForm) => {
    try {
      await fetch("/api/admin/coupons", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Coupon created!");
      setAddOpen(false);
      reset();
    } catch { toast.error("Failed to create coupon"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Coupons</h1>
          <p className="text-gray-400 text-sm">Create and manage promotional coupon codes</p>
        </div>
        <Button gradient size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Create Coupon
        </Button>
      </div>

      <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                {["Code","Discount","Uses","Expires","Status","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-gray-400 uppercase text-[10px] tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {COUPONS.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <Tag size={28} className="text-gray-600" />
                      <p>No coupons yet — create your first one!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                COUPONS.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-amber-400 font-bold">{coupon.code}</td>
                    <td className="px-4 py-3 text-gray-200">
                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : formatCurrency(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {coupon.usedCount}/{coupon.maxUses || "∞"}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.isActive ? "success" : "default"} size="sm">
                        {coupon.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDelete(coupon.id)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create Coupon Code" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Coupon Code" placeholder="e.g., SAVE20" error={errors.code?.message} required {...register("code")} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Discount Type</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" {...register("discountType")}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <Input
              label={discountType === "percentage" ? "Discount %" : "Discount Amount ($)"}
              type="number" step="0.01"
              placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 5"}
              error={errors.discountValue?.message}
              required
              {...register("discountValue")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max Uses (optional)" type="number" placeholder="e.g., 100" {...register("maxUses")} />
            <Input label="Expires At (optional)" type="date" {...register("expiresAt")} />
          </div>
          <Input label="Description (optional)" placeholder="e.g., Welcome discount for new users" {...register("description")} />
          <Button type="submit" fullWidth gradient loading={isSubmitting}>Create Coupon</Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDelete(null)}
        onConfirm={() => { toast.success("Coupon deleted"); setDelete(null); }}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon code? This cannot be undone."
        variant="danger"
      />
    </div>
  );
}
