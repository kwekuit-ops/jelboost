"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import axios from "axios";

const apiSchema = z.object({
  name:   z.string().min(2),
  apiUrl: z.string().url("Invalid API URL"),
  apiKey: z.string().min(4),
  description: z.string().optional(),
});
type ApiForm = z.infer<typeof apiSchema>;

const PROVIDERS: any[] = [];

export default function AdminApiProvidersPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<any[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ApiForm>({
    resolver: zodResolver(apiSchema),
  });

  const onSubmit = async (data: ApiForm) => {
    try {
      await axios.post("/api/admin/providers", { ...data, action: "create" });
      toast.success("API Provider added!");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add provider");
    }
  };

  const fetchServices = async (apiUrl: string, apiKey: string) => {
    setFetchLoading(true);
    try {
      const { data } = await axios.post("/api/admin/providers", { action: "fetch_services", apiUrl, apiKey });
      setFetchedServices(data.services || []);
      toast.success(`Fetched ${data.services?.length || 0} services`);
    } catch {
      toast.error("Failed to fetch services from provider");
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">API Providers</h1>
          <p className="text-gray-400 text-sm">Connect third-party SMM API providers to auto-fulfil orders</p>
        </div>
        <Button gradient size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          Add Provider
        </Button>
      </div>

      {/* How it works */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Globe size={18} className="text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-300 mb-1">How API Integration Works</p>
            <ul className="text-blue-400/80 space-y-1 text-xs">
              <li>1. Add your SMM provider (e.g., justanotherpanel, peakerr, etc.)</li>
              <li>2. Fetch available services automatically</li>
              <li>3. Enable auto-fulfillment — orders are placed on the provider automatically</li>
              <li>4. Order status syncs in real time</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Providers List */}
      {PROVIDERS.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <Globe size={36} className="text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No API providers yet</p>
          <p className="text-gray-500 text-sm mb-5">Add your first SMM provider to start auto-fulfilling orders</p>
          <Button size="sm" gradient icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
            Add First Provider
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {PROVIDERS.map((provider) => (
            <div key={provider.id} className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{provider.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{provider.apiUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={provider.isActive ? "success" : "default"}>
                    {provider.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm" variant="outline"
                    icon={<RefreshCw size={12} />}
                    loading={fetchLoading}
                    onClick={() => fetchServices(provider.apiUrl, provider.apiKey)}
                    className="border-gray-600 text-gray-300"
                  >
                    Sync Services
                  </Button>
                  <button
                    onClick={() => setDeleteTarget(provider.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fetched Services Preview */}
      {fetchedServices.length > 0 && (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="font-semibold text-white text-sm">Fetched Services ({fetchedServices.length})</h3>
            <Button size="sm" gradient>Import All</Button>
          </div>
          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-xs">
              <thead className="bg-gray-800 text-gray-400">
                <tr>
                  {["ID","Name","Category","Rate","Min","Max"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetchedServices.slice(0, 50).map((svc: any) => (
                  <tr key={svc.service} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="px-4 py-2 text-gray-400">{svc.service}</td>
                    <td className="px-4 py-2 text-gray-200">{svc.name}</td>
                    <td className="px-4 py-2 text-gray-400">{svc.category}</td>
                    <td className="px-4 py-2 text-green-400">${svc.rate}</td>
                    <td className="px-4 py-2 text-gray-400">{svc.min}</td>
                    <td className="px-4 py-2 text-gray-400">{svc.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add API Provider" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Provider Name" placeholder="e.g., JustAnotherPanel" error={errors.name?.message} required {...register("name")} />
          <Input label="API URL" placeholder="https://provider.com/api/v2" error={errors.apiUrl?.message} required {...register("apiUrl")} />
          <Input label="API Key" type="password" placeholder="Your API key" error={errors.apiKey?.message} required {...register("apiKey")} />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Description (optional)</label>
            <textarea
              placeholder="Notes about this provider..."
              className="w-full rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none h-20"
              {...register("description")}
            />
          </div>
          <Button type="submit" fullWidth gradient loading={isSubmitting}>
            Add Provider
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { toast.success("Provider removed"); setDeleteTarget(null); }}
        title="Remove Provider"
        message="Are you sure you want to remove this API provider? Connected services will be unlinked."
        variant="danger"
      />
    </div>
  );
}
