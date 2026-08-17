"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Link as LinkIcon, Hash, Info, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, calculateOrderPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import axios from "axios";

const schema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  link:      z.string().url("Please enter a valid URL").min(1, "Link is required"),
  quantity:  z.coerce.number().min(1, "Quantity is required"),
  coupon:    z.string().optional(),
});
type OrderForm = z.infer<typeof schema>;

export default function NewOrderPage() {
  const [couponValid, setCouponValid] = useState<null | boolean>(null);
  const [discount, setDiscount] = useState(0);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get("/api/services");
        setServices(data.services || []);
      } catch (err) {
        toast.error("Failed to load services");
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<OrderForm>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1000 },
  });

  const serviceId = watch("serviceId");
  const quantity  = watch("quantity");

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId, services]
  );

  const totalPrice = useMemo(() => {
    if (!selectedService || !quantity) return 0;
    const base = calculateOrderPrice(selectedService.pricePerThousand, quantity);
    return base * (1 - discount / 100);
  }, [selectedService, quantity, discount]);

  const quantityError = useMemo(() => {
    if (!selectedService || !quantity) return null;
    if (quantity < selectedService.minQuantity) return `Minimum is ${selectedService.minQuantity.toLocaleString()}`;
    if (quantity > selectedService.maxQuantity) return `Maximum is ${selectedService.maxQuantity.toLocaleString()}`;
    return null;
  }, [selectedService, quantity]);

  const onSubmit = async (data: OrderForm) => {
    if (quantityError) { toast.error(quantityError); return; }
    try {
      await axios.post("/api/orders", { ...data, totalPrice });
      toast.success("Order placed successfully! 🎉");
      router.push("/dashboard/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to place order");
    }
  };

  const validateCoupon = async () => {
    const coupon = watch("coupon");
    if (!coupon) return;
    try {
      const { data } = await axios.post("/api/coupons/validate", { code: coupon });
      setCouponValid(true);
      setDiscount(data.discountValue);
      toast.success(`Coupon applied! ${data.discountValue}% off`);
    } catch {
      setCouponValid(false);
      toast.error("Invalid coupon code");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Place New Order</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a service after funding your wallet</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50/70 dark:border-brand-800 dark:bg-brand-950/30 px-4 py-3.5">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand">
              <Wallet size={17} />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">Fund your wallet first</p>
              <p className="text-xs text-brand-700 dark:text-brand-300 mt-0.5">Orders are placed only when your available balance covers the total.</p>
            </div>
          </div>
          <Link href="/dashboard/wallet" className="shrink-0">
            <Button size="sm" gradient>Deposit funds</Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <Card className="lg:col-span-3" padding="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Service */}
              <Select
                label="Select Service"
                placeholder={loadingServices ? "Loading services..." : "-- Choose a service --"}
                options={services.map((s) => ({ value: s.id, label: `${s.platform || s.category?.name || 'Service'} — ${s.name}` }))}
                error={errors.serviceId?.message}
                required
                {...register("serviceId")}
              />

              {/* Link */}
              <Input
                label="Social Media Link"
                type="url"
                placeholder="https://www.tiktok.com/@yourprofile"
                leftIcon={<LinkIcon size={16} />}
                error={errors.link?.message}
                hint="Enter the direct link to your post, video, or profile"
                required
                {...register("link")}
              />

              {/* Quantity */}
              <Input
                label="Quantity"
                type="number"
                leftIcon={<Hash size={16} />}
                error={errors.quantity?.message || quantityError || undefined}
                hint={selectedService ? `Min: ${selectedService.minQuantity.toLocaleString()} — Max: ${selectedService.maxQuantity.toLocaleString()}` : undefined}
                required
                {...register("quantity")}
              />

              {/* Coupon */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                  Coupon Code <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    className="flex-1 rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    {...register("coupon")}
                  />
                  <Button type="button" variant="outline" size="md" onClick={validateCoupon}>
                    Apply
                  </Button>
                </div>
                {couponValid === true  && <p className="text-xs text-emerald-500 mt-1">✓ Coupon applied — {discount}% discount</p>}
                {couponValid === false && <p className="text-xs text-red-500 mt-1">✗ Invalid coupon code</p>}
              </div>

              <Button type="submit" fullWidth size="lg" gradient loading={isSubmitting} icon={<Zap size={18} />}>
                Place Order — {formatCurrency(totalPrice)}
              </Button>
            </form>
          </Card>

          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Card padding="md">
              <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              {selectedService ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Service</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right max-w-[140px] text-xs">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Price / 1K</span>
                    <span className="font-medium">{formatCurrency(selectedService.pricePerThousand)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Quantity</span>
                    <span className="font-medium">{(quantity || 0).toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-emerald-500 font-medium">-{discount}%</span>
                    </div>
                  )}
                  <div className="border-t border-surface-border dark:border-surface-border-dark pt-3 flex justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400 text-lg">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Select a service to see pricing</p>
              )}
            </Card>

            <Card padding="md" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p className="font-semibold">Order Tips</p>
                  <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                    <li>• Make sure your account is public</li>
                    <li>• Double-check your link before ordering</li>
                    <li>• Delivery starts within minutes</li>
                    <li>• 30-day refill guarantee included</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
