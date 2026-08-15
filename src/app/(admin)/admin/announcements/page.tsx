"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const schema = z.object({
  title:   z.string().min(3),
  content: z.string().min(10),
  type:    z.enum(["info","success","warning","danger"]),
});
type AnnouncementForm = z.infer<typeof schema>;

const ANNOUNCEMENTS: any[] = [];
const TYPE_OPTIONS = [
  { value: "info",    label: "Info (Blue)" },
  { value: "success", label: "Success (Green)" },
  { value: "warning", label: "Warning (Yellow)" },
  { value: "danger",  label: "Alert (Red)" },
];

export default function AdminAnnouncementsPage() {
  const [addOpen, setAddOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AnnouncementForm>({
    resolver: zodResolver(schema),
    defaultValues: { type: "info" },
  });

  const onSubmit = async (data: AnnouncementForm) => {
    try {
      await fetch("/api/admin/announcements", { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
      toast.success("Announcement created!");
      setAddOpen(false);
      reset();
    } catch { toast.error("Failed to create announcement"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white">Announcements</h1>
          <p className="text-gray-400 text-sm">Broadcast messages to all users</p>
        </div>
        <Button gradient size="sm" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
          New Announcement
        </Button>
      </div>

      {ANNOUNCEMENTS.length === 0 ? (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-2xl flex flex-col items-center justify-center py-20 text-center">
          <BellRing size={32} className="text-gray-600 mb-3" />
          <p className="text-gray-400 font-medium">No announcements yet</p>
          <p className="text-gray-500 text-sm mb-4">Create an announcement to inform all users</p>
          <Button size="sm" gradient icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
            Create Announcement
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.id} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={a.type === "success" ? "success" : a.type === "warning" ? "warning" : a.type === "danger" ? "danger" : "info"} size="sm">
                      {a.type}
                    </Badge>
                    {a.isActive && <Badge variant="success" size="sm">Active</Badge>}
                  </div>
                  <p className="font-semibold text-white text-sm">{a.title}</p>
                  <p className="text-gray-400 text-xs mt-1">{a.content}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-blue-400"><Edit size={13} /></button>
                  <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-amber-400">{a.isActive ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                  <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-red-400"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create Announcement" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" placeholder="e.g., Scheduled Maintenance" error={errors.title?.message} required {...register("title")} />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Message</label>
            <textarea
              placeholder="Announcement message visible to all users..."
              className="w-full rounded-xl border border-surface-border dark:border-surface-border-dark bg-white dark:bg-surface-card-dark text-sm text-gray-900 dark:text-white p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none h-24"
              {...register("content")}
            />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
          </div>
          <Select label="Type" options={TYPE_OPTIONS} {...register("type")} />
          <Button type="submit" fullWidth gradient loading={isSubmitting}>Publish Announcement</Button>
        </form>
      </Modal>
    </div>
  );
}
